package com.myheart.medicalrecord.model;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "medical_records")
public class MedicalRecord {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String patientId;

    @Column(nullable = false)
    private String patientName;

    private String doctorId;
    private String doctorName;

    @Column(nullable = false)
    private LocalDate visitDate;

    @Column(columnDefinition = "TEXT")
    private String diagnosis;

    @Column(columnDefinition = "TEXT")
    private String treatment;

    @Column(columnDefinition = "TEXT")
    private String notes;

    private String recordType;   // consultation, emergency, follow-up, etc.

    @Column(updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    // ── Getters & Setters ──────────────────────────────────────────────────────
    public Long getId()                          { return id; }
    public void setId(Long id)                   { this.id = id; }
    public String getPatientId()                 { return patientId; }
    public void setPatientId(String v)           { this.patientId = v; }
    public String getPatientName()               { return patientName; }
    public void setPatientName(String v)         { this.patientName = v; }
    public String getDoctorId()                  { return doctorId; }
    public void setDoctorId(String v)            { this.doctorId = v; }
    public String getDoctorName()                { return doctorName; }
    public void setDoctorName(String v)          { this.doctorName = v; }
    public LocalDate getVisitDate()              { return visitDate; }
    public void setVisitDate(LocalDate v)        { this.visitDate = v; }
    public String getDiagnosis()                 { return diagnosis; }
    public void setDiagnosis(String v)           { this.diagnosis = v; }
    public String getTreatment()                 { return treatment; }
    public void setTreatment(String v)           { this.treatment = v; }
    public String getNotes()                     { return notes; }
    public void setNotes(String v)               { this.notes = v; }
    public String getRecordType()                { return recordType; }
    public void setRecordType(String v)          { this.recordType = v; }
    public LocalDateTime getCreatedAt()          { return createdAt; }
    public void setCreatedAt(LocalDateTime v)    { this.createdAt = v; }
}
