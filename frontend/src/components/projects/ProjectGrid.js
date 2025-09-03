import React from 'react';
import { Link } from 'react-router-dom';

const ProjectGrid = ({ projects, activeTab, searchQuery, filterType }) => {
  // Filter projects based on active tab, search query, and filter type
  const filteredProjects = projects.filter(project => {
    // Add your filtering logic here based on activeTab, searchQuery, filterType
    return true; // Return all projects for now
  });

  return (
    <div className="friends-grid"> {/* Using friends-grid class for consistency */}
      {filteredProjects.map((project) => (
        <div key={project.id} className="friend-card"> {/* Using friend-card class */}
          <Link to={`/projects/${project.id}`} className="project-link">
            <img src={project.image} alt={project.name} className="friend-avatar" />
            <h3 className="friend-name">{project.name}</h3>
            <p className="friend-title">{project.type}</p>
            <div className="friend-stats">
              <div className="friend-stat">
                <span className="stat-number">{project.version}</span>
                <span>Version</span>
              </div>
              <div className="friend-stat">
                <span className="stat-number">{project.lastUpdated}</span>
                <span>Last Updated</span>
              </div>
            </div>
            <p className="project-description">{project.description}</p>
          </Link>
          <div className="friend-actions">
            <button className="friend-btn primary-btn">Check Out</button>
            <button className="friend-btn secondary-btn">Details</button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ProjectGrid;