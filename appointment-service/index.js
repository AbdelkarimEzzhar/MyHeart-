require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const axios = require('axios');
const os = require('os');

const app = express();
app.use(express.json());
app.use(cors());

// ── Database Connection ───────────────────────────────────────────────────────
const MONGO_URI = process.env.MONGO_URI;
mongoose.connect(MONGO_URI)
    .then(() => console.log('MongoDB connected (appointment-db)'))
    .catch(err => console.error('MongoDB error:', err));

// ── Schema ────────────────────────────────────────────────────────────────────
const appointmentSchema = new mongoose.Schema({
    patientId: { type: String, required: true },
    patientName: { type: String, required: true },
    doctorId: { type: String, required: true },
    doctorName: { type: String, required: true },
    date: { type: String, required: true },
    time: { type: String, required: true },
    reason: { type: String, default: '' },
    status: {
        type: String,
        enum: ['scheduled', 'completed', 'cancelled'],
        default: 'scheduled',
    },
    createdAt: { type: Date, default: Date.now },
});

const Appointment = mongoose.model('Appointment', appointmentSchema);

// ── Routes ────────────────────────────────────────────────────────────────────
// GET all
app.get('/api/appointments', async (req, res) => {
    try {
        const list = await Appointment.find().sort({ createdAt: -1 });
        res.json(list);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET by id
app.get('/api/appointments/:id', async (req, res) => {
    try {
        const appt = await Appointment.findById(req.params.id);
        if (!appt) return res.status(404).json({ error: 'Appointment not found' });
        res.json(appt);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST create
app.post('/api/appointments', async (req, res) => {
    try {
        const appt = new Appointment(req.body);
        const saved = await appt.save();
        res.status(201).json(saved);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// PUT update
app.put('/api/appointments/:id', async (req, res) => {
    try {
        const updated = await Appointment.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );
        if (!updated) return res.status(404).json({ error: 'Appointment not found' });
        res.json(updated);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// DELETE
app.delete('/api/appointments/:id', async (req, res) => {
    try {
        await Appointment.findByIdAndDelete(req.params.id);
        res.status(204).send();
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Health check
app.get('/health', (req, res) => res.json({ status: 'UP' }));

const PORT = process.env.PORT || 8082;
app.listen(PORT, () => console.log(`Appointment Service on port ${PORT}`));

// Register with Consul
const CONSUL_HOST = process.env.CONSUL_HOST || 'consul';
const CONSUL_PORT = process.env.CONSUL_PORT || '8500';
const SERVICE_NAME = process.env.SERVICE_NAME || 'appointment-service';
const SERVICE_PORT = process.env.SERVICE_PORT || PORT;
const SERVICE_ID = `${SERVICE_NAME}-${SERVICE_PORT}`;

async function registerWithConsul() {
    const url = `http://${CONSUL_HOST}:${CONSUL_PORT}/v1/agent/service/register`;
    const payload = {
        Name: SERVICE_NAME,
        ID: SERVICE_ID,
        Address: SERVICE_NAME,
        Port: Number(SERVICE_PORT),
        Check: {
            HTTP: `http://${SERVICE_NAME}:${SERVICE_PORT}/health`,
            Interval: '10s',
            DeregisterCriticalServiceAfter: '1m'
        }
    };
    try {
        await axios.put(url, payload, { timeout: 5000 });
        console.log(`Registered ${SERVICE_NAME} with Consul at ${CONSUL_HOST}:${CONSUL_PORT}`);
    } catch (err) {
        console.error('Failed to register with Consul:', err.message || err);
    }
}

async function deregisterFromConsul() {
    try {
        const url = `http://${CONSUL_HOST}:${CONSUL_PORT}/v1/agent/service/deregister/${SERVICE_ID}`;
        await axios.put(url, null, { timeout: 5000 });
        console.log(`Deregistered ${SERVICE_ID} from Consul`);
    } catch (err) {
        console.error('Failed to deregister from Consul:', err.message || err);
    }
}

// register now (best-effort)
registerWithConsul();

process.on('SIGINT', async () => {
    await deregisterFromConsul();
    process.exit(0);
});
process.on('SIGTERM', async () => {
    await deregisterFromConsul();
    process.exit(0);
});
