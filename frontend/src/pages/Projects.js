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
  const [filteredProjects, setFilteredProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const { currentUser } = useAuth();

  // Get token from localStorage
  const getToken = () => {
    const userData = JSON.parse(localStorage.getItem('user'));
    return userData?._id || userData?.id || '';
  };
  // Fetch all projects (user's projects + public projects)
const fetchAllProjects = async () => {
  if (!currentUser) return;

  try {
    setLoading(true);
    const token = getToken();

    const response = await fetch(`http://localhost:3000/api/projects/all`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (response.ok) {
      const projectsData = await response.json();
      setProjects(projectsData);
      setFilteredProjects(projectsData);
    } else {
      console.error('Failed to fetch projects');
    }
  } catch (error) {
    console.error('Error fetching projects:', error);
  } finally {
    setLoading(false);
  }
};

useEffect(() => {
  fetchAllProjects(); // Changed from fetchUserProjects
}, [currentUser]);
  // Fetch user's projects from API
  const fetchUserProjects = async () => {
    if (!currentUser) return;

    try {
      setLoading(true);
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
        setFilteredProjects(projectsData); // Initialize filtered projects
      } else {
        console.error('Failed to fetch projects');
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

  // Filter projects based on active category, tab, search, and type
  // Filter projects based on active category, tab, search, and type
useEffect(() => {
  let filtered = projects;

  // Filter by category (All Projects, Owned Projects, Shared Projects)
  if (activeCategory === 'Owned Projects') {
    filtered = filtered.filter(project => 
      project.userId === (currentUser?._id || currentUser?.id)
    );
  } else if (activeCategory === 'Shared Projects') {
    filtered = filtered.filter(project => 
      project.userId !== (currentUser?._id || currentUser?.id) && project.isPublic
    );
  }
  // 'All Projects' shows everything

  // ... rest of your filtering logic remains the same
  // Filter by tab (All, Checked In, Checked Out, Favorites)
  if (activeTab === 'Checked In') {
    filtered = filtered.filter(project => !project.isCheckedOut);
  } else if (activeTab === 'Checked Out') {
    filtered = filtered.filter(project => project.isCheckedOut);
  } else if (activeTab === 'Favorites') {
    filtered = filtered.filter(project => project.isFavorite);
  }

  // Filter by search query
  if (searchQuery) {
    filtered = filtered.filter(project =>
      project.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.tags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  }

  // Filter by project type
  if (filterType !== 'All Types') {
    filtered = filtered.filter(project => project.type === filterType);
  }

  setFilteredProjects(filtered);
}, [projects, activeCategory, activeTab, searchQuery, filterType, currentUser]);

  // In Projects.js - handleCreateProject function
const handleCreateProject = async (formData) => {
  try {
    const token = getToken();
    const userId = currentUser._id || currentUser.id;

    // Debug: Log FormData contents
    console.log('FormData contents:');
    for (let [key, value] of formData.entries()) {
      console.log(key, value);
    }

    // Make sure userId is added
    formData.append('userId', userId);

    const response = await fetch('http://localhost:3000/api/projects', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        // Don't set Content-Type - let browser set it with boundary
      },
      body: formData
    });

    const responseText = await response.text();
    console.log('Raw response:', responseText);

    if (response.ok) {
      let projectData;
      try {
        projectData = JSON.parse(responseText);
        console.log('Project created successfully:', projectData);
      } catch (e) {
        console.error('Failed to parse response as JSON:', e);
      }
      await fetchAllProjects();
      setIsModalOpen(false);
      alert('Project created successfully!');
    } else {
      let errorMessage = `Error: ${response.status}`;
      try {
        const errorData = JSON.parse(responseText);
        errorMessage = errorData.message || errorMessage;
      } catch (e) {
        errorMessage = `${errorMessage} - ${responseText}`;
      }
      alert(errorMessage);
    }
  } catch (error) {
    console.error('Error creating project:', error);
    alert(`Network error: ${error.message}`);
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

  // Handle project deletion
  const handleDeleteProject = async (projectId) => {
    if (!window.confirm('Are you sure you want to delete this project?')) {
      return;
    }

    try {
      const token = getToken();
      const response = await fetch(`http://localhost:3000/api/projects/${projectId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        await fetchUserProjects(); // Refresh the projects list
        alert('Project deleted successfully!');
      } else {
        const error = await response.json();
        alert(error.message || 'Failed to delete project');
      }
    } catch (error) {
      console.error('Error deleting project:', error);
      alert('Failed to delete project');
    }
  };

  // Handle project editing
  const handleEditProject = async (projectId, updatedData) => {
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
        await fetchUserProjects(); // Refresh the projects list
        alert('Project updated successfully!');
      } else {
        const error = await response.json();
        alert(error.message || 'Failed to update project');
      }
    } catch (error) {
      console.error('Error updating project:', error);
      alert('Failed to update project');
    }
  };

  const handleFavoriteUpdate = (projectId, isFavorite) => {
    setProjects(prevProjects => 
      prevProjects.map(project => 
        project.id === projectId 
          ? { ...project, isFavorite } 
          : project
      )
    );
  };
  // Calculate counts for tabs
  const getTabCounts = () => {
    const allCount = projects.length;
    const checkedInCount = projects.filter(p => !p.isCheckedOut).length;
    const checkedOutCount = projects.filter(p => p.isCheckedOut).length;
    const favoritesCount = projects.filter(p => p.isFavorite).length;

    return [
      { name: 'All', count: allCount },
      { name: 'Checked In', count: checkedInCount },
      { name: 'Checked Out', count: checkedOutCount },
      { name: 'Favorites', count: favoritesCount }
    ];
  };

  const tabs = getTabCounts();
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
        {/* Left Sidebar - Categories and Filters */}
        <aside className="sidebar-left">
          <div className="sidebar-section">
            <h3 className="section-title">My Projects</h3>
            <ul className="projects-list">
              {categories.map(category => (
                <li key={category.name} className="project-item">
                  <a 
                    href="#" 
                    className={activeCategory === category.name ? 'active' : ''}
                    onClick={(e) => {
                      e.preventDefault();
                      setActiveCategory(category.name);
                    }}
                    style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none', color: 'inherit' }}
                  >
                    {category.icon === 'folder' && (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 2h5a2 2 0 0 1 2 2z"></path>
                      </svg>
                    )}
                    {category.icon === 'user' && (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                        <circle cx="12" cy="7" r="4"></circle>
                      </svg>
                    )}
                    {category.icon === 'users' && (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                        <circle cx="9" cy="7" r="4"></circle>
                        <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                        <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                      </svg>
                    )}
                    {category.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>
          
          <div className="sidebar-section">
            <h3 className="section-title">Filters</h3>
            <ul className="projects-list">
              {filters.map(filter => (
                <li key={filter.name} className="project-item">
                  <a 
                    href="#" 
                    onClick={(e) => {
                      e.preventDefault();
                      // Implement filter logic here
                      if (filter.name === 'Recently Updated') {
                        setFilteredProjects(prev => 
                          [...prev].sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
                        );
                      } else if (filter.name === 'Web Applications') {
                        setFilterType('Web Application');
                      } else if (filter.name === 'Mobile Apps') {
                        setFilterType('Mobile Application');
                      }
                    }}
                    style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none', color: 'inherit' }}
                  >
                    {filter.icon === 'star' && (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                      </svg>
                    )}
                    {filter.icon === 'globe' && (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="10"></circle>
                        <line x1="2" y1="12" x2="22" y2="12"></line>
                        <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
                      </svg>
                    )}
                    {filter.icon === 'smartphone' && (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="5" y="2" width="14" height="20" rx="2" ry="2"></rect>
                        <line x1="12" y1="18" x2="12" y2="18"></line>
                      </svg>
                    )}
                    {filter.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </aside>
        
        {/* Main Content */}
        <main className="main-content">
          <div className="feed-header">
            <h2 className="feed-title">My Projects ({filteredProjects.length})</h2>
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
            onDeleteProject={handleDeleteProject}
            onEditProject={handleEditProject}
            onFavoriteUpdate={handleFavoriteUpdate}
          />
        </main>
        
        {/* Right Sidebar */}
        <aside className="sidebar-right">
          <div className="sidebar-section">
            <h3 className="section-title">Quick Actions</h3>
            <ul className="projects-list">
              <li className="project-item" onClick={() => setIsModalOpen(true)}>
                Create New Project
              </li>
              <li className="project-item">
                Import Project
              </li>
              <li className="project-item">
                Export Projects
              </li>
            </ul>
          </div>
          
          <div className="sidebar-section">
            <h3 className="section-title">Recent Activity</h3>
            <ul className="projects-list">
              {projects.slice(0, 3).map(project => (
                <li key={project.id} className="project-item">
                  {project.name} - {project.isCheckedOut ? 'Checked Out' : 'Updated'}
                </li>
              ))}
              {projects.length === 0 && (
                <li className="project-item">No recent activity</li>
              )}
            </ul>
          </div>
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