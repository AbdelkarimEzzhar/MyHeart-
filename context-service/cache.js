const NodeCache = require('node-cache');
const logger = require('./logger');

// TTL: 1 hour
const cache = new NodeCache({ stdTTL: 3600 });

// Initialize cache structure
const initializeCache = () => {
    cache.set('doctors', {});           // doctorId -> doctor details
    cache.set('patients', {});          // patientId -> patient details
    cache.set('assignments', []);       // array of patient-doctor assignments
    logger.info('✓ Cache initialized');
};

// Doctor operations
const addDoctor = (doctorId, doctorData) => {
    const doctors = cache.get('doctors') || {};
    doctors[doctorId] = {
        ...doctorData,
        updatedAt: new Date().toISOString()
    };
    cache.set('doctors', doctors);
    logger.info(`✓ Doctor cached: ${doctorId} - ${doctorData.firstName} ${doctorData.lastName}`);
};

const updateDoctor = (doctorId, doctorData) => {
    const doctors = cache.get('doctors') || {};
    if (doctors[doctorId]) {
        doctors[doctorId] = {
            ...doctors[doctorId],
            ...doctorData,
            updatedAt: new Date().toISOString()
        };
        cache.set('doctors', doctors);
        logger.info(`✓ Doctor updated in cache: ${doctorId}`);
    }
};

const getDoctor = (doctorId) => {
    const doctors = cache.get('doctors') || {};
    return doctors[doctorId];
};

const getAllDoctors = () => {
    const doctors = cache.get('doctors') || {};
    return Object.values(doctors);
};

const deleteDoctor = (doctorId) => {
    const doctors = cache.get('doctors') || {};
    delete doctors[doctorId];
    cache.set('doctors', doctors);
    logger.info(`✓ Doctor removed from cache: ${doctorId}`);
};

// Patient operations
const addPatient = (patientId, patientData) => {
    const patients = cache.get('patients') || {};
    patients[patientId] = {
        ...patientData,
        updatedAt: new Date().toISOString()
    };
    cache.set('patients', patients);
    logger.info(`✓ Patient cached: ${patientId} - ${patientData.firstName} ${patientData.lastName}`);
};

const updatePatient = (patientId, patientData) => {
    const patients = cache.get('patients') || {};
    if (patients[patientId]) {
        patients[patientId] = {
            ...patients[patientId],
            ...patientData,
            updatedAt: new Date().toISOString()
        };
        cache.set('patients', patients);
        logger.info(`✓ Patient updated in cache: ${patientId}`);
    }
};

const getPatient = (patientId) => {
    const patients = cache.get('patients') || {};
    return patients[patientId];
};

const getAllPatients = () => {
    const patients = cache.get('patients') || {};
    return Object.values(patients);
};

const deletePatient = (patientId) => {
    const patients = cache.get('patients') || {};
    delete patients[patientId];
    cache.set('patients', patients);
    logger.info(`✓ Patient removed from cache: ${patientId}`);
};

// Assignment operations
const addAssignment = (patientId, doctorId, assignmentData) => {
    const assignments = cache.get('assignments') || [];
    const newAssignment = {
        id: `${patientId}-${doctorId}`,
        patientId,
        doctorId,
        ...assignmentData,
        assignedAt: new Date().toISOString()
    };
    assignments.push(newAssignment);
    cache.set('assignments', assignments);
    logger.info(`✓ Assignment cached: ${patientId} -> ${doctorId}`);
    return newAssignment;
};

const removeAssignment = (patientId, doctorId) => {
    const assignments = cache.get('assignments') || [];
    const filtered = assignments.filter(a => !(a.patientId === patientId && a.doctorId === doctorId));
    cache.set('assignments', filtered);
    logger.info(`✓ Assignment removed from cache: ${patientId} -> ${doctorId}`);
};

const getAssignmentsByPatient = (patientId) => {
    const assignments = cache.get('assignments') || [];
    return assignments.filter(a => a.patientId === patientId);
};

const getAssignmentsByDoctor = (doctorId) => {
    const assignments = cache.get('assignments') || [];
    return assignments.filter(a => a.doctorId === doctorId);
};

const getAllAssignments = () => {
    return cache.get('assignments') || [];
};

// Cache diagnostics
const getCacheDiagnostics = () => {
    const doctors = cache.get('doctors') || {};
    const patients = cache.get('patients') || {};
    const assignments = cache.get('assignments') || [];

    return {
        doctors: Object.keys(doctors).length,
        patients: Object.keys(patients).length,
        assignments: assignments.length,
        timestamp: new Date().toISOString()
    };
};

module.exports = {
    cache,
    initializeCache,

    // Doctor operations
    addDoctor,
    updateDoctor,
    getDoctor,
    getAllDoctors,
    deleteDoctor,

    // Patient operations
    addPatient,
    updatePatient,
    getPatient,
    getAllPatients,
    deletePatient,

    // Assignment operations
    addAssignment,
    removeAssignment,
    getAssignmentsByPatient,
    getAssignmentsByDoctor,
    getAllAssignments,

    // Diagnostics
    getCacheDiagnostics
};
