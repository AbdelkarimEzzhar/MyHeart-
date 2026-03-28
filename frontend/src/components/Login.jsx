import React, { useState } from 'react';
import API from '../api/axios';

export default function Login({ onLogin }) {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);

    const submit = async (e) => {
        e.preventDefault();
        setError(null);
        setLoading(true);
        try {
            // Note: Ensure your API Gateway has the /auth/login route implemented
            const { data } = await API.post('/auth/login', { username, password });
            if (data && data.token) {
                localStorage.setItem('token', data.token);
                if (onLogin) onLogin();
            } else {
                setError('Invalid response from server');
            }
        } catch (err) {
            setError(err.response?.data?.error || 'Login failed. Check credentials.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-container">
            <div className="login-card">
                <div className="login-header">
                    <span className="login-icon">🏥</span>
                    <h2>Welcome to MyHeart</h2>
                    <p>Please sign in to continue</p>
                </div>

                <form onSubmit={submit} className="login-form">
                    <div className="form-group">
                        <label htmlFor="username">Username</label>
                        <input
                            id="username"
                            type="text"
                            placeholder="Enter your username"
                            value={username}
                            onChange={e => setUsername(e.target.value)}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="password">Password</label>
                        <input
                            id="password"
                            type="password"
                            placeholder="Enter your password"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            required
                        />
                    </div>

                    {error && <div className="error-message">{error}</div>}

                    <button className="login-btn" type="submit" disabled={loading}>
                        {loading ? 'Signing In...' : 'Sign In'}
                    </button>
                </form>

                <div className="login-footer">
                    <p>Protected Healthcare System</p>
                </div>
            </div>
        </div>
    );
}