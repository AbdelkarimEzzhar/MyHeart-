import React, { useEffect, useState } from 'react';
import API from '../api/axios';

const EMPTY = {
    firstName: '', lastName: '', email: '',
    phone: '', dateOfBirth: '', bloodType: '', address: '', gender: ''
};

export default function Patients() {
    const [patients, setPatients] = useState([]);
    const [form, setForm] = useState(EMPTY);
    const [editId, setEditId] = useState(null);
    const [loading, setLoading] = useState(false);

    const load = async () => {
        setLoading(true);
        try {
            const { data } = await API.get('/api/patients');
            setPatients(data);
        } catch (e) { console.error(e); }
        setLoading(false);
    };

    useEffect(() => { load(); }, []);

    const submit = async (e) => {
        e.preventDefault();
        try {
            if (editId) { await API.put(`/api/patients/${editId}`, form); }
            else { await API.post('/api/patients', form); }
            setForm(EMPTY);
            setEditId(null);
            load();
        } catch (e) { console.error(e); }
    };

    const edit = (p) => {
        setEditId(p.id);
        setForm({
            firstName: p.firstName, lastName: p.lastName, email: p.email,
            phone: p.phone || '', dateOfBirth: p.dateOfBirth || '',
            bloodType: p.bloodType || '', address: p.address || '', gender: p.gender || ''
        });
    };

    const remove = async (id) => {
        if (!window.confirm('Delete this patient?')) return;
        await API.delete(`/api/patients/${id}`);
        load();
    };

    return (
        <div className="section">
            <h2>👤 Patient Management</h2>
            <form onSubmit={submit}>
                <div className="form-grid">
                    <input placeholder="First Name *" value={form.firstName}
                        onChange={e => setForm({ ...form, firstName: e.target.value })} required />
                    <input placeholder="Last Name *" value={form.lastName}
                        onChange={e => setForm({ ...form, lastName: e.target.value })} required />
                    <input placeholder="Email *" type="email" value={form.email}
                        onChange={e => setForm({ ...form, email: e.target.value })} />
                    <input placeholder="Phone" value={form.phone}
                        onChange={e => setForm({ ...form, phone: e.target.value })} required />
                    <input placeholder="Date of Birth" type="date" value={form.dateOfBirth}
                        onChange={e => setForm({ ...form, dateOfBirth: e.target.value })} />
                    <select value={form.bloodType}
                        onChange={e => setForm({ ...form, bloodType: e.target.value })}>
                        <option value="">Blood Type</option>
                        {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(b => (
                            <option key={b} value={b}>{b}</option>
                        ))}
                    </select>
                    <select value={form.gender}
                        onChange={e => setForm({ ...form, gender: e.target.value })}>
                        <option value="">Gender</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                    </select>
                    <input placeholder="Address" value={form.address}
                        onChange={e => setForm({ ...form, address: e.target.value })} />
                    <div className="form-actions">
                        <button type="submit" className="btn btn-primary">
                            {editId ? '✏️ Update' : '➕ Add Patient'}
                        </button>
                        {editId && (
                            <button type="button" className="btn btn-secondary"
                                onClick={() => { setEditId(null); setForm(EMPTY); }}>
                                Cancel
                            </button>
                        )}
                    </div>
                </div>
            </form>

            {loading ? <p className="loading">Loading...</p> : (
                <div className="table-wrapper">
                    <table>
                        <thead>
                            <tr>
                                <th>Name</th><th>Email</th><th>Phone</th>
                                <th>Blood Type</th><th>Gender</th><th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {patients.length === 0
                                ? <tr><td colSpan={6} className="empty">No patients found</td></tr>
                                : patients.map(p => (
                                    <tr key={p.id}>
                                        <td>{p.firstName} {p.lastName}</td>
                                        <td>{p.email}</td>
                                        <td>{p.phone}</td>
                                        <td>{p.bloodType}</td>
                                        <td>{p.gender}</td>
                                        <td>
                                            <div className="actions">
                                                <button className="btn btn-warning btn-sm" onClick={() => edit(p)}>✏️</button>
                                                <button className="btn btn-danger btn-sm" onClick={() => remove(p.id)}>🗑️</button>
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
