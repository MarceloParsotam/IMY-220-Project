import React from 'react';
import { useNavigate } from 'react-router-dom'; // Add this import

const LoginForm = ({ switchToRegister, isActive }) => {
  const navigate = useNavigate(); // Add this line

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Login form submitted');
    navigate('/home'); // Now this works
  };

  return (
    <form 
      className={`auth-form ${isActive ? 'active' : ''}`} 
      id="login-form" 
      onSubmit={handleSubmit}
    >
      <div className="form-group">
        <label htmlFor="login-email">Email</label>
        <input type="email" id="login-email" placeholder="your@email.com" required />
      </div>
      <div className="form-group">
        <label htmlFor="login-password">Password</label>
        <input type="password" id="login-password" placeholder="••••••••" required />
      </div>
      <button type="submit" className="auth-btn">Log In</button>
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

export default LoginForm;