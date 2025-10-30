import React, { useState, useEffect } from 'react';

const AdminProjects = ({ getToken }) => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [editingProject, setEditingProject] = useState(null);

  useEffect(() => {
    fetchProjects();
  }, [search]);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const token = getToken();
      
      const url = `http://localhost:3000/api/admin/projects?search=${encodeURIComponent(search)}`;
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setProjects(data.projects);
      } else {
        setError('Failed to load projects');
      }
    } catch (error) {
      console.error('Error fetching projects:', error);
      setError('Failed to load projects');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProject = async (projectId) => {
    if (!window.confirm('Are you sure you want to delete this project? This will also delete all associated data.')) {
      return;
    }

    try {
      const token = getToken();
      const response = await fetch(`http://localhost:3000/api/admin/projects/${projectId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        alert('Project deleted successfully');
        fetchProjects(); // Refresh the list
      } else {
        const errorData = await response.json();
        alert(errorData.message || 'Failed to delete project');
      }
    } catch (error) {
      console.error('Error deleting project:', error);
      alert('Failed to delete project');
    }
  };

  const handleSaveProject = async (projectId, updates) => {
    try {
      const token = getToken();
      const response = await fetch(`http://localhost:3000/api/admin/projects/${projectId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updates)
      });

      if (response.ok) {
        alert('Project updated successfully');
        setEditingProject(null);
        fetchProjects(); // Refresh the list
      } else {
        const errorData = await response.json();
        alert(errorData.message || 'Failed to update project');
      }
    } catch (error) {
      console.error('Error updating project:', error);
      alert('Failed to update project');
    }
  };

  if (loading) {
    return <div className="loading">Loading projects...</div>;
  }

  return (
    <div className="admin-projects">
      <div className="admin-section-header">
        <h2>Manage Projects</h2>
        <div className="search-box">
          <input
            type="text"
            placeholder="Search projects..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="search-input"
          />
        </div>
      </div>

      {error && (
        <div className="error-banner">
          <p>{error}</p>
          <button onClick={fetchProjects} className="btn secondary-btn">Retry</button>
        </div>
      )}

      <div className="admin-table-container">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Owner</th>
              <th>Type</th>
              <th>Visibility</th>
              <th>Created</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {projects.map(project => (
              <tr key={project._id}>
                <td>
                  {editingProject === project._id ? (
                    <input
                      type="text"
                      defaultValue={project.name}
                      onBlur={(e) => handleSaveProject(project._id, { name: e.target.value })}
                      className="edit-input"
                    />
                  ) : (
                    project.name
                  )}
                </td>
                <td>{project.owner?.username || 'Unknown'}</td>
                <td>
                  {editingProject === project._id ? (
                    <select
                      defaultValue={project.type}
                      onChange={(e) => handleSaveProject(project._id, { type: e.target.value })}
                      className="edit-select"
                    >
                      <option value="Web Application">Web Application</option>
                      <option value="Mobile Application">Mobile Application</option>
                      <option value="Backend Service">Backend Service</option>
                      <option value="Documentation">Documentation</option>
                      <option value="Library">Library</option>
                    </select>
                  ) : (
                    project.type
                  )}
                </td>
                <td>
                  {editingProject === project._id ? (
                    <select
                      defaultValue={project.isPublic ? 'public' : 'private'}
                      onChange={(e) => handleSaveProject(project._id, { isPublic: e.target.value === 'public' })}
                      className="edit-select"
                    >
                      <option value="public">Public</option>
                      <option value="private">Private</option>
                    </select>
                  ) : (
                    project.isPublic ? 'Public' : 'Private'
                  )}
                </td>
                <td>{new Date(project.createdAt).toLocaleDateString()}</td>
                <td>
                  <div className="action-buttons">
                    <button
                      onClick={() => setEditingProject(editingProject === project._id ? null : project._id)}
                      className="btn secondary-btn"
                    >
                      {editingProject === project._id ? 'Cancel' : 'Edit'}
                    </button>
                    <button
                      onClick={() => handleDeleteProject(project._id)}
                      className="btn danger-btn"
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

      {projects.length === 0 && !loading && (
        <div className="empty-state">
          <p>No projects found</p>
        </div>
      )}
    </div>
  );
};

export default AdminProjects;