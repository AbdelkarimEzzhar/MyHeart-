package com.myheart.billing.repository;

import com.myheart.billing.model.Invoice;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface InvoiceRepository extends JpaRepository<Invoice, Long> {
    List<Invoice> findByPatientId(String patientId);
    List<Invoice> findByStatus(Invoice.PaymentStatus status);
}
