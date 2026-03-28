const { Kafka } = require('kafkajs');
const logger = require('./logger');
const {
    addDoctor, updateDoctor, deleteDoctor,
    addPatient, updatePatient, deletePatient,
    addAssignment, removeAssignment,
    initializeCache
} = require('./cache');

const KAFKA_BROKERS = (process.env.KAFKA_BROKERS || 'localhost:9092').split(',');
const CONSUMER_GROUP_ID = 'context-service-group';

// Topics to subscribe to
const TOPICS = [
    'doctor.events',
    'patient.events',
    'patient-doctor.assigned',
    'patient-doctor.unassigned'
];

let kafka;
let consumer;
let connected = false;

const initializeKafkaConsumer = async () => {
    try {
        // Initialize cache first
        initializeCache();

        // Create Kafka instance
        kafka = new Kafka({
            clientId: 'context-service',
            brokers: KAFKA_BROKERS,
            retry: {
                retries: 5,
                maxRetryTime: 30000,
                initialRetryTime: 300
            }
        });

        // Create consumer
        consumer = kafka.consumer({ groupId: CONSUMER_GROUP_ID });

        // Connect
        await consumer.connect();
        logger.info(`✓ Connected to Kafka at ${KAFKA_BROKERS.join(', ')}`);
        connected = true;

        // Subscribe to topics
        await consumer.subscribe({ topics: TOPICS });
        logger.info(`✓ Subscribed to topics: ${TOPICS.join(', ')}`);

        // Run consumer
        await consumer.run({
            eachMessage: async ({ topic, partition, message }) => {
                try {
                    const value = JSON.parse(message.value.toString());
                    logger.info(`📨 Message received from topic "${topic}": ${value.eventType}`);

                    switch (topic) {
                        case 'doctor.events':
                            await handleDoctorEvent(value);
                            break;
                        case 'patient.events':
                            await handlePatientEvent(value);
                            break;
                        case 'patient-doctor.assigned':
                            await handlePatientDoctorAssignment(value);
                            break;
                        case 'patient-doctor.unassigned':
                            await handlePatientDoctorUnassignment(value);
                            break;
                        default:
                            logger.warn(`Unknown topic: ${topic}`);
                    }
                } catch (error) {
                    logger.error(`Error processing message from topic ${topic}:`, error);
                }
            }
        });

        logger.info('✓ Kafka consumer running');

    } catch (error) {
        logger.error('Failed to initialize Kafka consumer:', error);
        throw error;
    }
};

// Event handlers
const handleDoctorEvent = async (event) => {
    const { eventType, doctorId, firstName, lastName, specialty, email, phone, department } = event;

    switch (eventType) {
        case 'doctor.created':
            addDoctor(doctorId, {
                id: doctorId,
                firstName,
                lastName,
                specialty,
                email,
                phone,
                department
            });
            logger.info(`✓ Doctor cached after creation: ${firstName} ${lastName}`);
            break;

        case 'doctor.updated':
            updateDoctor(doctorId, {
                firstName,
                lastName,
                specialty,
                email,
                phone,
                department
            });
            logger.info(`✓ Doctor cache updated: ${doctorId}`);
            break;

        case 'doctor.deleted':
            deleteDoctor(doctorId);
            logger.info(`✓ Doctor removed from cache: ${doctorId}`);
            break;

        default:
            logger.warn(`Unknown doctor event type: ${eventType}`);
    }
};

const handlePatientEvent = async (event) => {
    const { eventType, patientId, firstName, lastName, email, phone, doctorId, dateOfBirth } = event;

    switch (eventType) {
        case 'patient.created':
            addPatient(patientId, {
                id: patientId,
                firstName,
                lastName,
                email,
                phone,
                doctorId,
                dateOfBirth
            });
            logger.info(`✓ Patient cached after creation: ${firstName} ${lastName}`);
            break;

        case 'patient.updated':
            updatePatient(patientId, {
                firstName,
                lastName,
                email,
                phone,
                doctorId,
                dateOfBirth
            });
            logger.info(`✓ Patient cache updated: ${patientId}`);
            break;

        case 'patient.deleted':
            deletePatient(patientId);
            logger.info(`✓ Patient removed from cache: ${patientId}`);
            break;

        default:
            logger.warn(`Unknown patient event type: ${eventType}`);
    }
};

const handlePatientDoctorAssignment = async (event) => {
    const { patientId, doctorId, patientFirstName, patientLastName, doctorFirstName, doctorLastName } = event;

    addAssignment(patientId, doctorId, {
        patientFirstName,
        patientLastName,
        doctorFirstName,
        doctorLastName
    });
    logger.info(`✓ Assignment cached: ${patientFirstName} -> ${doctorFirstName}`);
};

const handlePatientDoctorUnassignment = async (event) => {
    const { patientId, doctorId } = event;

    removeAssignment(patientId, doctorId);
    logger.info(`✓ Assignment removed from cache: ${patientId} -> ${doctorId}`);
};

// Graceful disconnect
const disconnectConsumer = async () => {
    if (consumer && connected) {
        await consumer.disconnect();
        logger.info('✓ Kafka consumer disconnected');
    }
};

process.on('SIGINT', disconnectConsumer);
process.on('SIGTERM', disconnectConsumer);

module.exports = {
    initializeKafkaConsumer,
    disconnectConsumer
};
