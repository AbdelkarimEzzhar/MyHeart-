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
public class PatientDoctorAssignmentEvent {
    private String eventId;
    private String eventType; // patient-doctor.assigned, patient-doctor.unassigned
    private String patientId;
    private String doctorId;
    private String patientFirstName;
    private String patientLastName;
    private String doctorFirstName;
    private String doctorLastName;
    private LocalDateTime timestamp;
    
    @JsonProperty("source")
    private String source = "doctor-service";
}
