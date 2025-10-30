import React, { useState, useEffect } from 'react';

const AdminDashboard = ({ getToken }) => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const token = getToken();
      
      const response = await fetch('http://localhost:3000/api/admin/stats', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setStats(data.stats);
      } else {
        setError('Failed to load stats');
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
      setError('Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading">Loading dashboard...</div>;
  }

  if (error) {
    return (
      <div className="error-state">
        <p>{error}</p>
        <button onClick={fetchStats} className="btn primary-btn">Retry</button>
      </div>
    );
  }

  return (
    <div className="admin-dashboard">
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-value">{stats?.totalProjects || 0}</div>
          <div className="stat-label">Total Projects</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{stats?.totalUsers || 0}</div>
          <div className="stat-label">Total Users</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{stats?.activeCheckouts || 0}</div>
          <div className="stat-label">Active Checkouts</div>
        </div>
      </div>

      <div className="recent-activity">
        <h3>Recent Activity</h3>
        {stats?.recentActivities?.length > 0 ? (
          <div className="activity-list">
            {stats.recentActivities.map((activity, index) => (
              <div key={index} className="activity-item">
                <div className="activity-title">{activity.title}</div>
                <div className="activity-description">{activity.description}</div>
                <div className="activity-time">
                  {new Date(activity.date).toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p>No recent activity</p>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;