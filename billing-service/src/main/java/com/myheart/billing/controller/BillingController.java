package com.myheart.billing.controller;

import com.myheart.billing.model.Invoice;
import com.myheart.billing.service.BillingService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/billing")
@CrossOrigin(origins = "*")
public class BillingController {

    @Autowired
    private BillingService billingService;

    @GetMapping
    public ResponseEntity<List<Invoice>> getAll(
            @RequestParam(required = false) String patientId) {
        if (patientId != null) {
            return ResponseEntity.ok(billingService.findByPatientId(patientId));
        }
        return ResponseEntity.ok(billingService.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Invoice> getById(@PathVariable Long id) {
        return billingService.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<Invoice> create(@RequestBody Invoice invoice) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(billingService.save(invoice));
    }

    @PutMapping("/{id}/pay")
    public ResponseEntity<Invoice> pay(@PathVariable Long id) {
        return billingService.markAsPaid(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}/cancel")
    public ResponseEntity<Invoice> cancel(@PathVariable Long id) {
        return billingService.cancel(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        billingService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
