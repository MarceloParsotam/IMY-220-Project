import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const RegisterForm = ({ switchToLogin, isActive }) => {
  const [formData, setFormData] = useState({
    name: '',
    surname: '',
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  
  const navigate = useNavigate();
  const { register } = useAuth(); // Changed from login to register

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [id]: value
    }));
    
    // Clear field-specific errors when user starts typing
    if (fieldErrors[id]) {
      setFieldErrors(prev => ({
        ...prev,
        [id]: ''
      }));
    }
    
    // Clear general error when user makes changes
    if (error) {
      setError('');
    }
  };

  const validateForm = () => {
    const errors = {};
    let isValid = true;

    // Check for empty fields
    Object.entries(formData).forEach(([key, value]) => {
      if (!value.trim()) {
        errors[key] = 'This field is required';
        isValid = false;
      }
    });

    // Check password match
    if (formData.password && formData.confirmPassword && formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
      isValid = false;
    }

    // Check password length
    if (formData.password && formData.password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
      isValid = false;
    }

    // Check email format
    if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Please enter a valid email address';
      isValid = false;
    }

    setFieldErrors(errors);
    return isValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setFieldErrors({});

    // Frontend validation
    if (!validateForm()) {
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch('http://localhost:3000/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        // FIX: Use register function instead of login, and remove token parameter
        register(data.user); // Remove the second parameter
        console.log('Registration successful, auth context updated');
        
        window.location.href = '/home';
      } else {
        // Handle specific backend errors
        if (data.message.includes('already exists')) {
          if (data.message.includes('email')) {
            setFieldErrors({ email: 'An account with this email already exists' });
          } else if (data.message.includes('username')) {
            setFieldErrors({ username: 'This username is already taken' });
          } else {
            setError(data.message);
          }
        } else {
          setError(data.message || 'Registration failed');
        }
      }
    } catch (error) {
      setError('Network error. Please try again.');
      console.error('Registration error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form 
      className="auth-form"
      id="register-form" 
      onSubmit={handleSubmit}
    >
      {error && <div className="error-message">{error}</div>}
      
      <div className="form-row">
        <div className="form-group">
          <label htmlFor="name">Name</label>
          <input 
            type="text" 
            id="name" 
            placeholder="Enter name" 
            value={formData.name}
            onChange={handleChange}
            className={fieldErrors.name ? 'error' : ''}
            required 
          />
          {fieldErrors.name && <span className="field-error">{fieldErrors.name}</span>}
        </div>
        <div className="form-group">
          <label htmlFor="surname">Surname</label>
          <input 
            type="text" 
            id="surname" 
            placeholder="Enter surname" 
            value={formData.surname}
            onChange={handleChange}
            className={fieldErrors.surname ? 'error' : ''}
            required 
          />
          {fieldErrors.surname && <span className="field-error">{fieldErrors.surname}</span>}
        </div>
      </div>

      <div className="form-group">
        <label htmlFor="username">Username</label>
        <input 
          type="text" 
          id="username" 
          placeholder="Enter username" 
          value={formData.username}
          onChange={handleChange}
          className={fieldErrors.username ? 'error' : ''}
          required 
        />
        {fieldErrors.username && <span className="field-error">{fieldErrors.username}</span>}
      </div>

      <div className="form-group">
        <label htmlFor="email">Email</label>
        <input 
          type="email" 
          id="email" 
          placeholder="your@email.com" 
          value={formData.email}
          onChange={handleChange}
          className={fieldErrors.email ? 'error' : ''}
          required 
        />
        {fieldErrors.email && <span className="field-error">{fieldErrors.email}</span>}
      </div>

      <div className="form-row">
        <div className="form-group">
          <label htmlFor="password">Password</label>
          <input 
            type="password" 
            id="password" 
            placeholder="Enter password (min. 6 characters)" 
            value={formData.password}
            onChange={handleChange}
            className={fieldErrors.password ? 'error' : ''}
            required 
          />
          {fieldErrors.password && <span className="field-error">{fieldErrors.password}</span>}
        </div>
        <div className="form-group">
          <label htmlFor="confirmPassword">Confirm Password</label>
          <input 
            type="password" 
            id="confirmPassword" 
            placeholder="Confirm password" 
            value={formData.confirmPassword}
            onChange={handleChange}
            className={fieldErrors.confirmPassword ? 'error' : ''}
            required 
          />
          {fieldErrors.confirmPassword && <span className="field-error">{fieldErrors.confirmPassword}</span>}
        </div>
      </div>

      <button 
        type="submit" 
        className="auth-btn"
        disabled={isLoading}
      >
        {isLoading ? 'Creating Account...' : 'Create Account'}
      </button>
      
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