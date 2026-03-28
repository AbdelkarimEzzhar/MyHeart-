package com.myheart.doctor.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.myheart.doctor.event.DoctorEvent;
import com.myheart.doctor.event.PatientDoctorAssignmentEvent;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class KafkaProducerService {

    private final KafkaTemplate<String, String> kafkaTemplate;
    private final ObjectMapper objectMapper;

    public void publishDoctorEvent(DoctorEvent event) {
        try {
            event.setEventId(UUID.randomUUID().toString());
            event.setTimestamp(LocalDateTime.now());
            String message = objectMapper.writeValueAsString(event);
            
            kafkaTemplate.send("doctor.events", event.getDoctorId(), message)
                .whenComplete((result, ex) -> {
                    if (ex == null) {
                        log.info("✓ Doctor event published: {} - eventType: {}", 
                            event.getDoctorId(), event.getEventType());
                    } else {
                        log.error("✗ Failed to publish doctor event: {}", ex.getMessage());
                    }
                });
        } catch (Exception e) {
            log.error("Error serializing doctor event: {}", e.getMessage());
        }
    }

    public void publishPatientDoctorAssignmentEvent(PatientDoctorAssignmentEvent event) {
        try {
            event.setEventId(UUID.randomUUID().toString());
            event.setTimestamp(LocalDateTime.now());
            String message = objectMapper.writeValueAsString(event);
            
            String topic = event.getEventType().startsWith("patient-doctor.assigned") 
                ? "patient-doctor.assigned" 
                : "patient-doctor.unassigned";
            
            kafkaTemplate.send(topic, event.getPatientId() + "-" + event.getDoctorId(), message)
                .whenComplete((result, ex) -> {
                    if (ex == null) {
                        log.info("✓ Patient-Doctor assignment event published: {} -> {} ({})", 
                            event.getPatientId(), event.getDoctorId(), event.getEventType());
                    } else {
                        log.error("✗ Failed to publish patient-doctor assignment event: {}", ex.getMessage());
                    }
                });
        } catch (Exception e) {
            log.error("Error serializing patient-doctor assignment event: {}", e.getMessage());
        }
    }
}
