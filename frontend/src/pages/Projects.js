import React, { useState, useEffect } from 'react';
import ProjectFilters from '../components/projects/ProjectFilters';
import ProjectGrid from '../components/projects/ProjectGrid';
import CreateProjectModal from '../components/projects/CreateProjectModal';
import { useAuth } from '../contexts/AuthContext';

const Projects = () => {
  const [activeTab, setActiveTab] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('All Types');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState('All Projects');
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const { currentUser } = useAuth();

  // Get token from localStorage
  const getToken = () => {
    const userData = JSON.parse(localStorage.getItem('user'));
    return userData?._id || userData?.id || '';
  };

  // Fetch user's projects from API
  const fetchUserProjects = async () => {
    if (!currentUser) return;

    try {
      const token = getToken();
      const userId = currentUser._id || currentUser.id;

      const response = await fetch(`http://localhost:3000/api/projects/user/${userId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const projectsData = await response.json();
        setProjects(projectsData);
      }
    } catch (error) {
      console.error('Error fetching projects:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserProjects();
  }, [currentUser]);

  // Handle project creation
  const handleCreateProject = async (projectData) => {
    try {
      const token = getToken();
      const userId = currentUser._id || currentUser.id;

      const response = await fetch('http://localhost:3000/api/projects', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: projectData.projectName,
          description: projectData.projectDescription,
          type: projectData.projectType,
          tags: projectData.tags || [],
          isPublic: true
        })
      });

      if (response.ok) {
        await fetchUserProjects(); // Refresh the projects list
        setIsModalOpen(false);
        alert('Project created successfully!');
      } else {
        const error = await response.json();
        alert(error.message || 'Failed to create project');
      }
    } catch (error) {
      console.error('Error creating project:', error);
      alert('Failed to create project');
    }
  };

  // Handle checkout updates
  const handleCheckoutUpdate = (projectId, isCheckedOut, checkoutData) => {
    setProjects(prevProjects => 
      prevProjects.map(project => 
        project.id === projectId 
          ? { 
              ...project, 
              isCheckedOut, 
              currentCheckout: checkoutData 
            } 
          : project
      )
    );
  };

  // Filter projects based on active tab
  const filteredProjects = projects.filter(project => {
    if (activeTab === 'Checked Out') return project.isCheckedOut;
    if (activeTab === 'Checked In') return !project.isCheckedOut;
    if (activeTab === 'Favorites') return project.isFavorite;
    return true; // 'All' tab
  });

  const tabs = [
    { name: 'All', count: projects.length },
    { name: 'Checked In', count: projects.filter(p => !p.isCheckedOut).length },
    { name: 'Checked Out', count: projects.filter(p => p.isCheckedOut).length },
    { name: 'Favorites', count: projects.filter(p => p.isFavorite).length }
  ];

  const filterTypes = [
    'All Types',
    'Web Application',
    'Mobile Application',
    'Backend Service',
    'Documentation',
    'Library'
  ];

  const categories = [
    { name: 'All Projects', icon: 'folder' },
    { name: 'Owned Projects', icon: 'user' },
    { name: 'Shared Projects', icon: 'users' }
  ];

  const filters = [
    { name: 'Recently Updated', icon: 'star' },
    { name: 'Web Applications', icon: 'globe' },
    { name: 'Mobile Apps', icon: 'smartphone' }
  ];

  if (loading) {
    return (
      <div className="home-container">
        <div className="loading">Loading projects...</div>
      </div>
    );
  }

  return (
    <div className="home-container">
      <div className="home-layout">
        {/* Sidebar and main content remain the same as before */}
        <aside className="sidebar-left">
          {/* ... your existing sidebar code ... */}
        </aside>
        
        <main className="main-content">
          <div className="feed-header">
            <h2 className="feed-title">My Projects ({projects.length})</h2>
            <button className="connect-btn" onClick={() => setIsModalOpen(true)}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="5" x2="12" y2="19"></line>
                <line x1="5" y1="12" x2="19" y2="12"></line>
              </svg>
              Create Project
            </button>
          </div>
          
          <ProjectFilters 
            tabs={tabs}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            filterType={filterType}
            setFilterType={setFilterType}
            filterTypes={filterTypes}
          />
          
          <ProjectGrid 
            projects={filteredProjects}
            activeTab={activeTab}
            searchQuery={searchQuery}
            filterType={filterType}
            onCheckoutUpdate={handleCheckoutUpdate}
          />
        </main>
        
        <aside className="sidebar-right">
          {/* ... your existing sidebar code ... */}
        </aside>
      </div>

      <CreateProjectModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onCreateProject={handleCreateProject}
      />
    </div>
  );
};

export default Projects;