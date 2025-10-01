import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const LoginForm = ({ switchToRegister, isActive }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [id]: value
    }));
    
    // Clear error when user starts typing
    if (error) {
      setError('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    console.log('Attempting login with:', formData);

    try {
      const response = await fetch('http://localhost:3000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      console.log('Login response status:', response.status);
      
      const data = await response.json();
      console.log('Login response data:', data);

      if (data.success) {
        // Use AuthContext to handle login
        login(data.user, data.token);
        console.log('Login successful, auth context updated');
        
        // Force a hard navigation to ensure the app reloads with auth state
        window.location.href = '/home';
      } else {
        setError(data.message || 'Login failed');
      }
    } catch (error) {
      console.error('Login error:', error);
      setError('Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form 
      className="auth-form"
      id="login-form" 
      onSubmit={handleSubmit}
    >
      {error && <div className="error-message">{error}</div>}
      
      <div className="form-group">
        <label htmlFor="email">Email</label>
        <input 
          type="email" 
          id="email" 
          placeholder="your@email.com" 
          value={formData.email}
          onChange={handleChange}
          required 
        />
      </div>
      
      <div className="form-group">
        <label htmlFor="password">Password</label>
        <input 
          type="password" 
          id="password" 
          placeholder="••••••••" 
          value={formData.password}
          onChange={handleChange}
          required 
        />
      </div>
      
      <button 
        type="submit" 
        className="auth-btn"
        disabled={isLoading}
      >
        {isLoading ? 'Logging in...' : 'Log In'}
      </button>
      
      <p style={{ marginTop: '1rem', textAlign: 'center', fontSize: '0.9rem' }}>
        Don't have an account?{' '}
        <button 
          type="button" 
          onClick={switchToRegister}
          className="auth-switch-btn"
        >
          Sign up
        </button>
      </p>
    </form>
  );
};

// Add default props to handle cases where isActive is not passed
LoginForm.defaultProps = {
  isActive: true,
  switchToRegister: () => console.log('Switch to register clicked')
};

export default LoginForm;