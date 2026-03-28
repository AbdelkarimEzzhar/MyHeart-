require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const http = require('http');
const https = require('https');
const url = require('url');
const axios = require('axios');
const CircuitBreaker = require('opossum');

const app = express();
app.use(cors());
app.use(morgan('dev'));

// NOTE: don't parse JSON globally — let proxy forward raw request bodies.
// Use JSON parsing only on internal auth routes that need parsed body.

const jwt = require('jsonwebtoken');

const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');

// Ensure data directory exists
const DATA_DIR = '/app/data';
if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
}

const USERS_FILE = path.join(DATA_DIR, 'users.json');

function loadUsers() {
    try {
        if (!fs.existsSync(USERS_FILE)) return [];
        const raw = fs.readFileSync(USERS_FILE, 'utf8');
        return JSON.parse(raw || '[]');
    } catch (e) {
        console.error('Failed to load users:', e);
        return [];
    }
}

function saveUsers(users) {
    try {
        fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2), 'utf8');
    } catch (e) {
        console.error('Failed to save users:', e);
    }
}

function findUser(username) {
    const users = loadUsers();
    return users.find(u => u.username === username);
}

function createUser({ username, password, role }) {
    const users = loadUsers();
    if (users.find(u => u.username === username)) throw new Error('user exists');
    const hash = bcrypt.hashSync(password, 10);
    const u = { username, passwordHash: hash, role };
    users.push(u);
    saveUsers(users);
    return u;
}


// Secret user (override with env vars)
const JWT_SECRET = process.env.JWT_SECRET;
const DEFAULT_USER = process.env.AUTH_USER;
const DEFAULT_PASS = process.env.AUTH_PASS;

// ensure default admin exists and matches env password when provided
if (DEFAULT_USER && DEFAULT_PASS) {
    const existing = findUser(DEFAULT_USER);
    if (!existing) {
        console.log('Creating default admin user');
        try { createUser({ username: DEFAULT_USER, password: DEFAULT_PASS, role: 'admin' }); }
        catch (e) { console.error('Could not create default admin:', e.message); }
    } else {
        // update password to match provided env (best-effort)
        try {
            const users = loadUsers();
            const idx = users.findIndex(u => u.username === DEFAULT_USER);
            if (idx >= 0) {
                users[idx].passwordHash = bcrypt.hashSync(DEFAULT_PASS, 10);
                saveUsers(users);
                console.log('Updated admin password from environment');
            }
        } catch (e) {
            console.error('Could not update admin password:', e.message);
        }
    }
}

// Simple login route: POST /auth/login { username, password } -> { token }
app.post('/auth/login', express.json(), (req, res) => {
    const { username, password } = req.body || {};
    if (!username || !password) return res.status(400).json({ error: 'username and password required' });
    const user = findUser(username);
    if (!user) return res.status(401).json({ error: 'invalid credentials' });
    if (!bcrypt.compareSync(password, user.passwordHash)) return res.status(401).json({ error: 'invalid credentials' });
    const token = jwt.sign({ sub: username, role: user.role }, JWT_SECRET, { expiresIn: '8h' });
    return res.json({ token });
});

// Admin-only middleware
function adminOnly(req, res, next) {
    if (!req.user || req.user.role !== 'admin') return res.status(403).json({ error: 'admin_required' });
    return next();
}

// User management endpoints (admin only)
app.get('/auth/users', authMiddleware, adminOnly, (req, res) => {
    const users = loadUsers().map(u => ({ username: u.username, role: u.role }));
    res.json(users);
});

app.post('/auth/users', authMiddleware, adminOnly, express.json(), (req, res) => {
    const { username, password, role } = req.body || {};
    if (!username || !password || !role) return res.status(400).json({ error: 'username,password,role required' });
    if (!['doctor', 'caissiere', 'admin'].includes(role)) return res.status(400).json({ error: 'invalid role' });
    try {
        const u = createUser({ username, password, role });
        return res.status(201).json({ username: u.username, role: u.role });
    } catch (e) {
        return res.status(409).json({ error: e.message });
    }
});

