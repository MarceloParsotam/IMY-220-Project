import React from 'react';
import { Link } from 'react-router-dom';

const ProjectCard = ({ project }) => {
  return (
    <div className="project-card message-card">
      <div className="project-header">
        <div className="project-title-section">
          <h3 className="project-title">{project.name}</h3>
          <div className="project-type">{project.type}</div>
        </div>
        <div className="project-status-container">
          <div className={`project-status ${project.isCheckedOut ? 'status-checked-out' : 'status-checked-in'}`}>
            {project.isCheckedOut 
              ? `Checked Out (${project.checkedOutBy})` 
              : 'Checked In'
            }
          </div>
          {project.isFavorite && (
            <div className="project-favorite">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
              </svg>
              FAVORITE
            </div>
          )}
        </div>
      </div>
      
      <p className="project-description">{project.description}</p>
      
      <div className="project-meta">
        <span className="project-version">{project.version}</span>
        <span className="project-created">Created: {project.created}</span>
        <span className="project-updated">Updated: {project.lastUpdated}</span>
      </div>
      
      <div className="project-tags">
        {project.tags.map(tag => (
          <span key={tag} className="project-tag">#{tag}</span>
        ))}
      </div>
      
      <div className="project-actions">
        {project.isCheckedOut ? (
          <button className="project-btn primary-btn" disabled={project.checkedOutBy !== 'You'}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 19V5M5 12l7-7 7 7"></path>
            </svg>
            {project.checkedOutBy === 'You' ? 'Check In' : 'Checked Out'}
          </button>
        ) : (
          <button className="project-btn primary-btn">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 15v4c0 1.1.9 2 2 2h14a2 2 0 0 0 2-2v-4M17 9l-5-5-5 5M12 4.2v10.3"></path>
            </svg>
            Check Out
          </button>
        )}
        <Link to={`/projects/${project.id}`} className="project-btn secondary-btn">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                <circle cx="12" cy="12" r="3"></circle>
            </svg>
            View
        </Link>
        <button className="project-btn secondary-btn">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path>
          </svg>
          Edit
        </button>
      </div>
    </div>
  );
};

export default ProjectCard;