import React, { useState, useEffect } from 'react';
import Patients from './components/Patients';
import Appointments from './components/Appointments';
import Billing from './components/Billing';
import MedicalRecords from './components/MedicalRecords';
import LabReports from './components/LabReports';
import Doctors from './components/Doctors';
import Login from './components/Login';
import Users from './components/Users';

const TABS = [
    { key: 'patients', label: '👤 Patients' },
    { key: 'doctors', label: '👨‍⚕️ Doctors' },
    { key: 'appointments', label: '📅 Appointments' },
    { key: 'billing', label: '💳 Billing' },
    { key: 'medical-records', label: '📋 Medical Records' },
    { key: 'lab-reports', label: '🧪 Lab Reports' },
    { key: 'users', label: '👥 Users' },
];

export default function App() {
    const [active, setActive] = useState('patients');
    const [isAuth, setIsAuth] = useState(() => !!localStorage.getItem('token'));
    const [role, setRole] = useState(null);

    const parseRoleFromToken = () => {
        const t = localStorage.getItem('token');
        if (!t) return null;
        try {
            const parts = t.split('.');
            if (parts.length < 2) return null;
            const payload = parts[1].replace(/-/g, '+').replace(/_/g, '/');
            const json = decodeURIComponent(atob(payload).split('').map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)).join(''));
            const obj = JSON.parse(json);
            return obj.role || null;
        } catch (e) { return null; }
    };

    useEffect(() => { setRole(parseRoleFromToken()); }, [isAuth]);

    if (!isAuth) {
        return (
            <div className="app">
                <Login onLogin={() => setIsAuth(true)} />
            </div>
        );
    }

    return (
        <div className="app">
            <header className="header">
                <div className="header-title">
                    <span className="logo">🏥</span>
                    <h1>MyHeart Healthcare System</h1>
                </div>
                <nav className="nav">
                    {TABS.map(t => (
                        // hide Users tab unless admin
                        (t.key === 'users' && role !== 'admin') ? null : (
                            <button
                                key={t.key}
                                className={`nav-btn ${active === t.key ? 'active' : ''}`}
                                onClick={() => setActive(t.key)}
                            >
                                {t.label}
                            </button>)
                    ))}
                    <button className="nav-btn" onClick={() => { localStorage.removeItem('token'); setIsAuth(false); setRole(null); }}>Logout</button>
                </nav>
            </header>

            <main className="main">
                {active === 'patients' && <Patients />}
                {active === 'doctors' && <Doctors />}
                {active === 'appointments' && <Appointments />}
                {active === 'billing' && <Billing />}
                {active === 'medical-records' && <MedicalRecords />}
                {active === 'lab-reports' && <LabReports />}
                {active === 'users' && <Users />}
            </main>

            <footer className="footer">
                <p>MyHeart © 2025 — Microservices Healthcare Platform</p>
            </footer>
        </div>
    );
}