// Auth middleware for /api routes
function authMiddleware(req, res, next) {
    const auth = req.headers.authorization || '';
    const match = auth.match(/^Bearer\s+(.*)$/i);
    if (!match) return res.status(401).json({ error: 'missing authorization header' });
    const token = match[1];
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded;
        return next();
    } catch (e) {
        return res.status(401).json({ error: 'invalid or expired token' });
    }
}

// Protect all /api/* routes via the gateway
app.use('/api', authMiddleware);

// ── Dynamic Service Discovery via Consul + Opossum Circuit Breakers ─────────

const CONSUL_HOST = process.env.CONSUL_HOST || 'consul';
const CONSUL_PORT = parseInt(process.env.CONSUL_PORT || '8500', 10);


// route -> consul service name mapping
const routeConfig = [
    { prefix: '/api/patients', serviceName: 'patient-service' },
    { prefix: '/api/appointments', serviceName: 'appointment-service' },
    { prefix: '/api/billing', serviceName: 'billing-service' },
    { prefix: '/api/medical-records', serviceName: 'medical-record-service' },
    { prefix: '/api/lab-reports', serviceName: 'lab-report-service' },
    { prefix: '/api/doctors', serviceName: 'doctor-service' },
];

// In-memory cache of healthy instances: serviceName -> [ { address, port } ]
const serviceCache = new Map();
const rrIndex = new Map(); // round-robin index per service

// Circuit breakers per serviceName
const circuits = new Map();

// Circuit options: trip after 5 failed requests within 10s, try half-open after 30s
const circuitOptions = {
    timeout: 15000, // per-request timeout

    resetTimeout: 30, // try half-open after 30s
    rollingCountTimeout: 10, // 10s rolling window
    volumeThreshold: 5,
};

function log(...args) { console.log('[Gateway]', ...args); }

// Choose a healthy target for a service (round-robin)
function chooseTarget(serviceName) {
    const instances = serviceCache.get(serviceName) || [];
    if (!instances.length) return null;
    const idx = rrIndex.get(serviceName) || 0;
    const chosen = instances[idx % instances.length];
    rrIndex.set(serviceName, (idx + 1) % instances.length);
    return `http://${chosen.address}:${chosen.port}`;
}

// Proxy using native http/https and return a promise for circuit
function proxyToTarget(target, req, res) {
    return new Promise((resolve, reject) => {
        try {
            const parsed = url.parse(target);
            const isHttps = parsed.protocol === 'https:';
            const port = parsed.port || (isHttps ? 443 : 80);
            const options = {
                hostname: parsed.hostname,
                port: port,
                path: req.originalUrl, // preserve original path so upstreams with /api/* mappings work
                method: req.method,
                headers: Object.assign({}, req.headers, { host: parsed.host }),
            };

            const proxyReq = (isHttps ? https : http).request(options, (proxyRes) => {
                res.statusCode = proxyRes.statusCode;
                Object.entries(proxyRes.headers || {}).forEach(([k, v]) => res.setHeader(k, v));
                proxyRes.on('end', () => resolve());
                proxyRes.on('error', (err) => reject(err));
                proxyRes.pipe(res, { end: true });
            });

            proxyReq.on('error', (err) => reject(err));
            proxyReq.setTimeout(15000, () => {
                proxyReq.destroy(new Error('Upstream request timed out'));
            });

            // Pipe request body to upstream
            req.pipe(proxyReq);
        } catch (err) {
            reject(err);
        }
    });
}

