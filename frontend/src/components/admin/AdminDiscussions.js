import React, { useState, useEffect } from 'react';

const AdminDiscussions = ({ getToken }) => {
  const [discussions, setDiscussions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDiscussions();
  }, []);

  const fetchDiscussions = async () => {
    try {
      setLoading(true);
      const token = getToken();
      
      const response = await fetch('http://localhost:3000/api/admin/discussions', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setDiscussions(data.discussions);
      } else {
        setError('Failed to load discussions');
      }
    } catch (error) {
      console.error('Error fetching discussions:', error);
      setError('Failed to load discussions');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteDiscussion = async (discussionId, projectId, content) => {
    const preview = content.length > 50 ? content.substring(0, 50) + '...' : content;
    if (!window.confirm(`Are you sure you want to delete this discussion?\n\n"${preview}"`)) {
      return;
    }

    try {
      const token = getToken();
      const response = await fetch(`http://localhost:3000/api/admin/discussions/${discussionId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ projectId })
      });

      if (response.ok) {
        alert('Discussion deleted successfully');
        fetchDiscussions(); // Refresh the list
      } else {
        const errorData = await response.json();
        alert(errorData.message || 'Failed to delete discussion');
      }
    } catch (error) {
      console.error('Error deleting discussion:', error);
      alert('Failed to delete discussion');
    }
  };

  if (loading) {
    return <div className="loading">Loading discussions...</div>;
  }

  return (
    <div className="admin-discussions">
      <div className="admin-section-header">
        <h2>Manage Discussions</h2>
        <p>View and manage all project discussions across the platform</p>
      </div>

      {error && (
        <div className="error-banner">
          <p>{error}</p>
          <button onClick={fetchDiscussions} className="btn secondary-btn">Retry</button>
        </div>
      )}

      <div className="discussions-list">
        {discussions.map(discussion => (
          <div key={discussion.discussionId} className="discussion-card">
            <div className="discussion-header">
              <div className="discussion-user">
                <strong>{discussion.user}</strong>
                <span className="discussion-time">
                  {new Date(discussion.createdAt || discussion.time).toLocaleString()}
                </span>
              </div>
              <div className="discussion-project">
                Project: <strong>{discussion.projectName}</strong>
              </div>
            </div>
            
            <div className="discussion-content">
              {discussion.content}
            </div>
            
            <div className="discussion-actions">
              <button
                onClick={() => handleDeleteDiscussion(
                  discussion.discussionId, 
                  discussion.projectId,
                  discussion.content
                )}
                className="btn danger-btn"
              >
                Delete Discussion
              </button>
            </div>
          </div>
        ))}
      </div>

      {discussions.length === 0 && !loading && (
        <div className="empty-state">
          <p>No discussions found</p>
        </div>
      )}
    </div>
  );
};

export default AdminDiscussions;