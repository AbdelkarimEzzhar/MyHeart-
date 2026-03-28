package com.myheart.billing.model;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "invoices")
public class Invoice {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String patientId;

    @Column(nullable = false)
    private String patientName;

    private String appointmentId;
    private String description;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal amount;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private PaymentStatus status = PaymentStatus.PENDING;

    @Column(updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    public enum PaymentStatus { PENDING, PAID, CANCELLED }

    // ── Getters & Setters ──────────────────────────────────────────────────────
    public Long getId()                            { return id; }
    public void setId(Long id)                     { this.id = id; }
    public String getPatientId()                   { return patientId; }
    public void setPatientId(String v)             { this.patientId = v; }
    public String getPatientName()                 { return patientName; }
    public void setPatientName(String v)           { this.patientName = v; }
    public String getAppointmentId()               { return appointmentId; }
    public void setAppointmentId(String v)         { this.appointmentId = v; }
    public String getDescription()                 { return description; }
    public void setDescription(String v)           { this.description = v; }
    public BigDecimal getAmount()                  { return amount; }
    public void setAmount(BigDecimal v)            { this.amount = v; }
    public PaymentStatus getStatus()               { return status; }
    public void setStatus(PaymentStatus v)         { this.status = v; }
    public LocalDateTime getCreatedAt()            { return createdAt; }
    public void setCreatedAt(LocalDateTime v)      { this.createdAt = v; }
}
