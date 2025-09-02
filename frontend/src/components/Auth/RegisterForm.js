import React, { useState } from 'react';

const RegisterForm = ({ switchToLogin, isActive }) => {
  const [formData, setFormData] = useState({
    name: '',
    surname: '',
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.id]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      alert("Passwords don't match!");
      return;
    }
    
    console.log('Register form submitted', formData);
    navigate('/home');
  };

  return (
    <form 
      className={`auth-form ${isActive ? 'active' : ''}`} 
      id="register-form" 
      onSubmit={handleSubmit}
    >
      {/* Name and Surname in same row */}
      <div className="form-row">
        <div className="form-group">
          <label htmlFor="register-name">Name</label>
          <input 
            type="text" 
            id="register-name" 
            placeholder="Enter name" 
            value={formData.name}
            onChange={handleChange}
            required 
          />
        </div>
        <div className="form-group">
          <label htmlFor="register-surname">Surname</label>
          <input 
            type="text" 
            id="register-surname" 
            placeholder="Enter surname" 
            value={formData.surname}
            onChange={handleChange}
            required 
          />
        </div>
      </div>

      {/* Username field */}
      <div className="form-group">
        <label htmlFor="register-username">Username</label>
        <input 
          type="text" 
          id="register-username" 
          placeholder="Enter username" 
          value={formData.username}
          onChange={handleChange}
          required 
        />
      </div>

      {/* Email field */}
      <div className="form-group">
        <label htmlFor="register-email">Email</label>
        <input 
          type="email" 
          id="register-email" 
          placeholder="your@email.com" 
          value={formData.email}
          onChange={handleChange}
          required 
        />
      </div>

      {/* Password fields */}
      <div className="form-row">
        <div className="form-group">
          <label htmlFor="register-password">Password</label>
          <input 
            type="password" 
            id="register-password" 
            placeholder="Enter password" 
            value={formData.password}
            onChange={handleChange}
            required 
          />
        </div>
        <div className="form-group">
          <label htmlFor="register-confirm">Confirm Password</label>
          <input 
            type="password" 
            id="register-confirm" 
            placeholder="Enter password" 
            value={formData.confirmPassword}
            onChange={handleChange}
            required 
          />
        </div>
      </div>

      <button type="submit" className="auth-btn">Create Account</button>
      
      <p className="auth-switch-text">
        Already have an account?{' '}
        <button 
          type="button" 
          onClick={switchToLogin}
          className="auth-switch-btn"
        >
          Log in
        </button>
      </p>
    </form>
  );
};

export default RegisterForm;