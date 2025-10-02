import React, { useState } from 'react';

const DiscussionTab = ({ discussions = [], currentUser, projectId, onRefreshProject }) => {
  const [newDiscussion, setNewDiscussion] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmitDiscussion = async (e) => {
    e.preventDefault();
    
    if (!newDiscussion.trim() || !currentUser) return;

    setIsSubmitting(true);
    
    try {
      const userData = JSON.parse(localStorage.getItem('user'));
      const token = userData?._id || userData?.id || '';

      const response = await fetch(`http://localhost:3000/api/projects/${projectId}/discussion`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          content: newDiscussion.trim(),
          userName: currentUser.name || currentUser.email || 'Anonymous User'
        })
      });

      if (response.ok) {
        setNewDiscussion('');
        // Refresh the project data to show the new discussion
        if (onRefreshProject) {
          onRefreshProject();
        }
      } else {
        console.error('Failed to add discussion');
        alert('Failed to add discussion. Please try again.');
      }
    } catch (error) {
      console.error('Error adding discussion:', error);
      alert('Error adding discussion. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="project-section">
      <h2 className="section-title">Discussion</h2>
      
      {/* Discussion Input Form */}
      {currentUser && (
        <div className="discussion-input-section">
          <form onSubmit={handleSubmitDiscussion} className="discussion-form">
            <textarea
              value={newDiscussion}
              onChange={(e) => setNewDiscussion(e.target.value)}
              placeholder="Add a comment or start a discussion..."
              className="discussion-textarea"
              rows="3"
              disabled={isSubmitting}
            />
            <div className="discussion-form-actions">
              <button 
                type="submit" 
                className="submit-discussion-btn"
                disabled={!newDiscussion.trim() || isSubmitting}
              >
                {isSubmitting ? 'Posting...' : 'Post Discussion'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Discussions List */}
      <div className="discussions-list">
        {discussions && discussions.length > 0 ? (
          discussions.map((discussion, index) => (
            <div key={index} className="discussion-item">
              <div className="discussion-header">
                <strong>{discussion.user || discussion.userName || 'Unknown User'}</strong>
                <span className="discussion-time">
                  {discussion.timestamp ? new Date(discussion.timestamp).toLocaleString() : discussion.time || 'Unknown time'}
                </span>
              </div>
              <p className="discussion-content">{discussion.content}</p>
            </div>
          ))
        ) : (
          <div className="no-discussions">
            <p>No discussions yet. Start the conversation!</p>
          </div>
        )}
      </div>
    </section>
  );
};

export default DiscussionTab;