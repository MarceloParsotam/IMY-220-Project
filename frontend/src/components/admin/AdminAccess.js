import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import '../../styles/AdminAccess.css';

const AdminAccess = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  // Only show if user is admin
  if (!currentUser?.isAdmin) {
    return null;
  }

  const handleAdminClick = () => {
    navigate('/admin');
  };

  return (
    <div className="admin-access-card">
      <div className="admin-access-header">
        <div className="admin-icon">⚙️</div>
        <h3>Admin Panel</h3>
      </div>
      <div className="admin-access-content">
        <p>Access the administration dashboard to manage users, projects, and discussions.</p>
        <button 
          className="admin-access-btn"
          onClick={handleAdminClick}
        >
          Go to Admin Panel
        </button>
      </div>
    </div>
  );
};

export default AdminAccess;