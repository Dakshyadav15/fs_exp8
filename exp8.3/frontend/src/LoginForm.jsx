import React, { useState } from 'react';
import './LoginForm.css';

// onLoginSuccess is passed from App.jsx
function LoginForm({ onLoginSuccess }) {
  const [formData, setFormData] = useState({ username: '', password: '' });
  const [serverError, setServerError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError('');
    setIsLoading(true);

    try {
      const response = await fetch('http://localhost:4000/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Login failed');

      localStorage.setItem('token', data.token); // Store token
      onLoginSuccess(); // Tell App.jsx we are logged in

    } catch (error) {
      setServerError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  // (The JSX is the same as before, I'm omitting it for brevity)
  // (Or, to be safe, here it is)
  return (
    <div className="login-container">
      <form className="login-form" onSubmit={handleSubmit} noValidate>
        <h2>Login</h2>
        {serverError && <p className="error-message server-error">{serverError}</p>}
        <div className="form-group">
          <label htmlFor="username">Username</label>
          <input
            type="text"
            id="username"
            name="username"
            value={formData.username}
            onChange={handleChange}
            disabled={isLoading}
          />
        </div>
        <div className="form-group">
          <label htmlFor="password">Password</label>
          <input
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            disabled={isLoading}
          />
        </div>
        <button type="submit" className="submit-btn" disabled={isLoading}>
          {isLoading ? 'Logging in...' : 'Login'}
        </button>
      </form>
    </div>
  );
}
export default LoginForm;