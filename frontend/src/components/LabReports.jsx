import React, { useEffect, useState } from 'react';
import API from '../api/axios';

const EMPTY = {
    patientId: '', patientName: '', doctorId: '', doctorName: '',
    testType: '', status: 'pending', notes: '', resultValue: '', resultUnit: ''
};

export default function LabReports() {
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
        try { const { data } = await API.get('/api/lab-reports'); setList(data); }
        catch (e) { console.error(e); }
        setLoading(false);
    };

    useEffect(() => { loadPatients(); loadDoctors(); load(); }, []);

    const submit = async (e) => {
        e.preventDefault();
        const payload = {
            patientId: form.patientId,
            patientName: form.patientName,
            doctorId: form.doctorId,
            doctorName: form.doctorName,
            testType: form.testType,
            status: form.status,
            notes: form.notes,
            results: { value: form.resultValue, unit: form.resultUnit }
        };
        try {
            if (editId) { await API.put(`/api/lab-reports/${editId}`, payload); }
            else { await API.post('/api/lab-reports', payload); }
            setForm(EMPTY); setEditId(null); load();
        } catch (e) { console.error(e); }
    };

    const edit = (r) => {
        setEditId(r.id);
        setForm({
            patientId: r.patientId, patientName: r.patientName,
            doctorId: r.doctorId || '', doctorName: r.doctorName || '',
            testType: r.testType, status: r.status, notes: r.notes || '',
            resultValue: r.results?.value || '', resultUnit: r.results?.unit || ''
        });
    };

    const remove = async (id) => {
        if (!window.confirm('Delete this lab report?')) return;
        await API.delete(`/api/lab-reports/${id}`); load();
    };

    const badgeClass = (s) => ({
        pending: 'badge badge-pending',
        completed: 'badge badge-completed',
        reviewed: 'badge badge-reviewed',
    }[s] || 'badge');

    return (
        <div className="section">
            <h2>🧪 Lab Report Management</h2>
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
                    <input placeholder="Test Type *" value={form.testType}
                        onChange={e => setForm({ ...form, testType: e.target.value })} required />
                    <input placeholder="Result Value" value={form.resultValue}
                        onChange={e => setForm({ ...form, resultValue: e.target.value })} />
                    <input placeholder="Result Unit (mg/dL, etc.)" value={form.resultUnit}
                        onChange={e => setForm({ ...form, resultUnit: e.target.value })} />
                    <select value={form.status}
                        onChange={e => setForm({ ...form, status: e.target.value })}>
                        <option value="pending">Pending</option>
                        <option value="completed">Completed</option>
                        <option value="reviewed">Reviewed</option>
                    </select>
                    <textarea placeholder="Notes" value={form.notes}
                        onChange={e => setForm({ ...form, notes: e.target.value })} />
                    <div className="form-actions">
                        <button type="submit" className="btn btn-primary">
                            {editId ? '✏️ Update' : '➕ Add Lab Report'}
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
                                <th>Patient</th><th>Test Type</th><th>Result</th>
                                <th>Status</th><th>Notes</th><th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {list.length === 0
                                ? <tr><td colSpan={6} className="empty">No lab reports found</td></tr>
                                : list.map(r => (
                                    <tr key={r.id}>
                                        <td>{r.patientName}</td>
                                        <td>{r.testType}</td>
                                        <td>{r.results?.value} {r.results?.unit}</td>
                                        <td><span className={badgeClass(r.status)}>{r.status}</span></td>
                                        <td>{r.notes?.substring(0, 50)}{r.notes?.length > 50 ? '...' : ''}</td>
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
