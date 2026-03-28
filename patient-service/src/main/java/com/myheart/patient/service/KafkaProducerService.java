package com.myheart.patient.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.myheart.patient.event.PatientEvent;
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

    public void publishPatientEvent(PatientEvent event) {
        try {
            event.setEventId(UUID.randomUUID().toString());
            event.setTimestamp(LocalDateTime.now());
            String message = objectMapper.writeValueAsString(event);
            
            kafkaTemplate.send("patient.events", event.getPatientId().toString(), message)
                .whenComplete((result, ex) -> {
                    if (ex == null) {
                        log.info("✓ Patient event published: {} - eventType: {}", 
                            event.getPatientId(), event.getEventType());
                    } else {
                        log.error("✗ Failed to publish patient event: {}", ex.getMessage());
                    }
                });
        } catch (Exception e) {
            log.error("Error serializing patient event: {}", e.getMessage());
        }
    }
}
