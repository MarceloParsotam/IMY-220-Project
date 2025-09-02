import React from 'react';

const AuthTabs = ({ activeTab, onTabChange }) => {
  return (
    <div className="auth-tabs">
      <div 
        className={`auth-tab ${activeTab === 'login' ? 'active' : ''}`} 
        onClick={() => onTabChange('login')}
      >
        Login
      </div>
      <div 
        className={`auth-tab ${activeTab === 'register' ? 'active' : ''}`} 
        onClick={() => onTabChange('register')}
      >
        Register
      </div>
    </div>
  );
};

export default AuthTabs;