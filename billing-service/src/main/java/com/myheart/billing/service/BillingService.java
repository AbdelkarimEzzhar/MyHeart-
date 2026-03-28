package com.myheart.billing.service;

import com.myheart.billing.model.Invoice;
import com.myheart.billing.repository.InvoiceRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;

@Service
public class BillingService {

    @Autowired
    private InvoiceRepository invoiceRepository;

    public List<Invoice> findAll()                        { return invoiceRepository.findAll(); }
    public Optional<Invoice> findById(Long id)            { return invoiceRepository.findById(id); }
    public Invoice save(Invoice invoice)                  { return invoiceRepository.save(invoice); }
    public List<Invoice> findByPatientId(String pid)      { return invoiceRepository.findByPatientId(pid); }

    public Optional<Invoice> markAsPaid(Long id) {
        return invoiceRepository.findById(id).map(inv -> {
            inv.setStatus(Invoice.PaymentStatus.PAID);
            return invoiceRepository.save(inv);
        });
    }

    public Optional<Invoice> cancel(Long id) {
        return invoiceRepository.findById(id).map(inv -> {
            inv.setStatus(Invoice.PaymentStatus.CANCELLED);
            return invoiceRepository.save(inv);
        });
    }

    public void delete(Long id) { invoiceRepository.deleteById(id); }
}
