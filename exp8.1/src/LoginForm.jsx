import React, { useState } from 'react';
import './LoginForm.css'; // Import the new CSS file

function LoginForm() {
  // 1. Use a single state object for form data
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });

  // 2. State for errors, loading, and password visibility
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // 3. A single handler to update the formData state
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  // 4. A validation function
  const validate = () => {
    const newErrors = {};
    if (!formData.username) {
      newErrors.username = 'Username is required';
    }
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    return newErrors;
  };

  // 5. Enhanced submit handler
  const handleSubmit = (e) => {
    e.preventDefault();
    const validationErrors = validate();
    setErrors(validationErrors);

    // Check if there are any validation errors
    if (Object.keys(validationErrors).length === 0) {
      setIsLoading(true);
      console.log('Form is valid, attempting login...');

      // Simulate an API call
      setTimeout(() => {
        setIsLoading(false);
        console.log('Login Successful:');
        console.log('Username:', formData.username);
        console.log('Password:', formData.password);

        // Clear form on successful login
        setFormData({ username: '', password: '' });
      }, 1500); // 1.5-second delay
    } else {
      console.log('Form is invalid, check errors.');
    }
  };

  return (
    <div className="login-container">
      <form className="login-form" onSubmit={handleSubmit} noValidate>
        <h2>Login</h2>
        
        <div className="form-group">
          <label htmlFor="username">Username</label>
          <input
            type="text"
            id="username"
            name="username"
            value={formData.username}
            onChange={handleChange}
          />
          {errors.username && <p className="error-message">{errors.username}</p>}
        </div>
        
        <div className="form-group">
          <label htmlFor="password">Password</label>
          <div className="password-wrapper">
            <input
              type={showPassword ? 'text' : 'password'}
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
            />
            <button
              type="button"
              className="password-toggle-btn"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? 'Hide' : 'Show'}
            </button>
          </div>
          {errors.password && <p className="error-message">{errors.password}</p>}
        </div>
        
        <button type="submit" className="submit-btn" disabled={isLoading}>
          {isLoading ? 'Logging in...' : 'Login'}
        </button>
      </form>
    </div>
  );
}

export default LoginForm;