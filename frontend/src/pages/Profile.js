import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import ProfileHeader from '../components/profile/ProfileHeader';
import ProfileAbout from '../components/profile/ProfileAbout';
import ProfileSkills from '../components/profile/ProfileSkills';
import ProfileProjects from '../components/profile/ProfileProjects';
import ProfileActivity from '../components/profile/ProfileActivity';
import ProfileFriends from '../components/profile/ProfileFriends';
import EditProfile from '../components/profile/EditProfile';
import CreateProject from '../components/profile/CreateProject';

const Profile = () => {
  const { id } = useParams(); // This captures the dynamic id from the URL
  const [isEditing, setIsEditing] = useState(false);
  const [isCreatingProject, setIsCreatingProject] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Sample user data - in a real app, this would come from an API based on the id
  const sampleUser = {
    id: id || 'default',
    name: 'Name Surname',
    avatars: [
      'https://randomuser.me/api/portraits/men/1.jpg',
      'https://randomuser.me/api/portraits/men/2.jpg',
      'https://randomuser.me/api/portraits/men/3.jpg'
    ],
    description: 'Lorem ipsum dolor sit amet. Et facilis ducimus non laboriosam sunt et nesciunt quasi et ipsa voluptatem a quidem culpa.',
    location: 'Random Place Street',
    about: 'Lorem ipsum dolor sit amet.\nEt facilis ducimus non laboriosam sunt et nesciunt quasi et ipsa voluptatem a quidem culpa.',
    contact: {
      phone: '+1 (555) 123-4567',
      email: 'name.surname@example.com'
    },
    skills: ['Skill 1', 'Skill 2', 'Skill 3', 'Skill 4', 'Skill 5', 'Skill 6', 'Skill 7', 'Skill 8', 'Skill 9'],
    languages: ['Lang 1', 'Lang 2', 'Lang 3', 'Lang 4', 'Lang 5', 'Lang 6', 'Lang 7', 'Lang 8', 'Lang 9'],
    projects: [
      {
        initials: 'JD',
        title: 'Project Title',
        description: 'Lorem ipsum dolor sit amet. Et facilis ducimus non laboriosam sunt et nesciunt quasi et ipsa voluptatem a quidem culpa.'
      },
      {
        initials: 'PT',
        title: 'Project Title',
        description: 'Lorem ipsum dolor sit amet. Et facilis ducimus non laboriosam sunt et nesciunt quasi et ipsa voluptatem a quidem culpa.'
      },
      {
        initials: 'WD',
        title: 'Project Title',
        description: 'Lorem ipsum dolor sit amet. Et facilis ducimus non laboriosam sunt et nesciunt quasi et ipsa voluptatem a quidem culpa.'
      }
    ],
    activities: [
      {
        title: 'Random Event 1',
        description: 'Lorem ipsum dolor sit amet. Et facilis ducimus non laboriosam sunt et nesciunt quasi et ipsa voluptatem a quidem culpa.'
      },
      {
        title: 'Random Event 2',
        description: 'Lorem ipsum dolor sit amet. Et facilis ducimus non laboriosam sunt et nesciunt quasi et ipsa voluptatem a quidem culpa.'
      },
      {
        title: 'Random Event 3',
        description: 'Lorem ipsum dolor sit amet. Et facilis ducimus non laboriosam sunt et nesciunt quasi et ipsa voluptatem a quidem culpa.'
      }
    ],
    friends: [
      {
        avatar: 'https://randomuser.me/api/portraits/women/44.jpg',
        name: 'Sarah Johnson',
        title: 'Frontend Developer'
      },
      {
        avatar: 'https://randomuser.me/api/portraits/men/22.jpg',
        name: 'Michael Chen',
        title: 'Data Scientist'
      },
      {
        avatar: 'https://randomuser.me/api/portraits/women/33.jpg',
        name: 'Emma Rodriguez',
        title: 'Full Stack Dev'
      }
    ]
  };

  // Simulate API call to fetch user data based on ID
  useEffect(() => {
    const fetchUserData = async () => {
      setLoading(true);
      try {
        // In a real app, you would fetch data from an API:
        // const response = await fetch(`/api/users/${id}`);
        // const userData = await response.json();
        
        // For now, we'll use the sample data but customize it based on the ID
        const userData = {
          ...sampleUser,
          name: `User ${id}`,
          description: `This is the profile for user with ID: ${id}`,
          // You can customize other fields based on the ID if needed
        };
        
        setUser(userData);
      } catch (error) {
        console.error('Error fetching user data:', error);
        // Fallback to sample data
        setUser(sampleUser);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [id]); // This effect runs when the id changes

  const handleSaveProfile = (updatedData) => {
    setUser({
      ...user,
      ...updatedData,
      contact: {
        phone: updatedData.phone,
        email: updatedData.email
      }
    });
    setIsEditing(false);
  };

  const handleCreateProject = (projectData) => {
    const newProject = {
      initials: projectData.name.substring(0, 2).toUpperCase(),
      title: projectData.name,
      description: projectData.description
    };
    
    setUser({
      ...user,
      projects: [...user.projects, newProject]
    });
    setIsCreatingProject(false);
  };

  if (loading) {
    return (
      <div className="profile-container">
        <div className="loading">Loading profile...</div>
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
      <ProfileHeader user={user} />
      
      <div className="profile-actions">
        <button className="edit-profile-btn" onClick={() => setIsEditing(true)}>
          Edit Profile
        </button>
        <button className="create-project-btn" onClick={() => setIsCreatingProject(true)}>
          Create Project
        </button>
      </div>
      
      <div className="profile-content">
        <div className="profile-main">
          <ProfileAbout about={user.about} contact={user.contact} />
          <ProfileSkills skills={user.skills} languages={user.languages} />
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