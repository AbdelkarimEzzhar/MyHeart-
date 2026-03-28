const express = require('express');
const router = express.Router();
const logger = require('./logger');
const {
    getDoctor, getAllDoctors,
    getPatient, getAllPatients,
    getAssignmentsByPatient, getAssignmentsByDoctor, getAllAssignments,
    getCacheDiagnostics
} = require('./cache');

// ─── Doctor endpoints ───

router.get('/doctors', (req, res) => {
    try {
        const doctors = getAllDoctors();
        logger.info(`✓ Retrieved ${doctors.length} doctors from cache`);
        res.json({
            count: doctors.length,
            doctors
        });
    } catch (error) {
        logger.error('Error retrieving doctors:', error);
        res.status(500).json({ error: 'Failed to retrieve doctors' });
    }
});

router.get('/doctors/:doctorId', (req, res) => {
    try {
        const { doctorId } = req.params;
        const doctor = getDoctor(doctorId);

        if (!doctor) {
            return res.status(404).json({ error: 'Doctor not found in context cache' });
        }

        logger.info(`✓ Retrieved doctor from cache: ${doctorId}`);
        res.json(doctor);
    } catch (error) {
        logger.error('Error retrieving doctor:', error);
        res.status(500).json({ error: 'Failed to retrieve doctor' });
    }
});

router.get('/doctors/specialty/:specialty', (req, res) => {
    try {
        const { specialty } = req.params;
        const doctors = getAllDoctors().filter(d => d.specialty === specialty);
        logger.info(`✓ Retrieved ${doctors.length} doctors by specialty: ${specialty}`);
        res.json({
            specialty,
            count: doctors.length,
            doctors
        });
    } catch (error) {
        logger.error('Error retrieving doctors by specialty:', error);
        res.status(500).json({ error: 'Failed to retrieve doctors' });
    }
});

// ─── Patient endpoints ───

router.get('/patients', (req, res) => {
    try {
        const patients = getAllPatients();
        logger.info(`✓ Retrieved ${patients.length} patients from cache`);
        res.json({
            count: patients.length,
            patients
        });
    } catch (error) {
        logger.error('Error retrieving patients:', error);
        res.status(500).json({ error: 'Failed to retrieve patients' });
    }
});

router.get('/patients/:patientId', (req, res) => {
    try {
        const { patientId } = req.params;
        const patient = getPatient(patientId);

        if (!patient) {
            return res.status(404).json({ error: 'Patient not found in context cache' });
        }

        logger.info(`✓ Retrieved patient from cache: ${patientId}`);
        res.json(patient);
    } catch (error) {
        logger.error('Error retrieving patient:', error);
        res.status(500).json({ error: 'Failed to retrieve patient' });
    }
});

// ─── Patient-Doctor Assignment endpoints ───

router.get('/assignments', (req, res) => {
    try {
        const assignments = getAllAssignments();
        logger.info(`✓ Retrieved ${assignments.length} assignments from cache`);
        res.json({
            count: assignments.length,
            assignments
        });
    } catch (error) {
        logger.error('Error retrieving assignments:', error);
        res.status(500).json({ error: 'Failed to retrieve assignments' });
    }
});

router.get('/assignments/patient/:patientId', (req, res) => {
    try {
        const { patientId } = req.params;
        const assignments = getAssignmentsByPatient(patientId);
        logger.info(`✓ Retrieved ${assignments.length} assignments for patient: ${patientId}`);
        res.json({
            patientId,
            count: assignments.length,
            assignments
        });
    } catch (error) {
        logger.error('Error retrieving patient assignments:', error);
        res.status(500).json({ error: 'Failed to retrieve assignments' });
    }
});

router.get('/assignments/doctor/:doctorId', (req, res) => {
    try {
        const { doctorId } = req.params;
        const assignments = getAssignmentsByDoctor(doctorId);
        logger.info(`✓ Retrieved ${assignments.length} assignments for doctor: ${doctorId}`);
        res.json({
            doctorId,
            count: assignments.length,
            assignments
        });
    } catch (error) {
        logger.error('Error retrieving doctor assignments:', error);
        res.status(500).json({ error: 'Failed to retrieve assignments' });
    }
});

// ─── Diagnostics ───

router.get('/diagnostics', (req, res) => {
    try {
        const diagnostics = getCacheDiagnostics();
        logger.info('✓ Cache diagnostics retrieved');
        res.json(diagnostics);
    } catch (error) {
        logger.error('Error retrieving diagnostics:', error);
        res.status(500).json({ error: 'Failed to retrieve diagnostics' });
    }
});

module.exports = router;
