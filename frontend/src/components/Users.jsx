import React, { useEffect, useState } from 'react';
import API from '../api/axios';

export default function Users() {
    const [list, setList] = useState([]);
    const [form, setForm] = useState({ username: '', password: '', role: 'doctor' });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const load = async () => {
        setLoading(true);
        try {
            const { data } = await API.get('/auth/users');
            setList(data);
        } catch (e) { setError(e.response?.data?.error || e.message); }
        setLoading(false);
    };

    useEffect(() => { load(); }, []);

    const submit = async (e) => {
        e.preventDefault();
        setError(null);
        try {
            await API.post('/auth/users', form);
            setForm({ username: '', password: '', role: 'doctor' });
            load();
        } catch (e) { setError(e.response?.data?.error || e.message); }
    };

    return (
        <div className="section">
            <h2>👥 User Management</h2>
            <form onSubmit={submit} className="form-grid">
                <input placeholder="Username" value={form.username} onChange={e => setForm({ ...form, username: e.target.value })} required />
                <input placeholder="Password" type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} required />
                <select value={form.role} onChange={e => setForm({ ...form, role: e.target.value })}>
                    <option value="doctor">Doctor</option>
                    <option value="caissiere">Caissiere</option>
                    <option value="admin">Admin</option>
                </select>
                <div className="form-actions">
                    <button className="btn btn-primary" type="submit">Create User</button>
                </div>
            </form>

            {loading ? <p className="loading">Loading...</p> : (
                <div className="table-wrapper">
                    <table>
                        <thead>
                            <tr><th>Username</th><th>Role</th></tr>
                        </thead>
                        <tbody>
                            {list.length === 0 ? (
                                <tr><td colSpan={2} className="empty">No users</td></tr>
                            ) : list.map(u => (
                                <tr key={u.username}><td>{u.username}</td><td>{u.role}</td></tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
            {error && <p className="error">{error}</p>}
        </div>
    );
}
