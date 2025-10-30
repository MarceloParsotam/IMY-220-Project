// ProjectDetail.js - FIXED with views tracking
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import ProjectHeader from '../components/projectDetails/ProjectHeader';
import ProjectAbout from '../components/projectDetails/ProjectAbout';
import MessagesSection from '../components/projectDetails/MessagesSection';
import ProjectTabs from '../components/projectDetails/ProjectTabs';
import EditProject from '../components/projectDetails/EditProject';
import { useAuth } from '../contexts/AuthContext';

const ProjectDetail = () => {
  const { projectId } = useParams();
  const [activeTab, setActiveTab] = useState('files');
  const [isEditing, setIsEditing] = useState(false);
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { currentUser } = useAuth();

  // Get token from localStorage
  const getToken = () => {
    const userData = JSON.parse(localStorage.getItem('user'));
    return userData?._id || userData?.id || '';
  };

  // Fetch project data from API
  const fetchProjectData = async (pid) => {
    if (!pid) {
      setError('Project ID is missing');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError('');
      const token = getToken();

      console.log('Fetching project with ID:', pid);

      const response = await fetch(`http://localhost:3000/api/projects/${pid}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Project not found');
        } else {
          throw new Error(`Failed to fetch project: ${response.status}`);
        }
      }

      const projectData = await response.json();
      console.log('Project data received:', projectData);
      console.log('Project image data:', projectData.image);
      console.log('Does project have image data?', !!projectData.image);
      console.log('Image data structure:', projectData.image);
      
      setProject(projectData);
    } catch (error) {
      console.error('Error fetching project:', error);
      setError(error.message);
      setProject(null);
    } finally {
      setLoading(false);
    }
  };

  // Increment views count when project is loaded
  const incrementViewsCount = async () => {
    if (!projectId) return;
    
    try {
      const token = getToken();
      const response = await fetch(`http://localhost:3000/api/projects/${projectId}/increment-views`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        console.log('Failed to increment views count');
      }
    } catch (error) {
      console.error('Error incrementing views:', error);
      // Don't show error to user - views tracking is not critical
    }
  };

  useEffect(() => {
    if (projectId) {
      fetchProjectData(projectId);
    } else {
      setError('No project ID found in URL');
      setLoading(false);
    }
  }, [projectId]);

  // Increment views when project is successfully loaded
  useEffect(() => {
    if (project && project._id) {
      incrementViewsCount();
    }
  }, [project]); // This runs when project changes

  // Get image URL - SIMPLE VERSION
  const getImageUrl = () => {
    if (!project) return null;
    
    console.log('Checking for image in project:', project);
    
    // Check if image data exists in the project
    if (project.image && project.image.data) {
      const imageUrl = `data:${project.image.contentType};base64,${project.image.data}`;
      console.log('Created image URL from Base64 data');
      return imageUrl;
    }
    
    // If no image data, return null
    console.log('No image data found in project');
    return null;
  };

  const imageUrl = getImageUrl();

  const handleAddMessage = async (message, type) => {
    if (!project || !currentUser || !message.trim()) {
      setError('Message cannot be empty');
      return;
    }

    try {
      const token = getToken();
      
      const endpoint = type === 'checkin' 
        ? `http://localhost:3000/api/projects/${projectId}/checkin-message`
        : `http://localhost:3000/api/projects/${projectId}/checkout-message`;

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ message: message.trim() })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Failed to add ${type} message`);
      }

      await fetchProjectData(projectId);
      
    } catch (error) {
      console.error(`Error adding ${type} message:`, error);
      setError(error.message || `Failed to add ${type} message`);
    }
  };

  const handleSaveProject = async (updatedData, imageFile) => {
    if (!project || !currentUser) return;

    try {
      const token = getToken();
      
      let body;
      let headers = {
        'Authorization': `Bearer ${token}`
      };

      if (imageFile) {
        const formData = new FormData();
        formData.append('projectImage', imageFile);
        
        Object.keys(updatedData).forEach(key => {
          if (key === 'technologies' || key === 'members' || key === 'tags') {
            formData.append(key, JSON.stringify(updatedData[key]));
          } else {
            formData.append(key, updatedData[key]);
          }
        });
        
        body = formData;
      } else {
        body = JSON.stringify(updatedData);
        headers['Content-Type'] = 'application/json';
      }

      const response = await fetch(`http://localhost:3000/api/projects/${projectId}`, {
        method: 'PUT',
        headers: headers,
        body: body
      });

      if (response.ok) {
        await fetchProjectData(projectId);
        setIsEditing(false);
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update project');
      }
    } catch (error) {
      console.error('Error updating project:', error);
      setError('Error updating project: ' + error.message);
    }
  };

  const handleCheckout = async () => {
    const message = prompt('Enter checkout message:');
    if (message !== null) {
      await handleAddMessage(message, 'checkout');
    }
  };

  const handleCheckin = async () => {
    const message = prompt('Enter checkin message:');
    if (message !== null) {
      await handleAddMessage(message, 'checkin');
    }
  };

  const handleFavorite = async () => {
    if (!project || !currentUser) return;

    try {
      const token = getToken();
      const endpoint = `http://localhost:3000/api/projects/${projectId}/favorite`;
      const method = project.isFavorite ? 'DELETE' : 'POST';

      const response = await fetch(endpoint, {
        method: method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        await fetchProjectData(projectId);
      } else {
        console.error('Failed to toggle favorite');
        setError('Failed to toggle favorite');
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
      setError('Error toggling favorite');
    }
  };

  const handleRetry = () => {
    setError('');
    fetchProjectData(projectId);
  };

  if (loading) {
    return (
      <div className="home-container">
        <div className="loading">Loading project...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="home-container">
        <div className="error">
          <p>Error: {error}</p>
          <button onClick={handleRetry} className="retry-btn">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="home-container">
        <div className="error">
          <p>Project not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="home-container">
      <div className="project-detail-container">
        {/* Project Image Display - SIMPLE */}
        {imageUrl ? (
          <div className="project-image-section">
            <img 
              src={imageUrl} 
              alt={project.name} 
              className="project-detail-image"
              onError={(e) => {
                console.error('Image failed to load:', e);
                e.target.style.display = 'none';
              }}
              onLoad={() => console.log('Project image loaded successfully')}
            />
          </div>
        ) : (
          <div className="no-image-placeholder">
            <p>No project image available</p>
            <small>Add an image when editing the project</small>
          </div>
        )}

        <div className="project-header-actions">
          <ProjectHeader 
            project={project} 
            onCheckout={handleCheckout}
            onCheckin={handleCheckin}
            onFavorite={handleFavorite}
          />
          {project.userId && currentUser && (project.userId.toString() === (currentUser._id || currentUser.id).toString()) && (
            <button 
              className="edit-project-btn"
              onClick={() => setIsEditing(true)}
            >
              Edit Project
            </button>
          )}
        </div>

        <hr className="divider" />

        <ProjectAbout project={project} />

        <hr className="divider" />

        <MessagesSection 
          messages={project.messages || []}
          checkoutMessages={project.checkoutMessages || []}
          onAddCheckinMessage={(message) => handleAddMessage(message, 'checkin')}
          onAddCheckoutMessage={(message) => handleAddMessage(message, 'checkout')}
        />

        <hr className="divider" />

        <ProjectTabs 
          activeTab={activeTab} 
          setActiveTab={setActiveTab} 
          project={project} 
          currentUser={currentUser}
          onRefreshProject={() => fetchProjectData(projectId)}
        />
      </div>

      {isEditing && (
        <EditProject
          project={project}
          onSave={handleSaveProject}
          onCancel={() => setIsEditing(false)}
        />
      )}
    </div>
  );
};

export default ProjectDetail;