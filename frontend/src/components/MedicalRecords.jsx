import React, { useEffect, useState } from 'react';
import API from '../api/axios';

const EMPTY = {
    patientId: '', patientName: '', doctorId: '', doctorName: '',
    visitDate: '', diagnosis: '', treatment: '', notes: '', recordType: 'consultation'
};

export default function MedicalRecords() {
    const [list, setList] = useState([]);
    const [patients, setPatients] = useState([]);
    const [doctors, setDoctors] = useState([]);
    const [form, setForm] = useState(EMPTY);
    const [editId, setEditId] = useState(null);
    const [loading, setLoading] = useState(false);

    const loadPatients = async () => {
        try { const { data } = await API.get('/api/patients'); setPatients(data); }
        catch (e) { console.error('Error loading patients:', e); }
    };

    const loadDoctors = async () => {
        try { const { data } = await API.get('/api/doctors'); setDoctors(data); }
        catch (e) { console.error('Error loading doctors:', e); }
    };

    const load = async () => {
        setLoading(true);
        try { const { data } = await API.get('/api/medical-records'); setList(data); }
        catch (e) { console.error(e); }
        setLoading(false);
    };

    useEffect(() => { loadPatients(); loadDoctors(); load(); }, []);

    const submit = async (e) => {
        e.preventDefault();
        try {
            if (editId) { await API.put(`/api/medical-records/${editId}`, form); }
            else { await API.post('/api/medical-records', form); }
            setForm(EMPTY); setEditId(null); load();
        } catch (e) { console.error(e); }
    };

    const edit = (r) => {
        setEditId(r.id);
        setForm({
            patientId: r.patientId, patientName: r.patientName,
            doctorId: r.doctorId || '', doctorName: r.doctorName || '',
            visitDate: r.visitDate, diagnosis: r.diagnosis || '',
            treatment: r.treatment || '', notes: r.notes || '', recordType: r.recordType || 'consultation'
        });
    };

    const remove = async (id) => {
        if (!window.confirm('Delete this record?')) return;
        await API.delete(`/api/medical-records/${id}`); load();
    };

    return (
        <div className="section">
            <h2>📋 Medical Records</h2>
            <form onSubmit={submit}>
                <div className="form-grid">
                    <select value={form.patientId} onChange={e => {
                        const patient = patients.find(p => p.id === parseInt(e.target.value));
                        setForm({ ...form, patientId: e.target.value, patientName: patient ? `${patient.firstName} ${patient.lastName}` : '' });
                    }} required>
                        <option value="">-- Select Patient --</option>
                        {patients.map(p => <option key={p.id} value={p.id}>{p.firstName} {p.lastName}</option>)}
                    </select>
                    <select value={form.doctorId} onChange={e => {
                        const doctor = doctors.find(d => d.id === parseInt(e.target.value));
                        setForm({ ...form, doctorId: e.target.value, doctorName: doctor ? `${doctor.firstName} ${doctor.lastName}` : '' });
                    }} required>
                        <option value="">-- Select Doctor --</option>
                        {doctors.map(d => <option key={d.id} value={d.id}>{d.firstName} {d.lastName} ({d.specialty})</option>)}
                    </select>
                    <input type="date" value={form.visitDate}
                        onChange={e => setForm({ ...form, visitDate: e.target.value })} required />
                    <select value={form.recordType}
                        onChange={e => setForm({ ...form, recordType: e.target.value })}>
                        <option value="consultation">Consultation</option>
                        <option value="emergency">Emergency</option>
                        <option value="follow-up">Follow-up</option>
                        <option value="surgery">Surgery</option>
                    </select>
                    <textarea placeholder="Diagnosis" value={form.diagnosis}
                        onChange={e => setForm({ ...form, diagnosis: e.target.value })} />
                    <textarea placeholder="Treatment" value={form.treatment}
                        onChange={e => setForm({ ...form, treatment: e.target.value })} />
                    <textarea placeholder="Notes" value={form.notes}
                        onChange={e => setForm({ ...form, notes: e.target.value })} />
                    <div className="form-actions">
                        <button type="submit" className="btn btn-primary">
                            {editId ? '✏️ Update' : '➕ Add Record'}
                        </button>
                        {editId && (
                            <button type="button" className="btn btn-secondary"
                                onClick={() => { setEditId(null); setForm(EMPTY); }}>Cancel</button>
                        )}
                    </div>
                </div>
            </form>

            {loading ? <p className="loading">Loading...</p> : (
                <div className="table-wrapper">
                    <table>
                        <thead>
                            <tr>
                                <th>Patient</th><th>Doctor</th><th>Visit Date</th>
                                <th>Type</th><th>Diagnosis</th><th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {list.length === 0
                                ? <tr><td colSpan={6} className="empty">No medical records found</td></tr>
                                : list.map(r => (
                                    <tr key={r.id}>
                                        <td>{r.patientName}</td>
                                        <td>{r.doctorName}</td>
                                        <td>{r.visitDate}</td>
                                        <td><span className="badge badge-scheduled">{r.recordType}</span></td>
                                        <td>{r.diagnosis?.substring(0, 60)}{r.diagnosis?.length > 60 ? '...' : ''}</td>
                                        <td>
                                            <div className="actions">
                                                <button className="btn btn-warning btn-sm" onClick={() => edit(r)}>✏️</button>
                                                <button className="btn btn-danger btn-sm" onClick={() => remove(r.id)}>🗑️</button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            }
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
