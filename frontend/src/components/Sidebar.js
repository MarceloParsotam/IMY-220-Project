import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';
import FriendCard from '../components/friends/FriendCard'; // Import the FriendCard component

const Sidebar = () => {
  const [personalProjects, setPersonalProjects] = useState([]);
  const [friends, setFriends] = useState([]);
  const [loading, setLoading] = useState(true);
  const { currentUser, isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated && currentUser) {
      fetchSidebarData();
    }
  }, [currentUser, isAuthenticated]);

  const fetchSidebarData = async () => {
    try {
      setLoading(true);
      
      // Fetch user's projects and friends in parallel
      const [projectsResponse, friendsResponse] = await Promise.all([
        fetch(`/api/projects/user/${currentUser._id}`, {
          headers: {
            'Authorization': `Bearer ${currentUser._id}`,
            'Content-Type': 'application/json'
          }
        }),
        fetch(`/api/friends/${currentUser._id}`, {
          headers: {
            'Authorization': `Bearer ${currentUser._id}`,
            'Content-Type': 'application/json'
          }
        })
      ]);

      if (projectsResponse.ok) {
        const projectsData = await projectsResponse.json();
        setPersonalProjects(projectsData || []);
      } else {
        console.error('Failed to fetch projects');
        setPersonalProjects([]);
      }

      if (friendsResponse.ok) {
        const friendsData = await friendsResponse.json();
        setFriends(friendsData.friends || []);
      } else {
        console.error('Failed to fetch friends');
        setFriends([]);
      }

    } catch (error) {
      console.error('Error fetching sidebar data:', error);
      setPersonalProjects([]);
      setFriends([]);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveFriend = async (friendId) => {
    try {
      const response = await fetch('/api/friends/remove', {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${currentUser._id}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          userId: currentUser._id,
          friendId: friendId
        })
      });

      if (response.ok) {
        // Remove friend from local state
        setFriends(friends.filter(friend => friend.id !== friendId));
      } else {
        console.error('Failed to remove friend');
      }
    } catch (error) {
      console.error('Error removing friend:', error);
    }
  };

  const handleConnectFriend = async (friendId) => {
    try {
      const response = await fetch('/api/friends/request', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${currentUser._id}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          fromUserId: currentUser._id,
          toUserId: friendId
        })
      });

      if (response.ok) {
        alert('Friend request sent!');
      } else {
        console.error('Failed to send friend request');
      }
    } catch (error) {
      console.error('Error sending friend request:', error);
    }
  };

  if (loading) {
    return (
      <div className="sidebar">
        <div className="sidebar-section">
          <h3 className="section-title">Personal Projects</h3>
          <div className="loading">Loading projects...</div>
        </div>
        <div className="sidebar-section">
          <h3 className="section-title">Friends</h3>
          <div className="loading">Loading friends...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="sidebar">
      <div className="sidebar-section">
        <h3 className="section-title">Personal Projects</h3>
        {personalProjects.length === 0 ? (
          <div className="empty-state">
            <p>No projects yet</p>
            <Link to="/projects" className="create-project-link">
              Create your first project
            </Link>
          </div>
        ) : (
          <ul className="projects-list">
            {personalProjects.slice(0, 5).map((project) => (
              <li key={project.id} className="project-item">
                <Link to={`/projects/${project.id}`} className="project-link">
                  {project.name}
                </Link>
                {project.isCheckedOut && (
                  <span className="checkout-badge" title="Checked Out">🔒</span>
                )}
              </li>
            ))}
            {personalProjects.length > 5 && (
              <li className="project-item view-all">
                <Link to="/projects" className="view-all-link">
                  View all projects ({personalProjects.length})
                </Link>
              </li>
            )}
          </ul>
        )}
      </div>
      
      <div className="sidebar-section">
        <h3 className="section-title">Friends</h3>
        {friends.length === 0 ? (
          <div className="empty-state">
            <p>No friends yet</p>
            <Link to="/friends" className="find-friends-link">
              Find friends
            </Link>
          </div>
        ) : (
          <div className="friends-grid">
            {friends.slice(0, 3).map((friend) => (
              <FriendCard
                key={friend.id}
                friend={friend}
                isSuggestion={false}
                onRemove={() => handleRemoveFriend(friend.id)}
                onConnect={handleConnectFriend}
              />
            ))}
            {friends.length > 3 && (
              <div className="view-all-container">
                <Link to="/friends" className="view-all-link">
                  View all friends ({friends.length})
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Sidebar;