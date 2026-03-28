import React, { useEffect, useState } from 'react';
import API from '../api/axios';

const EMPTY = {
    firstName: '', lastName: '', specialty: '', email: '',
    phone: '', department: ''
};

export default function Doctors() {
    const [doctors, setDoctors] = useState([]);
    const [form, setForm] = useState(EMPTY);
    const [editId, setEditId] = useState(null);
    const [loading, setLoading] = useState(false);

    const load = async () => {
        setLoading(true);
        try {
            const { data } = await API.get('/api/doctors');
            setDoctors(data);
        } catch (e) { console.error(e); }
        setLoading(false);
    };

    useEffect(() => { load(); }, []);

    const submit = async (e) => {
        e.preventDefault();
        try {
            if (editId) { await API.put(`/api/doctors/${editId}`, form); }
            else { await API.post('/api/doctors', form); }
            setForm(EMPTY);
            setEditId(null);
            load();
        } catch (e) { console.error(e); }
    };

    const edit = (d) => {
        setEditId(d.id);
        setForm({
            firstName: d.firstName || '', lastName: d.lastName || '', specialty: d.specialty || '',
            email: d.email || '', phone: d.phone || '', department: d.department || ''
        });
    };

    const remove = async (id) => {
        if (!window.confirm('Delete this doctor?')) return;
        await API.delete(`/api/doctors/${id}`);
        load();
    };

    return (
        <div className="section">
            <h2>👨‍⚕️ Doctor Management</h2>
            <form onSubmit={submit}>
                <div className="form-grid">
                    <input placeholder="First Name *" value={form.firstName}
                        onChange={e => setForm({ ...form, firstName: e.target.value })} required />
                    <input placeholder="Last Name *" value={form.lastName}
                        onChange={e => setForm({ ...form, lastName: e.target.value })} required />
                    <input placeholder="Specialty *" value={form.specialty}
                        onChange={e => setForm({ ...form, specialty: e.target.value })} required />
                    <input placeholder="Email" type="email" value={form.email}
                        onChange={e => setForm({ ...form, email: e.target.value })} />
                    <input placeholder="Phone" type="tel" value={form.phone}
                        onChange={e => setForm({ ...form, phone: e.target.value })} />
                    <input placeholder="Department" value={form.department}
                        onChange={e => setForm({ ...form, department: e.target.value })} />

                    <div className="form-actions">
                        <button type="submit" className="btn btn-primary">
                            {editId ? '✏️ Update' : '➕ Add Doctor'}
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

            <table>
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Specialty</th>
                        <th>Email</th>
                        <th>Phone</th>
                        <th>Department</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {doctors.map(d => (
                        <tr key={d.id}>
                            <td>{d.firstName} {d.lastName}</td>
                            <td>{d.specialty}</td>
                            <td>{d.email}</td>
                            <td>{d.phone}</td>
                            <td>{d.department || '-'}</td>
                            <td>
                                <div className="actions">
                                    <button className="btn btn-warning btn-sm" onClick={() => edit(d)}>✏️</button>
                                    <button className="btn btn-danger btn-sm" onClick={() => remove(d.id)}>🗑️</button>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
