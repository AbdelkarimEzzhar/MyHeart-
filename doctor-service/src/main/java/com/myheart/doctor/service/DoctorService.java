package com.myheart.doctor.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.myheart.doctor.event.DoctorEvent;
import com.myheart.doctor.event.PatientDoctorAssignmentEvent;
import com.myheart.doctor.model.Doctor;
import com.myheart.doctor.repository.DoctorRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;

@Service
@RequiredArgsConstructor
@Slf4j
public class DoctorService {

    private final DoctorRepository doctorRepository;
    private final KafkaProducerService kafkaProducerService;
    private final ObjectMapper objectMapper;

    @Transactional
    public Doctor createDoctor(Doctor doctor) {
        log.info("Creating doctor: {} {}", doctor.getFirstName(), doctor.getLastName());
        
        Doctor savedDoctor = doctorRepository.save(doctor);

        // Publish doctor.created event
        DoctorEvent event = DoctorEvent.builder()
                .eventType("doctor.created")
                .doctorId(savedDoctor.getId())
                .firstName(savedDoctor.getFirstName())
                .lastName(savedDoctor.getLastName())
                .specialty(savedDoctor.getSpecialty())
                .email(savedDoctor.getEmail())
                .phone(savedDoctor.getPhone())
                .department(savedDoctor.getDepartment())
                .build();
        
        kafkaProducerService.publishDoctorEvent(event);
        log.info("✓ Doctor created with ID: {}", savedDoctor.getId());
        
        return savedDoctor;
    }

    @Transactional
    public Doctor updateDoctor(String doctorId, Doctor doctorDetails) {
        log.info("Updating doctor: {}", doctorId);
        
        Doctor doctor = doctorRepository.findById(doctorId)
                .orElseThrow(() -> new RuntimeException("Doctor not found: " + doctorId));

        doctor.setFirstName(doctorDetails.getFirstName());
        doctor.setLastName(doctorDetails.getLastName());
        doctor.setSpecialty(doctorDetails.getSpecialty());
        doctor.setEmail(doctorDetails.getEmail());
        doctor.setPhone(doctorDetails.getPhone());
        doctor.setDepartment(doctorDetails.getDepartment());
        doctor.setSchedule(doctorDetails.getSchedule());

        Doctor updatedDoctor = doctorRepository.save(doctor);

        // Publish doctor.updated event
        DoctorEvent event = DoctorEvent.builder()
                .eventType("doctor.updated")
                .doctorId(updatedDoctor.getId())
                .firstName(updatedDoctor.getFirstName())
                .lastName(updatedDoctor.getLastName())
                .specialty(updatedDoctor.getSpecialty())
                .email(updatedDoctor.getEmail())
                .phone(updatedDoctor.getPhone())
                .department(updatedDoctor.getDepartment())
                .build();
        
        kafkaProducerService.publishDoctorEvent(event);
        log.info("✓ Doctor updated: {}", doctorId);
        
        return updatedDoctor;
    }

    public Doctor getDoctorById(String doctorId) {
        return doctorRepository.findById(doctorId)
                .orElseThrow(() -> new RuntimeException("Doctor not found: " + doctorId));
    }

    public List<Doctor> getAllDoctors() {
        return doctorRepository.findAll();
    }

    public List<Doctor> getDoctorsBySpecialty(String specialty) {
        return doctorRepository.findBySpecialty(specialty);
    }

    public List<Doctor> getDoctorsByDepartment(String department) {
        return doctorRepository.findByDepartment(department);
    }

    @Transactional
    public void deleteDoctor(String doctorId) {
        log.info("Deleting doctor: {}", doctorId);
        
        Doctor doctor = doctorRepository.findById(doctorId)
                .orElseThrow(() -> new RuntimeException("Doctor not found: " + doctorId));
        
        doctorRepository.delete(doctor);

        // Publish doctor.deleted event
        DoctorEvent event = DoctorEvent.builder()
                .eventType("doctor.deleted")
                .doctorId(doctorId)
                .firstName(doctor.getFirstName())
                .lastName(doctor.getLastName())
                .build();
        
        kafkaProducerService.publishDoctorEvent(event);
        log.info("✓ Doctor deleted: {}", doctorId);
    }

    // ─── Patient-Doctor Assignment (SAGA) ───

    @Transactional
    public void assignPatientToDoctor(String patientId, String doctorId, String patientFirstName, 
                                     String patientLastName, String doctorFirstName, String doctorLastName) {
        log.info("Assigning patient {} to doctor {}", patientId, doctorId);
        
        Doctor doctor = doctorRepository.findById(doctorId)
                .orElseThrow(() -> new RuntimeException("Doctor not found: " + doctorId));

        // Add patient to doctor's assigned patients list
        List<String> assignedPatients = new ArrayList<>();
        if (doctor.getAssignedPatients() != null && !doctor.getAssignedPatients().isEmpty()) {
            try {
                assignedPatients = Arrays.asList(
                    objectMapper.readValue(doctor.getAssignedPatients(), String[].class)
                );
                assignedPatients = new ArrayList<>(assignedPatients);
            } catch (Exception e) {
                log.warn("Could not parse assigned patients: {}", e.getMessage());
            }
        }

        if (!assignedPatients.contains(patientId)) {
            assignedPatients.add(patientId);
            try {
                doctor.setAssignedPatients(objectMapper.writeValueAsString(assignedPatients));
            } catch (Exception e) {
                log.error("Error serializing assigned patients: {}", e.getMessage());
            }
        }

        doctorRepository.save(doctor);

        // Publish patient-doctor.assigned event (SAGA initiation)
        PatientDoctorAssignmentEvent event = PatientDoctorAssignmentEvent.builder()
                .eventType("patient-doctor.assigned")
                .patientId(patientId)
                .doctorId(doctorId)
                .patientFirstName(patientFirstName)
                .patientLastName(patientLastName)
                .doctorFirstName(doctorFirstName)
                .doctorLastName(doctorLastName)
                .build();
        
        kafkaProducerService.publishPatientDoctorAssignmentEvent(event);
        log.info("✓ Patient {} assigned to doctor {}", patientId, doctorId);
    }

    @Transactional
    public void unassignPatientFromDoctor(String patientId, String doctorId, String doctorFirstName, 
                                         String doctorLastName) {
        log.info("Unassigning patient {} from doctor {}", patientId, doctorId);
        
        Doctor doctor = doctorRepository.findById(doctorId)
                .orElseThrow(() -> new RuntimeException("Doctor not found: " + doctorId));

        // Remove patient from doctor's assigned patients list
        if (doctor.getAssignedPatients() != null && !doctor.getAssignedPatients().isEmpty()) {
            try {
                List<String> assignedPatients = new ArrayList<>(Arrays.asList(
                    objectMapper.readValue(doctor.getAssignedPatients(), String[].class)
                ));
                assignedPatients.remove(patientId);
                doctor.setAssignedPatients(objectMapper.writeValueAsString(assignedPatients));
                doctorRepository.save(doctor);
            } catch (Exception e) {
                log.error("Error updating assigned patients: {}", e.getMessage());
            }
        }

        // Publish patient-doctor.unassigned event (SAGA compensation)
        PatientDoctorAssignmentEvent event = PatientDoctorAssignmentEvent.builder()
                .eventType("patient-doctor.unassigned")
                .patientId(patientId)
                .doctorId(doctorId)
                .doctorFirstName(doctorFirstName)
                .doctorLastName(doctorLastName)
                .build();
        
        kafkaProducerService.publishPatientDoctorAssignmentEvent(event);
        log.info("✓ Patient {} unassigned from doctor {}", patientId, doctorId);
    }
}