// Create circuit for a serviceName with the proxy action
function getCircuitForService(serviceName) {
    if (circuits.has(serviceName)) return circuits.get(serviceName);
    const action = ({ req, res, target }) => proxyToTarget(target, req, res);
    const circuit = new CircuitBreaker(action, circuitOptions);

    circuit.on('open', () => log(`Circuit OPEN for ${serviceName}`));
    circuit.on('halfOpen', () => log(`Circuit HALF-OPEN for ${serviceName}`));
    circuit.on('close', () => log(`Circuit CLOSED for ${serviceName}`));
    circuit.fallback(() => { /* fallback handled at middleware level */ });

    circuits.set(serviceName, circuit);
    return circuit;
}

// Refresh healthy instances for a service from Consul
async function refreshServiceInstances(serviceName) {
    try {
        const url = `http://${CONSUL_HOST}:${CONSUL_PORT}/v1/health/service/${serviceName}?passing=1`;
        const resp = await axios.get(url, { timeout: 5000 });
        const res = resp.data || [];
        const instances = (res || []).map((entry) => {
            const svc = entry.Service || {};
            const node = entry.Node || {};
            const address = svc.Address || node.Address || '127.0.0.1';
            return { address, port: svc.Port };
        }).filter(i => i.port);
        serviceCache.set(serviceName, instances);
        if (!rrIndex.has(serviceName)) rrIndex.set(serviceName, 0);
    } catch (err) {
        log(`Failed to refresh ${serviceName} from Consul:`, err.message || err);
        // leave existing cache in place to allow graceful degradation
    }
}

async function refreshAllServices() {
    await Promise.all(routeConfig.map(rc => refreshServiceInstances(rc.serviceName)));
}

// Initialize circuits for each service
routeConfig.forEach(rc => getCircuitForService(rc.serviceName));

// Periodically refresh service catalog
const REFRESH_INTERVAL = 10000; // 10s
setInterval(() => refreshAllServices(), REFRESH_INTERVAL).unref();

// Attempt initial consul refresh with retry logic
async function initConsul() {
    const maxRetries = 12;
    let attempt = 0;
    while (attempt < maxRetries) {
        try {
            log(`Connecting to Consul at ${CONSUL_HOST}:${CONSUL_PORT} (attempt ${attempt + 1})`);
            await refreshAllServices();
            log('Service catalog initialized from Consul');
            return;
        } catch (err) {
            log('Consul unavailable:', err.message || err);
            attempt += 1;
            await new Promise(r => setTimeout(r, 2000 * attempt));
        }
    }
    log('Proceeding without fresh Consul catalog — will continue retries in background');
}

initConsul();

// Register routes dynamically using the serviceCache and circuits
routeConfig.forEach(({ prefix, serviceName }) => {
    const circuit = getCircuitForService(serviceName);
    app.use(prefix, (req, res) => {
        const instances = serviceCache.get(serviceName) || [];
        if (!instances.length) {
            return res.status(503).json({ error: 'Service unavailable', detail: 'no healthy instances' });
        }

        // If circuit is open, return immediately
        if (circuit.opened === true) {
            return res.status(503).json({ error: 'Service temporarily unavailable (circuit open)' });
        }

        const target = chooseTarget(serviceName);
        if (!target) return res.status(503).json({ error: 'Service unavailable' });

        // Fire the circuit which will proxy the request
        circuit.fire({ req, res, target }).catch((err) => {
            log(`Proxy error for ${serviceName}:`, err.message || err);
            if (!res.headersSent) res.status(503).json({ error: 'Service unavailable' });
        });
    });
});

// Health endpoint showing gateway + cached services + circuit states
app.get('/health', (req, res) => {
    const services = {};
    routeConfig.forEach(({ prefix, serviceName }) => {
        services[serviceName] = {
            prefix,
            instances: serviceCache.get(serviceName) || [],
            circuit: {
                opened: circuits.get(serviceName).opened || false,
                stats: circuits.get(serviceName).stats || {},
            },
        };
    });

    res.json({ status: 'UP', timestamp: new Date().toISOString(), consul: { host: CONSUL_HOST, port: CONSUL_PORT }, services });
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
    console.log(` API Gateway running on http://localhost:${PORT}`);
});
