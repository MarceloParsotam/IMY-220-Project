// Fixed ProjectMembersTab.js
import React, { useState, useEffect } from 'react';

const ProjectMembersTab = ({ project, currentUser, onRefreshProject }) => {
  const [members, setMembers] = useState([]);
  const [availableFriends, setAvailableFriends] = useState([]);
  const [showAddMember, setShowAddMember] = useState(false);
  const [selectedFriend, setSelectedFriend] = useState('');
  const [loading, setLoading] = useState(false);
  const [isOwner, setIsOwner] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    checkOwnership();
    fetchMembers();
    fetchAvailableFriends();
  }, [project, currentUser]);

  const checkOwnership = () => {
    setIsOwner(project.userId === currentUser._id);
  };

  const fetchMembers = async () => {
    try {
      setError('');
      const userData = JSON.parse(localStorage.getItem('user'));
      const token = userData?._id || userData?.id || '';

      const response = await fetch(`http://localhost:3000/api/projects/${project._id}/members`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setMembers(data.members || []);
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Failed to fetch members');
      }
    } catch (error) {
      console.error('Error fetching members:', error);
      setError('Error fetching members. Please try again.');
    }
  };

  const fetchAvailableFriends = async () => {
    try {
      const userData = JSON.parse(localStorage.getItem('user'));
      const token = userData?._id || userData?.id || '';

      const response = await fetch(`http://localhost:3000/api/projects/${project._id}/available-friends`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setAvailableFriends(data.friends || []);
        console.log('Available friends:', data.friends);
      } else {
        console.log('No available friends found');
        setAvailableFriends([]);
      }
    } catch (error) {
      console.error('Error fetching available friends:', error);
      setAvailableFriends([]);
    }
  };

  const handleAddMember = async (e) => {
    e.preventDefault();
    if (!selectedFriend) return;

    setLoading(true);
    try {
      const userData = JSON.parse(localStorage.getItem('user'));
      const token = userData?._id || userData?.id || '';

      const response = await fetch(`http://localhost:3000/api/projects/${project._id}/members`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          memberId: selectedFriend
        })
      });

      if (response.ok) {
        setSelectedFriend('');
        setShowAddMember(false);
        // Refresh both the members list and the parent project data
        await fetchMembers();
        await fetchAvailableFriends();
        if (onRefreshProject) {
          onRefreshProject(); // This will refresh the About section
        }
      } else {
        const errorData = await response.json();
        alert(errorData.message || 'Failed to add member');
      }
    } catch (error) {
      console.error('Error adding member:', error);
      alert('Error adding member. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveMember = async (memberId) => {
    if (!window.confirm('Are you sure you want to remove this member?')) {
      return;
    }

    try {
      const userData = JSON.parse(localStorage.getItem('user'));
      const token = userData?._id || userData?.id || '';

      const response = await fetch(`http://localhost:3000/api/projects/${project._id}/members/${memberId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        // Refresh both the members list and the parent project data
        await fetchMembers();
        await fetchAvailableFriends();
        if (onRefreshProject) {
          onRefreshProject(); // This will refresh the About section
        }
      } else {
        const errorData = await response.json();
        alert(errorData.message || 'Failed to remove member');
      }
    } catch (error) {
      console.error('Error removing member:', error);
      alert('Error removing member. Please try again.');
    }
  };

  return (
    <section className="project-section">
      <div className="members-header">
        <h2 className="section-title">Project Members</h2>
        {isOwner && (
          <button 
            className="add-member-btn"
            onClick={() => setShowAddMember(true)}
          >
            Add Member {availableFriends.length > 0 && `(${availableFriends.length} available)`}
          </button>
        )}
      </div>

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      {/* Add Member Modal */}
      {showAddMember && (
        <div className="modal-overlay" onClick={() => setShowAddMember(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Add Member from Friends</h3>
              <button 
                className="close-btn"
                onClick={() => setShowAddMember(false)}
                type="button"
              >
                ×
              </button>
            </div>
            <form onSubmit={handleAddMember}>
              <div className="form-group">
                <label>Select Friend:</label>
                <select
                  value={selectedFriend}
                  onChange={(e) => setSelectedFriend(e.target.value)}
                  required
                >
                  <option value="">Choose a friend...</option>
                  {availableFriends.map(friend => (
                    <option key={friend.id} value={friend.id}>
                      {friend.name} ({friend.username})
                    </option>
                  ))}
                </select>
                {availableFriends.length === 0 && (
                  <p className="help-text">
                    No friends available to add. You need to be friends with someone before you can add them to the project.
                  </p>
                )}
              </div>
              
              <div className="modal-actions">
                <button 
                  type="button" 
                  onClick={() => setShowAddMember(false)}
                  disabled={loading}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={!selectedFriend || loading}
                >
                  {loading ? 'Adding...' : 'Add Member'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Members List */}
      <div className="members-list">
        <div className="members-table">
          <div className="table-header">
            <span className="member-name">Name</span>
            <span className="member-username">Username</span>
            <span className="member-role">Role</span>
            {isOwner && <span className="member-actions">Actions</span>}
          </div>
          
          {/* Project Owner */}
          <div className="table-row member-row owner-row">
            <span className="member-name">
              {project.username} {currentUser._id === project.userId && '(You)'}
            </span>
            <span className="member-username">{project.username}</span>
            <span className="member-role">
              <span className="role-badge owner">Owner</span>
            </span>
            {isOwner && <span className="member-actions">-</span>}
          </div>

          {/* Project Members - FIXED: Added index parameter to map function */}
          {members.map((member, index) => {
            // Safely extract member properties
            const memberId = member.id || member._id || '';
            const memberName = member.name || member.username || 'Unknown Member';
            const memberUsername = member.username || member.name || 'unknown';
            
            return (
              <div key={memberId || index} className="table-row member-row">
                <span className="member-name">
                  {memberName}
                  {currentUser._id === memberId && ' (You)'}
                </span>
                <span className="member-username">{memberUsername}</span>
                <span className="member-role">
                  <span className="role-badge member">Member</span>
                </span>
                {isOwner && currentUser._id !== memberId && (
                  <span className="member-actions">
                    <button 
                      className="remove-btn"
                      onClick={() => handleRemoveMember(memberId)}
                      title="Remove member"
                      type="button"
                    >
                      Remove
                    </button>
                  </span>
                )}
                {isOwner && currentUser._id === memberId && (
                  <span className="member-actions">-</span>
                )}
              </div>
            );
          })}

          {members.length === 0 && (
            <div className="no-members">
              <p>No additional members in this project yet.</p>
              {isOwner && availableFriends.length > 0 && (
                <p>Click "Add Member" to invite friends to collaborate.</p>
              )}
              {isOwner && availableFriends.length === 0 && (
                <p>You need to add friends before you can invite them to the project.</p>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default ProjectMembersTab;