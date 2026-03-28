package com.myheart.medicalrecord.service;

import com.myheart.medicalrecord.model.MedicalRecord;
import com.myheart.medicalrecord.repository.MedicalRecordRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;

@Service
public class MedicalRecordService {

    @Autowired
    private MedicalRecordRepository repo;

    public List<MedicalRecord> findAll()                    { return repo.findAll(); }
    public Optional<MedicalRecord> findById(Long id)        { return repo.findById(id); }
    public MedicalRecord save(MedicalRecord r)              { return repo.save(r); }
    public List<MedicalRecord> findByPatientId(String pid)  { return repo.findByPatientId(pid); }
    public List<MedicalRecord> findByDoctorId(String did)   { return repo.findByDoctorId(did); }

    public Optional<MedicalRecord> update(Long id, MedicalRecord updated) {
        return repo.findById(id).map(existing -> {
            existing.setPatientId(updated.getPatientId());
            existing.setPatientName(updated.getPatientName());
            existing.setDoctorId(updated.getDoctorId());
            existing.setDoctorName(updated.getDoctorName());
            existing.setVisitDate(updated.getVisitDate());
            existing.setDiagnosis(updated.getDiagnosis());
            existing.setTreatment(updated.getTreatment());
            existing.setNotes(updated.getNotes());
            existing.setRecordType(updated.getRecordType());
            return repo.save(existing);
        });
    }

    public void delete(Long id) { repo.deleteById(id); }
}
