package com.myheart.doctor.controller;

import com.myheart.doctor.model.Doctor;
import com.myheart.doctor.service.DoctorService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/doctors")
@RequiredArgsConstructor
@Slf4j
public class DoctorController {

    private final DoctorService doctorService;

    @PostMapping
    public ResponseEntity<Doctor> createDoctor(@RequestBody Doctor doctor) {
        log.info("POST /api/doctors - Creating doctor: {}", doctor.getFirstName());
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(doctorService.createDoctor(doctor));
    }

    @GetMapping
    public ResponseEntity<List<Doctor>> getAllDoctors() {
        log.info("GET /api/doctors - Fetching all doctors");
        return ResponseEntity.ok(doctorService.getAllDoctors());
    }

    @GetMapping("/{doctorId}")
    public ResponseEntity<Doctor> getDoctorById(@PathVariable String doctorId) {
        log.info("GET /api/doctors/{} - Fetching doctor", doctorId);
        return ResponseEntity.ok(doctorService.getDoctorById(doctorId));
    }

    @GetMapping("/specialty/{specialty}")
    public ResponseEntity<List<Doctor>> getDoctorsBySpecialty(@PathVariable String specialty) {
        log.info("GET /api/doctors/specialty/{} - Fetching doctors by specialty", specialty);
        return ResponseEntity.ok(doctorService.getDoctorsBySpecialty(specialty));
    }

    @GetMapping("/department/{department}")
    public ResponseEntity<List<Doctor>> getDoctorsByDepartment(@PathVariable String department) {
        log.info("GET /api/doctors/department/{} - Fetching doctors by department", department);
        return ResponseEntity.ok(doctorService.getDoctorsByDepartment(department));
    }

    @PutMapping("/{doctorId}")
    public ResponseEntity<Doctor> updateDoctor(
            @PathVariable String doctorId,
            @RequestBody Doctor doctorDetails) {
        log.info("PUT /api/doctors/{} - Updating doctor", doctorId);
        return ResponseEntity.ok(doctorService.updateDoctor(doctorId, doctorDetails));
    }

    @DeleteMapping("/{doctorId}")
    public ResponseEntity<Map<String, String>> deleteDoctor(@PathVariable String doctorId) {
        log.info("DELETE /api/doctors/{} - Deleting doctor", doctorId);
        doctorService.deleteDoctor(doctorId);
        return ResponseEntity.ok(Map.of("message", "Doctor deleted successfully"));
    }

    // ─── Patient-Doctor Assignment (SAGA) ───

    @PostMapping("/{doctorId}/patients/{patientId}")
    public ResponseEntity<Map<String, String>> assignPatientToDoctor(
            @PathVariable String doctorId,
            @PathVariable String patientId,
            @RequestBody Map<String, String> payload) {
        log.info("POST /api/doctors/{}/patients/{} - Assigning patient to doctor", doctorId, patientId);
        
        String patientFirstName = payload.getOrDefault("patientFirstName", "");
        String patientLastName = payload.getOrDefault("patientLastName", "");
        String doctorFirstName = payload.getOrDefault("doctorFirstName", "");
        String doctorLastName = payload.getOrDefault("doctorLastName", "");
        
        doctorService.assignPatientToDoctor(patientId, doctorId, patientFirstName, patientLastName, 
                                           doctorFirstName, doctorLastName);
        
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(Map.of("message", "Patient assigned to doctor successfully"));
    }

    @DeleteMapping("/{doctorId}/patients/{patientId}")
    public ResponseEntity<Map<String, String>> unassignPatientFromDoctor(
            @PathVariable String doctorId,
            @PathVariable String patientId,
            @RequestBody Map<String, String> payload) {
        log.info("DELETE /api/doctors/{}/patients/{} - Unassigning patient from doctor", doctorId, patientId);
        
        String doctorFirstName = payload.getOrDefault("doctorFirstName", "");
        String doctorLastName = payload.getOrDefault("doctorLastName", "");
        
        doctorService.unassignPatientFromDoctor(patientId, doctorId, doctorFirstName, doctorLastName);
        
        return ResponseEntity.ok(Map.of("message", "Patient unassigned from doctor successfully"));
    }

    // Health check
    @GetMapping("/health")
    public ResponseEntity<Map<String, String>> health() {
        return ResponseEntity.ok(Map.of("status", "UP", "service", "doctor-service"));
    }
}
