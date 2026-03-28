import React, { useEffect, useState } from 'react';
import API from '../api/axios';

const EMPTY = {
    patientId: '', patientName: '', appointmentId: '',
    description: '', amount: ''
};

export default function Billing() {
    const [list, setList] = useState([]);
    const [patients, setPatients] = useState([]);
    const [appointments, setAppointments] = useState([]);
    const [form, setForm] = useState(EMPTY);
    const [loading, setLoading] = useState(false);

    const loadPatients = async () => {
        try { const { data } = await API.get('/api/patients'); setPatients(data); }
        catch (e) { console.error('Error loading patients:', e); }
    };

    const loadAppointments = async () => {
        try { const { data } = await API.get('/api/appointments'); setAppointments(data); }
        catch (e) { console.error('Error loading appointments:', e); }
    };

    const load = async () => {
        setLoading(true);
        try { const { data } = await API.get('/api/billing'); setList(data); }
        catch (e) { console.error(e); }
        setLoading(false);
    };

    useEffect(() => { loadPatients(); loadAppointments(); load(); }, []);

    const submit = async (e) => {
        e.preventDefault();
        try { await API.post('/api/billing', form); setForm(EMPTY); load(); }
        catch (e) { console.error(e); }
    };

    const pay = async (id) => { await API.put(`/api/billing/${id}/pay`); load(); };
    const cancel = async (id) => { await API.put(`/api/billing/${id}/cancel`); load(); };
    const remove = async (id) => {
        if (!window.confirm('Delete this invoice?')) return;
        await API.delete(`/api/billing/${id}`); load();
    };

    const badgeClass = (s) => ({
        PENDING: 'badge badge-pending',
        PAID: 'badge badge-paid',
        CANCELLED: 'badge badge-cancelled',
    }[s] || 'badge');

    return (
        <div className="section">
            <h2>💳 Billing Management</h2>
            <form onSubmit={submit}>
                <div className="form-grid">
                    <select value={form.patientId} onChange={e => {
                        const patient = patients.find(p => p.id === parseInt(e.target.value));
                        setForm({ ...form, patientId: e.target.value, patientName: patient ? `${patient.firstName} ${patient.lastName}` : '', appointmentId: '' });
                    }} required>
                        <option value="">-- Select Patient --</option>
                        {patients.map(p => <option key={p.id} value={p.id}>{p.firstName} {p.lastName}</option>)}
                    </select>
                    <select value={form.appointmentId} onChange={e => {
                        const appt = appointments.find(a => a._id === e.target.value);
                        setForm({ ...form, appointmentId: e.target.value });
                    }}>
                        <option value="">-- Select Appointment (optional) --</option>
                        {appointments.filter(a => a.patientId === form.patientId).map(a => (
                            <option key={a._id} value={a._id}>
                                {a.date} {a.time} - {a.doctorName}
                            </option>
                        ))}
                    </select>
                    <input placeholder="Description" value={form.description}
                        onChange={e => setForm({ ...form, description: e.target.value })} />
                    <input placeholder="Amount *" type="number" step="0.01" value={form.amount}
                        onChange={e => setForm({ ...form, amount: e.target.value })} required />
                    <div className="form-actions">
                        <button type="submit" className="btn btn-primary">➕ Create Invoice</button>
                    </div>
                </div>
            </form>

            {loading ? <p className="loading">Loading...</p> : (
                <div className="table-wrapper">
                    <table>
                        <thead>
                            <tr>
                                <th>Patient</th><th>Description</th><th>Amount</th>
                                <th>Status</th><th>Date</th><th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {list.length === 0
                                ? <tr><td colSpan={6} className="empty">No invoices found</td></tr>
                                : list.map(i => (
                                    <tr key={i.id}>
                                        <td>{i.patientName}</td>
                                        <td>{i.description}</td>
                                        <td>${Number(i.amount).toFixed(2)}</td>
                                        <td><span className={badgeClass(i.status)}>{i.status}</span></td>
                                        <td>{new Date(i.createdAt).toLocaleDateString()}</td>
                                        <td>
                                            <div className="actions">
                                                {i.status === 'PENDING' && (
                                                    <>
                                                        <button className="btn btn-success btn-sm" onClick={() => pay(i.id)}>✅ Pay</button>
                                                        <button className="btn btn-warning btn-sm" onClick={() => cancel(i.id)}>❌ Cancel</button>
                                                    </>
                                                )}
                                                <button className="btn btn-danger btn-sm" onClick={() => remove(i.id)}>🗑️</button>
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
