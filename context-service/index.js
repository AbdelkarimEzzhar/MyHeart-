const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
require('dotenv').config();

const { initializeKafkaConsumer } = require('./kafkaConsumer');
const { cache } = require('./cache');
const routes = require('./routes');
const logger = require('./logger');

const app = express();
const PORT = process.env.PORT || 8087;

// Middleware
app.use(cors());
app.use(express.json());
app.use(morgan('combined', { stream: { write: message => logger.info(message.trim()) } }));

// Routes
app.use('/api/context', routes);

// Health check
app.get('/health', (req, res) => {
    res.json({
        status: 'UP',
        service: 'context-service',
        timestamp: new Date().toISOString(),
        cacheSize: cache.getKeys().length
    });
});

// Readiness probe
app.get('/ready', (req, res) => {
    if (cache.getKeys().length > 0 || !process.env.REQUIRE_CACHE_WARM) {
        res.json({ ready: true });
    } else {
        res.status(503).json({ ready: false, message: 'Cache not warmed up yet' });
    }
});

// Metrics
app.get('/metrics', (req, res) => {
    res.json({
        doctors: cache.get('doctors') ? Object.keys(cache.get('doctors')).length : 0,
        patients: cache.get('patients') ? Object.keys(cache.get('patients')).length : 0,
        assignments: cache.get('assignments') ? cache.get('assignments').length : 0,
        timestamp: new Date().toISOString()
    });
});

// Start Kafka Consumer
const startService = async () => {
    try {
        logger.info('🚀 Starting Context Service...');

        await initializeKafkaConsumer();
        logger.info('✓ Kafka Consumer initialized');

        app.listen(PORT, () => {
            logger.info(`✓ Context Service listening on port ${PORT}`);
            logger.info(`✓ Health check: http://localhost:${PORT}/health`);
            logger.info(`✓ Kafka UI: http://localhost:8090`);
        });
    } catch (error) {
        logger.error('Failed to start Context Service:', error);
        process.exit(1);
    }
};

// Graceful shutdown
process.on('SIGTERM', async () => {
    logger.info('SIGTERM signal received: closing HTTP server');
    process.exit(0);
});

process.on('SIGINT', async () => {
    logger.info('SIGINT signal received: closing HTTP server');
    process.exit(0);
});

startService();
