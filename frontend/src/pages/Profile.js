import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import ProfileHeader from '../components/profile/ProfileHeader';
import ProfileAbout from '../components/profile/ProfileAbout';
import ProfileSkills from '../components/profile/ProfileSkills';
import ProfileProjects from '../components/profile/ProfileProjects';
import ProfileActivity from '../components/profile/ProfileActivity';
import ProfileFriends from '../components/profile/ProfileFriends';
import EditProfile from '../components/profile/EditProfile';
import CreateProject from '../components/profile/CreateProject';

const Profile = () => {
  const { userId } = useParams();
  const { currentUser, updateUser } = useAuth(); // ADD: import updateUser
  const [isEditing, setIsEditing] = useState(false);
  const [isCreatingProject, setIsCreatingProject] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Get token from localStorage (user ID)
  const getToken = () => {
    const userData = JSON.parse(localStorage.getItem('user'));
    return userData?._id || userData?.id || '';
  };

  // Check if this is the current user's profile
  const isOwnProfile = currentUser && (currentUser._id === userId || currentUser.id === userId);
  
  // Fetch user data from API
  useEffect(() => {
    const fetchUserData = async () => {
      setLoading(true);
      setError('');
      
      try {
        const token = getToken();
        const response = await fetch(`http://localhost:3000/api/users/${userId}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch user data');
        }

        const userData = await response.json();
        
        // Transform API data to match your component expectations
        const transformedUser = {
          id: userData._id,
          name: `${userData.name || ''} ${userData.surname || ''}`.trim() || userData.username,
          username: userData.username,
          avatars: userData.avatars || [userData.avatar || '/default-avatar.png'],
          avatar: userData.avatar || '/default-avatar.png',
          description: userData.description || userData.bio || 'No bio available',
          about: userData.about || 'No about information available',
          skills: userData.skills || [],
          projects: userData.projects || [],
          activities: userData.activities || [],
          friends: userData.friends || []
        };

        setUser(transformedUser);
      } catch (error) {
        console.error('Error fetching user data:', error);
        setError('Failed to load profile');
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      fetchUserData();
    }
  }, [userId]);

  const handleAvatarUpdate = (newAvatarUrl) => {
    setUser(prevUser => ({
      ...prevUser,
      avatar: newAvatarUrl,
      avatars: [newAvatarUrl] // Update the avatars array too
    }));
  };

  const handleSaveProfile = async (updatedData) => {
    try {
      const token = getToken();
      const response = await fetch(`http://localhost:3000/api/users/${userId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: updatedData.name,
          surname: updatedData.surname,
          bio: updatedData.description,
          about: updatedData.about,
          skills: updatedData.skills
        })
      });

      if (!response.ok) {
        throw new Error('Failed to update profile');
      }

      const result = await response.json();
      
      // Update local state with the updated user data
      const updatedUserData = {
        ...user,
        name: `${updatedData.name || ''} ${updatedData.surname || ''}`.trim() || user.username,
        description: updatedData.description,
        about: updatedData.about,
        skills: updatedData.skills
      };
      
      setUser(updatedUserData);

      // ADD: Update AuthContext if it's the current user's profile
      if (isOwnProfile) {
        updateUser(result.user); // Update the user in AuthContext
      }

      setIsEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
      setError('Failed to update profile');
    }
  };

  const handleCreateProject = async (projectData) => {
    try {
      const token = getToken();
      const response = await fetch('http://localhost:3000/api/projects', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(projectData)
      });

      if (!response.ok) {
        throw new Error('Failed to create project');
      }

      // Refresh user data to show the new project
      const userResponse = await fetch(`http://localhost:3000/api/users/${userId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (userResponse.ok) {
        const userData = await userResponse.json();
        const transformedUser = {
          id: userData._id,
          name: `${userData.name || ''} ${userData.surname || ''}`.trim() || userData.username,
          username: userData.username,
          avatars: userData.avatars || [userData.avatar || '/default-avatar.png'],
          avatar: userData.avatar || '/default-avatar.png',
          description: userData.description || userData.bio || 'No bio available',
          about: userData.about || 'No about information available',
          skills: userData.skills || [],
          projects: userData.projects || [],
          activities: userData.activities || [],
          friends: userData.friends || []
        };
        setUser(transformedUser);
      }

      setIsCreatingProject(false);
    } catch (error) {
      console.error('Error creating project:', error);
      setError('Failed to create project');
    }
  };

  if (loading) {
    return (
      <div className="profile-container">
        <div className="loading">Loading profile...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="profile-container">
        <div className="error">{error}</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="profile-container">
        <div className="error">Profile not found</div>
      </div>
    );
  }

  return (
    <div className="profile-container">
      <ProfileHeader 
        user={user} 
        isOwnProfile={isOwnProfile}
        onAvatarUpdate={handleAvatarUpdate}
      />
      
      {isOwnProfile && (
        <div className="profile-actions">
          <button className="edit-profile-btn" onClick={() => setIsEditing(true)}>
            Edit Profile
          </button>
          <button className="create-project-btn" onClick={() => setIsCreatingProject(true)}>
            Create Project
          </button>
        </div>
      )}
      
      <div className="profile-content">
        <div className="profile-main">
          <ProfileAbout about={user.about} />
          <ProfileSkills skills={user.skills} />
          <ProfileFriends friends={user.friends} />
        </div>
        
        <div className="profile-sidebar">
          <ProfileProjects projects={user.projects} />
          <ProfileActivity activities={user.activities} />
        </div>
      </div>

      {isEditing && (
        <EditProfile
          user={user}
          onSave={handleSaveProfile}
          onCancel={() => setIsEditing(false)}
        />
      )}

      {isCreatingProject && (
        <CreateProject
          onSave={handleCreateProject}
          onCancel={() => setIsCreatingProject(false)}
        />
      )}
    </div>
  );
};

export default Profile;