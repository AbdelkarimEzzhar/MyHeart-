package com.myheart.medicalrecord.controller;

import com.myheart.medicalrecord.model.MedicalRecord;
import com.myheart.medicalrecord.service.MedicalRecordService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/medical-records")
@CrossOrigin(origins = "*")
public class MedicalRecordController {

    @Autowired
    private MedicalRecordService service;

    @GetMapping
    public ResponseEntity<List<MedicalRecord>> getAll(
            @RequestParam(required = false) String patientId,
            @RequestParam(required = false) String doctorId) {
        if (patientId != null) return ResponseEntity.ok(service.findByPatientId(patientId));
        if (doctorId  != null) return ResponseEntity.ok(service.findByDoctorId(doctorId));
        return ResponseEntity.ok(service.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<MedicalRecord> getById(@PathVariable Long id) {
        return service.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<MedicalRecord> create(@RequestBody MedicalRecord record) {
        return ResponseEntity.status(HttpStatus.CREATED).body(service.save(record));
    }

    @PutMapping("/{id}")
    public ResponseEntity<MedicalRecord> update(
            @PathVariable Long id,
            @RequestBody MedicalRecord updated) {
        return service.update(id, updated)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }
}
