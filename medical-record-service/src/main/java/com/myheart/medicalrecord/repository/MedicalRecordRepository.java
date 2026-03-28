package com.myheart.medicalrecord.repository;

import com.myheart.medicalrecord.model.MedicalRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface MedicalRecordRepository extends JpaRepository<MedicalRecord, Long> {
    List<MedicalRecord> findByPatientId(String patientId);
    List<MedicalRecord> findByDoctorId(String doctorId);
}
