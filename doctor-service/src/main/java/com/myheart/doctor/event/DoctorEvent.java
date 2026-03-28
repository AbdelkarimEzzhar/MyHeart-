package com.myheart.doctor.event;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DoctorEvent {
    private String eventId;
    private String eventType; // doctor.created, doctor.updated, etc.
    private String doctorId;
    private String firstName;
    private String lastName;
    private String specialty;
    private String email;
    private String phone;
    private String department;
    private LocalDateTime timestamp;
    
    @JsonProperty("source")
    private String source = "doctor-service";
}
