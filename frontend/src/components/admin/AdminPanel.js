import React, { useState, useEffect } from 'react';
import AdminDashboard from './AdminDashboard';
import AdminProjects from './AdminProjects';
import AdminUsers from './AdminUsers';
import AdminDiscussions from './AdminDiscussions';
import { useAuth } from '../../contexts/AuthContext';
import '../../styles/admin.css';

const AdminPanel = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { currentUser } = useAuth();

  // Move getToken inside the component and use currentUser directly
  const getToken = () => {
    // Use currentUser from the hook that's already called in this component
    if (currentUser?._id) {
      return currentUser._id;
    }
    
    // Fallback to localStorage
    const userData = JSON.parse(localStorage.getItem('user') || '{}');
    return userData._id || '';
  };

  // Check if user is admin
  useEffect(() => {
    const checkAdminAccess = async () => {
      if (!currentUser) {
        setError('Please log in to access admin panel');
        setLoading(false);
        return;
      }

      if (!currentUser.isAdmin) {
        setError('Admin access required');
        setLoading(false);
        return;
      }

      setLoading(false);
    };

    checkAdminAccess();
  }, [currentUser]);

  if (loading) {
    return (
      <div className="admin-panel">
        <div className="loading">Checking admin access...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="admin-panel">
        <div className="error-state">
          <h2>Access Denied</h2>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'projects', label: 'Projects' },
    { id: 'users', label: 'Users' },
    { id: 'discussions', label: 'Discussions' }
  ];

  const renderContent = () => {
    // Pass getToken as a prop to child components
    switch (activeTab) {
      case 'dashboard':
        return <AdminDashboard getToken={getToken} />;
      case 'projects':
        return <AdminProjects getToken={getToken} />;
      case 'users':
        return <AdminUsers getToken={getToken} />;
      case 'discussions':
        return <AdminDiscussions getToken={getToken} />;
      default:
        return <AdminDashboard getToken={getToken} />;
    }
  };

  return (
    <div className="admin-panel">
      <div className="admin-header">
        <h1>Admin Panel</h1>
        <p>Manage all aspects of the application</p>
      </div>

      <div className="admin-nav">
        {tabs.map(tab => (
          <button
            key={tab.id}
            className={`admin-nav-btn ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="admin-content">
        {renderContent()}
      </div>
    </div>
  );
};

export default AdminPanel;