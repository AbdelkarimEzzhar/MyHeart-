package com.myheart.patient.event;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PatientEvent {
    private String eventId;
    private String eventType; // patient.created, patient.updated, patient.deleted
    private Long patientId;
    private String firstName;
    private String lastName;
    private String email;
    private String phone;
    private LocalDate dateOfBirth;
    private String doctoId; // Can be null
    private LocalDateTime timestamp;
    
    @JsonProperty("source")
    private String source = "patient-service";
}
