import React, { useState } from 'react';
import ProjectFilters from '../components/projects/ProjectFilters';
import ProjectGrid from '../components/projects/ProjectGrid';
import CreateProjectModal from '../components/projects/CreateProjectModal';
import { Link } from 'react-router-dom';

const Projects = () => {
  const [activeTab, setActiveTab] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('All Types');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState('All Projects');

  // Sample project data
// In your Projects.js component, update the project data to include status flags:
const projects = [
  { 
    id: 1, 
    name: 'React Dashboard', 
    type: 'Web Application',
    isCheckedOut: false, 
    isFavorite: false, 
    lastUpdated: '2 hours ago',
    version: 'v1.2.5',
    created: '15 Jan 2023',
    description: 'A customizable admin dashboard built with React and Material UI. Features data visualization and user management.',
    tags: ['React', 'TypeScript', 'MaterialUI'],
    checkedOutBy: null
  },
  { 
    id: 2, 
    name: 'E-commerce API', 
    type: 'Backend Service',
    isCheckedOut: true, 
    isFavorite: true, 
    lastUpdated: '5 hours ago',
    version: 'v2.0.1',
    created: '5 Mar 2023',
    description: 'RESTful API for e-commerce applications built with Node.js, Express, and MongoDB.',
    tags: ['NodeJS', 'Express', 'MongoDB'],
    checkedOutBy: 'You'
  },
  { 
    id: 3, 
    name: 'Task Manager', 
    type: 'Mobile Application',
    isCheckedOut: false, 
    isFavorite: true, 
    lastUpdated: '1 day ago',
    version: 'v0.9.3',
    created: '22 Feb 2023',
    description: 'A full-stack task management application with real-time updates using Socket.io.',
    tags: ['ReactNative', 'NodeJS', 'SocketIO'],
    checkedOutBy: null
  },
  { 
    id: 4, 
    name: 'DevOps Handbook', 
    type: 'Documentation',
    isCheckedOut: true, 
    isFavorite: false, 
    lastUpdated: '2 days ago',
    version: 'v1.5.2',
    created: '10 Jan 2023',
    description: 'Comprehensive guide to DevOps practices with examples and implementation guides.',
    tags: ['DevOps', 'Docker', 'AWS'],
    checkedOutBy: 'Sarah'
  },
  { 
    id: 5, 
    name: 'UI Component Library', 
    type: 'Library',
    isCheckedOut: false, 
    isFavorite: true, 
    lastUpdated: '3 days ago',
    version: 'v3.1.0',
    created: '8 Apr 2023',
    description: 'A comprehensive set of reusable UI components for React applications.',
    tags: ['React', 'Storybook', 'CSS'],
    checkedOutBy: null
  },
  { 
    id: 6, 
    name: 'Data Analytics Platform', 
    type: 'Web Application',
    isCheckedOut: true, 
    isFavorite: false, 
    lastUpdated: '1 week ago',
    version: 'v2.3.4',
    created: '20 Mar 2023',
    description: 'Platform for analyzing and visualizing large datasets with interactive dashboards.',
    tags: ['Python', 'Django', 'PostgreSQL'],
    checkedOutBy: 'John'
  },
  { 
    id: 7, 
    name: 'Mobile Game', 
    type: 'Mobile Application',
    isCheckedOut: false, 
    isFavorite: true, 
    lastUpdated: '1 week ago',
    version: 'v1.0.0',
    created: '12 May 2023',
    description: 'A casual mobile game built with Unity for iOS and Android platforms.',
    tags: ['Unity', 'C#', 'Mobile'],
    checkedOutBy: null
  },
  { 
    id: 8, 
    name: 'API Gateway', 
    type: 'Backend Service',
    isCheckedOut: false, 
    isFavorite: false, 
    lastUpdated: '2 weeks ago',
    version: 'v1.7.0',
    created: '3 Feb 2023',
    description: 'Microservices API gateway with authentication, rate limiting, and logging.',
    tags: ['Go', 'Kubernetes', 'Redis'],
    checkedOutBy: null
  }
];
  const tabs = [
    { name: 'All', count: 4 },
    { name: 'Checked In', count: 5 },
    { name: 'Checked Out', count: 3 },
    { name: 'Favorites', count: 2 }
  ];

  const filterTypes = [
    'All Types',
    'Web Application',
    'Mobile Application',
    'Backend Service',
    'Documentation'
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

  return (
    <div className="home-container">
      <div className="home-layout">
        {/* Sidebar */}
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
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4极2"></path>
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
                  <a href="#" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none', color: 'inherit' }}>
                    {filter.icon === 'star' && (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 极 2"></polygon>
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
        
        {/* Projects Content */}
        <main className="main-content">
          <div className="feed-header">
            <h2 className="feed-title">My Projects</h2>
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
            projects={projects}
            activeTab={activeTab}
            searchQuery={searchQuery}
            filterType={filterType}
          />
        </main>
        
        {/* Right Sidebar */}
        <aside className="sidebar-right">
          <div className="sidebar-section">
            <h3 className="section-title">Quick Actions</h3>
            <ul className="projects-list">
              <li className="project-item">Create New Project</li>
              <li className="project-item">Import Project</li>
              <li className="project-item">Export Projects</li>
            </ul>
          </div>
          
          <div className="sidebar-section">
            <h3 className="section-title">Recent Activity</h3>
            <ul className="projects-list">
              <li className="project-item">Project 2 checked out</li>
              <li className="project-item">Project 5 updated</li>
              <li className="project-item">New comment on Project 3</li>
            </ul>
          </div>
        </aside>
      </div>

      {/* Create Project Modal */}
      <CreateProjectModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
};

export default Projects;