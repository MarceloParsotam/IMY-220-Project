// ProjectDetail.js - UPDATED
import React, { useState, useEffect } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import ProjectHeader from '../components/projectDetails/ProjectHeader';
import ProjectAbout from '../components/projectDetails/ProjectAbout';
import MessagesSection from '../components/projectDetails/MessagesSection';
import ProjectTabs from '../components/projectDetails/ProjectTabs';
import EditProject from '../components/projectDetails/EditProject';
import { useAuth } from '../contexts/AuthContext';

const ProjectDetail = () => {
  const { projectId } = useParams(); // CHANGED: from 'id' to 'projectId'
  const location = useLocation();
  const [activeTab, setActiveTab] = useState('files'); // CHANGED: 'files' as default
  const [isEditing, setIsEditing] = useState(false);
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { currentUser } = useAuth();

  console.log('ProjectDetail - projectId from useParams:', projectId); // Debug log

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
      
      setProject(projectData);
    } catch (error) {
      console.error('Error fetching project:', error);
      setError(error.message);
      setProject(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    console.log('useEffect triggered with projectId:', projectId);
    
    if (projectId) {
      fetchProjectData(projectId);
    } else {
      setError('No project ID found in URL');
      setLoading(false);
    }
  }, [projectId]);

  // Update all functions to use projectId instead of id
  const handleAddMessage = async (message, type) => {
    if (!project || !currentUser || !message.trim()) {
      setError('Message cannot be empty');
      return;
    }

    try {
      const token = getToken();
      
      // Use the correct endpoints for messages
      const endpoint = type === 'checkin' 
        ? `http://localhost:3000/api/projects/${projectId}/checkin-message`
        : `http://localhost:3000/api/projects/${projectId}/checkout-message`;

      console.log('Adding message to endpoint:', endpoint);

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

      const result = await response.json();
      console.log('Message added successfully:', result);
      
      // Refresh project data to get updated messages
      await fetchProjectData(projectId);
      
    } catch (error) {
      console.error(`Error adding ${type} message:`, error);
      setError(error.message || `Failed to add ${type} message`);
    }
  };

  const handleSaveProject = async (updatedData) => {
    if (!project || !currentUser) return;

    try {
      const token = getToken();
      const response = await fetch(`http://localhost:3000/api/projects/${projectId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updatedData)
      });

      if (response.ok) {
        await fetchProjectData(projectId);
        setIsEditing(false);
      } else {
        console.error('Failed to update project');
        setError('Failed to update project');
      }
    } catch (error) {
      console.error('Error updating project:', error);
      setError('Error updating project');
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
          <p>Project ID from URL: {projectId || 'Not found'}</p>
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
          <p>ID: {projectId}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="home-container">
      <div className="project-detail-container">
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