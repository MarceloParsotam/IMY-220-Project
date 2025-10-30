import React, { useState, useEffect } from 'react';

const AdminUsers = ({ getToken }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [editingUser, setEditingUser] = useState(null);

  useEffect(() => {
    fetchUsers();
  }, [search]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const token = getToken();
      
      const url = `http://localhost:3000/api/admin/users?search=${encodeURIComponent(search)}`;
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setUsers(data.users);
      } else {
        setError('Failed to load users');
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      setError('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userId, username) => {
    if (!window.confirm(`Are you sure you want to delete user "${username}"? This will also delete all their projects and data.`)) {
      return;
    }

    try {
      const token = getToken();
      const response = await fetch(`http://localhost:3000/api/admin/users/${userId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        alert('User deleted successfully');
        fetchUsers(); // Refresh the list
      } else {
        const errorData = await response.json();
        alert(errorData.message || 'Failed to delete user');
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      alert('Failed to delete user');
    }
  };

  const handleSaveUser = async (userId, updates) => {
    try {
      const token = getToken();
      const response = await fetch(`http://localhost:3000/api/admin/users/${userId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updates)
      });

      if (response.ok) {
        alert('User updated successfully');
        setEditingUser(null);
        fetchUsers(); // Refresh the list
      } else {
        const errorData = await response.json();
        alert(errorData.message || 'Failed to update user');
      }
    } catch (error) {
      console.error('Error updating user:', error);
      alert('Failed to update user');
    }
  };

  const toggleAdminStatus = async (userId, currentStatus, username) => {
    const newStatus = !currentStatus;
    if (!window.confirm(`Are you sure you want to ${newStatus ? 'grant' : 'revoke'} admin privileges for "${username}"?`)) {
      return;
    }

    try {
      const token = getToken();
      const response = await fetch(`http://localhost:3000/api/admin/users/${userId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ isAdmin: newStatus })
      });

      if (response.ok) {
        alert(`Admin privileges ${newStatus ? 'granted' : 'revoked'} successfully`);
        fetchUsers(); // Refresh the list
      } else {
        const errorData = await response.json();
        alert(errorData.message || 'Failed to update user');
      }
    } catch (error) {
      console.error('Error updating user admin status:', error);
      alert('Failed to update user');
    }
  };

  if (loading) {
    return <div className="loading">Loading users...</div>;
  }

  return (
    <div className="admin-users">
      <div className="admin-section-header">
        <h2>Manage Users</h2>
        <div className="search-box">
          <input
            type="text"
            placeholder="Search users..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="search-input"
          />
        </div>
      </div>

      {error && (
        <div className="error-banner">
          <p>{error}</p>
          <button onClick={fetchUsers} className="btn secondary-btn">Retry</button>
        </div>
      )}

      <div className="admin-table-container">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Username</th>
              <th>Email</th>
              <th>Name</th>
              <th>Projects</th>
              <th>Admin</th>
              <th>Created</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map(user => (
              <tr key={user._id}>
                <td>
                  {editingUser === user._id ? (
                    <input
                      type="text"
                      defaultValue={user.username}
                      onBlur={(e) => handleSaveUser(user._id, { username: e.target.value })}
                      className="edit-input"
                    />
                  ) : (
                    user.username
                  )}
                </td>
                <td>
                  {editingUser === user._id ? (
                    <input
                      type="email"
                      defaultValue={user.email}
                      onBlur={(e) => handleSaveUser(user._id, { email: e.target.value })}
                      className="edit-input"
                    />
                  ) : (
                    user.email
                  )}
                </td>
                <td>
                  {editingUser === user._id ? (
                    <input
                      type="text"
                      defaultValue={user.name || ''}
                      onBlur={(e) => handleSaveUser(user._id, { name: e.target.value })}
                      className="edit-input"
                    />
                  ) : (
                    user.name || 'N/A'
                  )}
                </td>
                <td>{user.projectCount || 0}</td>
                <td>
                  <button
                    onClick={() => toggleAdminStatus(user._id, user.isAdmin, user.username)}
                    className={`btn ${user.isAdmin ? 'primary-btn' : 'secondary-btn'}`}
                    style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem' }}
                  >
                    {user.isAdmin ? 'Yes' : 'No'}
                  </button>
                </td>
                <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                <td>
                  <div className="action-buttons">
                    <button
                      onClick={() => setEditingUser(editingUser === user._id ? null : user._id)}
                      className="btn secondary-btn"
                    >
                      {editingUser === user._id ? 'Cancel' : 'Edit'}
                    </button>
                    <button
                      onClick={() => handleDeleteUser(user._id, user.username)}
                      className="btn danger-btn"
                      disabled={user.isAdmin} // Prevent deleting other admins
                      title={user.isAdmin ? 'Cannot delete admin users' : 'Delete user'}
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {users.length === 0 && !loading && (
        <div className="empty-state">
          <p>No users found</p>
        </div>
      )}
    </div>
  );
};

export default AdminUsers;