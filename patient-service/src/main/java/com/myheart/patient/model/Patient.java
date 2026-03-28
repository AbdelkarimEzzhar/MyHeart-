package com.myheart.patient.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "patients")
public class Patient {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "First name is required")
    @Column(nullable = false)
    private String firstName;

    @NotBlank(message = "Last name is required")
    @Column(nullable = false)
    private String lastName;

    @Email(message = "Email must be valid")
    @Column(unique = true)
    private String email;

    private String phone;
    private LocalDate dateOfBirth;
    private String bloodType;
    private String address;
    private String gender;
    
    // ── Doctor assignment ──────────────────────────────────────────────────────
    @Column(name = "doctor_id")
    private String doctorId;

    @Column(updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();
    
    private LocalDateTime updatedAt = LocalDateTime.now();

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    // ── Getters & Setters ──────────────────────────────────────────────────────
    public Long getId()                        { return id; }
    public void setId(Long id)                 { this.id = id; }
    public String getFirstName()               { return firstName; }
    public void setFirstName(String v)         { this.firstName = v; }
    public String getLastName()                { return lastName; }
    public void setLastName(String v)          { this.lastName = v; }
    public String getEmail()                   { return email; }
    public void setEmail(String v)             { this.email = v; }
    public String getPhone()                   { return phone; }
    public void setPhone(String v)             { this.phone = v; }
    public LocalDate getDateOfBirth()          { return dateOfBirth; }
    public void setDateOfBirth(LocalDate v)    { this.dateOfBirth = v; }
    public String getBloodType()               { return bloodType; }
    public void setBloodType(String v)         { this.bloodType = v; }
    public String getAddress()                 { return address; }
    public void setAddress(String v)           { this.address = v; }
    public String getGender()                  { return gender; }
    public void setGender(String v)            { this.gender = v; }
    public String getDoctorId()                { return doctorId; }
    public void setDoctorId(String v)          { this.doctorId = v; }
    public LocalDateTime getCreatedAt()        { return createdAt; }
    public void setCreatedAt(LocalDateTime v)  { this.createdAt = v; }
    public LocalDateTime getUpdatedAt()        { return updatedAt; }
    public void setUpdatedAt(LocalDateTime v)  { this.updatedAt = v; }
}

