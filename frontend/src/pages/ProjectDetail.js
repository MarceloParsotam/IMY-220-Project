import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import ProjectHeader from '../components/projectDetails/ProjectHeader';
import ProjectAbout from '../components/projectDetails/ProjectAbout';
import MessagesSection from '../components/projectDetails/MessagesSection';
import ProjectTabs from '../components/projectDetails/ProjectTabs';
import EditProject from '../components/projectDetails/EditProject';

const ProjectDetail = () => {
  const { id } = useParams(); // This captures the dynamic id from the URL
  const [activeTab, setActiveTab] = useState('overview');
  const [isEditing, setIsEditing] = useState(false);
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);

  // Sample project data - in a real app, this would come from an API based on the id
  const sampleProject = {
    id: id || 'default',
    name: 'React Dashboard',
    username: 'developer123',
    startDate: '15 Jan 2023',
    views: 1250,
    languages: ['JavaScript', 'TypeScript', 'CSS'],
    description: 'A customizable admin dashboard built with React and Material UI. Features data visualization and user management.',
    members: ['John Doe', 'Jane Smith', 'Mike Johnson'],
    technologies: ['React', 'Node.js', 'MongoDB', 'Express'],
    downloads: 543,
    stars: 128,
    version: 'v1.2.5',
    messages: [
      { user: 'John Doe', time: '2 hours ago', message: 'Fixed responsive issues' },
      { user: 'Jane Smith', time: '5 hours ago', message: 'Updated dependencies' },
      { user: 'Mike Johnson', time: '1 day ago', message: 'Added new chart component' }
    ],
    checkoutMessages: [
      { user: 'Sarah Wilson', time: '3 hours ago', message: 'Working on new feature implementation' },
      { user: 'Mike Chen', time: '1 day ago', message: 'Fixing bug in authentication module' }
    ],
    files: [
      { name: 'src/components', type: 'folder', changes: 'Member 1', time: '2 hours ago' },
      { name: 'src/utils', type: 'folder', changes: 'Member 2', time: '5 hours ago' },
      { name: 'src/styles', type: 'folder', changes: 'Member 3', time: '1 day ago' },
      { name: 'package.json', type: 'file', changes: 'Member 1', time: '2 hours ago' },
      { name: 'README.md', type: 'file', changes: 'Member 2', time: '5 hours ago' }
    ],
    discussions: [
      {
        user: 'User 1',
        time: '3 days ago',
        content: 'Lorem ipsum dolor sit amet. Et facilis ducimus non laboriosam sunt et nesciunt quasi et ipsa voluptatem a quidem culpa. Sit nulla nihil est aspernatur itaque hic consequuntur corrupti eos iusto iste. Ut totam provident et exercitationem cumque aut dolores vitae qui voluptatem voluptate.'
      },
      {
        user: 'User 2',
        time: '1 week ago',
        content: 'Ut fugit autem est sunt quis qui repudiandae consequatur qui repudiandae tenetur qui voluptates tenetur aut suscipit fugiti. Lorem ipsum dolor sit amet. Et facilis ducimus non laboriosam sunt et nesciunt quasi et ipsa voluptatem a quidem culpa.'
      }
    ]
  };

  // Simulate API call to fetch project data based on ID
  useEffect(() => {
    const fetchProjectData = async () => {
      setLoading(true);
      try {
        // In a real app, you would fetch data from an API:
        // const response = await fetch(`/api/projects/${id}`);
        // const projectData = await response.json();
        
        // For now, we'll use the sample data but customize it based on the ID
        const projectData = {
          ...sampleProject,
          name: `Project ${id}`,
          description: `This is project with ID: ${id}. A customizable admin dashboard built with React and Material UI.`,
          // You can customize other fields based on the ID if needed
        };
        
        setProject(projectData);
      } catch (error) {
        console.error('Error fetching project data:', error);
        // Fallback to sample data
        setProject(sampleProject);
      } finally {
        setLoading(false);
      }
    };

    fetchProjectData();
  }, [id]); // This effect runs when the id changes

  const handleAddMessage = (message, type) => {
    const newMessage = {
      user: 'You', // Current user
      time: 'Just now',
      message: message
    };
    
    if (type === 'checkin') {
      setProject({
        ...project,
        messages: [...project.messages, newMessage]
      });
    } else {
      setProject({
        ...project,
        checkoutMessages: [...project.checkoutMessages, newMessage]
      });
    }
  };

  const handleSaveProject = (updatedData) => {
    setProject({
      ...project,
      ...updatedData,
      // Ensure arrays are properly formatted
      technologies: Array.isArray(updatedData.technologies) ? updatedData.technologies : [],
      members: Array.isArray(updatedData.members) ? updatedData.members : []
    });
    setIsEditing(false);
  };

  if (loading) {
    return (
      <div className="home-container">
        <div className="loading">Loading project...</div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="home-container">
        <div className="error">Project not found</div>
      </div>
    );
  }

  return (
    <div className="home-container">
      <div className="project-detail-container">
        <div className="project-header-actions">
          <ProjectHeader project={project} />
          <button 
            className="edit-project-btn"
            onClick={() => setIsEditing(true)}
          >
            Edit Project
          </button>
        </div>

        <hr className="divider" />

        <ProjectAbout project={project} />

        <hr className="divider" />

        <MessagesSection 
          messages={project.messages}
          checkoutMessages={project.checkoutMessages}
          onAddCheckinMessage={(message) => handleAddMessage(message, 'checkin')}
          onAddCheckoutMessage={(message) => handleAddMessage(message, 'checkout')}
        />

        <hr className="divider" />

        <ProjectTabs 
          activeTab={activeTab} 
          setActiveTab={setActiveTab} 
          project={project} 
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