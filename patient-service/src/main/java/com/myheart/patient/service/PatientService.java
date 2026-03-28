package com.myheart.patient.service;

import com.myheart.patient.event.PatientEvent;
import com.myheart.patient.model.Patient;
import com.myheart.patient.repository.PatientRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class PatientService {

    private final PatientRepository patientRepository;
    private final KafkaProducerService kafkaProducerService;

    public List<Patient> findAll() {
        return patientRepository.findAll();
    }

    public Optional<Patient> findById(Long id) {
        return patientRepository.findById(id);
    }

    public Patient save(Patient patient) {
        log.info("Creating patient: {} {}", patient.getFirstName(), patient.getLastName());
        
        Patient savedPatient = patientRepository.save(patient);

        // Publish patient.created event
        PatientEvent event = PatientEvent.builder()
                .eventType("patient.created")
                .patientId(savedPatient.getId())
                .firstName(savedPatient.getFirstName())
                .lastName(savedPatient.getLastName())
                .email(savedPatient.getEmail())
                .phone(savedPatient.getPhone())
                .dateOfBirth(savedPatient.getDateOfBirth())
                .doctoId(savedPatient.getDoctorId())
                .build();
        
        kafkaProducerService.publishPatientEvent(event);
        log.info("✓ Patient created with ID: {}", savedPatient.getId());
        
        return savedPatient;
    }

    public Optional<Patient> update(Long id, Patient updated) {
        log.info("Updating patient: {}", id);
        
        return patientRepository.findById(id).map(existing -> {
            existing.setFirstName(updated.getFirstName());
            existing.setLastName(updated.getLastName());
            existing.setEmail(updated.getEmail());
            existing.setPhone(updated.getPhone());
            existing.setDateOfBirth(updated.getDateOfBirth());
            existing.setBloodType(updated.getBloodType());
            existing.setAddress(updated.getAddress());
            existing.setGender(updated.getGender());
            existing.setDoctorId(updated.getDoctorId());
            
            Patient updatedPatient = patientRepository.save(existing);

            // Publish patient.updated event
            PatientEvent event = PatientEvent.builder()
                    .eventType("patient.updated")
                    .patientId(updatedPatient.getId())
                    .firstName(updatedPatient.getFirstName())
                    .lastName(updatedPatient.getLastName())
                    .email(updatedPatient.getEmail())
                    .phone(updatedPatient.getPhone())
                    .dateOfBirth(updatedPatient.getDateOfBirth())
                    .doctoId(updatedPatient.getDoctorId())
                    .build();
            
            kafkaProducerService.publishPatientEvent(event);
            log.info("✓ Patient updated: {}", id);
            
            return updatedPatient;
        });
    }

    public void delete(Long id) {
        log.info("Deleting patient: {}", id);
        
        patientRepository.findById(id).ifPresentOrElse(
            patient -> {
                patientRepository.deleteById(id);

                // Publish patient.deleted event
                PatientEvent event = PatientEvent.builder()
                        .eventType("patient.deleted")
                        .patientId(id)
                        .firstName(patient.getFirstName())
                        .lastName(patient.getLastName())
                        .build();
                
                kafkaProducerService.publishPatientEvent(event);
                log.info("✓ Patient deleted: {}", id);
            },
            () -> log.warn("Patient not found for deletion: {}", id)
        );
    }

    public List<Patient> searchByLastName(String lastName) {
        return patientRepository.findByLastNameContainingIgnoreCase(lastName);
    }
}
