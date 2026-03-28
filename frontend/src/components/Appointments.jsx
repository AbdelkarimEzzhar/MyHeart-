import React, { useEffect, useState } from 'react';
import API from '../api/axios';

const EMPTY = {
    patientId: '', patientName: '', doctorId: '',
    doctorName: '', date: '', time: '', reason: '', status: 'scheduled'
};

export default function Appointments() {
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
        try { const { data } = await API.get('/api/appointments'); setList(data); }
        catch (e) { console.error(e); }
        setLoading(false);
    };

    useEffect(() => { loadPatients(); loadDoctors(); load(); }, []);

    const submit = async (e) => {
        e.preventDefault();
        try {
            if (editId) { await API.put(`/api/appointments/${editId}`, form); }
            else { await API.post('/api/appointments', form); }
            setForm(EMPTY); setEditId(null); load();
        } catch (e) { console.error(e); }
    };

    const edit = (a) => {
        setEditId(a._id);
        setForm({
            patientId: a.patientId, patientName: a.patientName,
            doctorId: a.doctorId, doctorName: a.doctorName,
            date: a.date, time: a.time, reason: a.reason || '', status: a.status
        });
    };

    const remove = async (id) => {
        if (!window.confirm('Delete this appointment?')) return;
        await API.delete(`/api/appointments/${id}`); load();
    };

    const badgeClass = (s) => ({
        scheduled: 'badge badge-scheduled',
        completed: 'badge badge-completed',
        cancelled: 'badge badge-cancelled',
    }[s] || 'badge');

    return (
        <div className="section">
            <h2>📅 Appointment Management</h2>
            <form onSubmit={submit}>
                <div className="form-grid">
                    <select value={form.patientId} onChange={e => {
                        const patient = patients.find(p => String(p.id) === String(e.target.value));
                        setForm({ ...form, patientId: e.target.value, patientName: patient ? `${patient.firstName} ${patient.lastName}` : '' });
                    }} required>
                        <option value="">-- Select Patient --</option>
                        {patients.map(p => <option key={p.id} value={p.id}>{p.firstName} {p.lastName}</option>)}
                    </select>
                    <select value={form.doctorId} onChange={e => {
                        const doctor = doctors.find(d => String(d.id) === String(e.target.value));
                        setForm({ ...form, doctorId: e.target.value, doctorName: doctor ? `${doctor.firstName} ${doctor.lastName}` : '' });
                    }} required>
                        <option value="">-- Select Doctor --</option>
                        {doctors.map(d => <option key={d.id} value={d.id}>{d.firstName} {d.lastName} ({d.specialty})</option>)}
                    </select>
                    <input type="date" value={form.date}
                        onChange={e => setForm({ ...form, date: e.target.value })} required />
                    <input type="time" value={form.time}
                        onChange={e => setForm({ ...form, time: e.target.value })} required />
                    <select value={form.status}
                        onChange={e => setForm({ ...form, status: e.target.value })}>
                        <option value="scheduled">Scheduled</option>
                        <option value="completed">Completed</option>
                        <option value="cancelled">Cancelled</option>
                    </select>
                    <input placeholder="Reason" value={form.reason}
                        onChange={e => setForm({ ...form, reason: e.target.value })} />
                    <div className="form-actions">
                        <button type="submit" className="btn btn-primary">
                            {editId ? '✏️ Update' : '➕ Add Appointment'}
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
                                <th>ID</th><th>Patient</th><th>Doctor</th><th>Date</th>
                                <th>Time</th><th>Reason</th><th>Status</th><th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {list.length === 0
                                ? <tr><td colSpan={8} className="empty">No appointments found</td></tr>
                                : list.map(a => (
                                    <tr key={a._id}>
                                        <td><code style={{ fontSize: '0.8em' }}>{a._id.substring(0, 8)}...</code></td>
                                        <td>{a.patientName}</td>
                                        <td>{a.doctorName}</td>
                                        <td>{a.date}</td>
                                        <td>{a.time}</td>
                                        <td>{a.reason}</td>
                                        <td><span className={badgeClass(a.status)}>{a.status}</span></td>
                                        <td>
                                            <div className="actions">
                                                <button className="btn btn-warning btn-sm" onClick={() => edit(a)}>✏️</button>
                                                <button className="btn btn-danger btn-sm" onClick={() => remove(a._id)}>🗑️</button>
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
