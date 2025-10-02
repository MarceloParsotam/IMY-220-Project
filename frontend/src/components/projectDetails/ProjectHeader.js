// ProjectHeader.js - Updated with action handlers
import React from 'react';

const ProjectHeader = ({ project, onCheckout, onCheckin, onFavorite }) => {
  const isOwner = true; // You'll need to pass this as a prop or determine it

  return (
    <div className="project-header">
      <h1 className="project-title">{project.name}</h1>
      <div className="project-meta">
        <span className="project-username">{project.username}</span>
        <span className="project-date">Started {project.startDate}</span>
        <span className="project-views">{project.views} views</span>
      </div>
      <div className="project-languages">
        {project.languages && project.languages.map((lang, index) => (
          <span key={index} className="language-tag">{lang}</span>
        ))}
      </div>
      <div className="project-actions">
        {!project.isCheckedOut ? (
          <button className="project-btn primary-btn" onClick={onCheckout}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 15v4c0 1.1.9 2 2 2h14a2 2 0 0 0 2-2v-4M17 9l-5-5-5 5M12 4.2v10.3"></path>
            </svg>
            Check Out
          </button>
        ) : (
          <button className="project-btn secondary-btn" onClick={onCheckin}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 19V5M5 12l7-7 7 7"></path>
            </svg>
            Check In
          </button>
        )}
        
        <button className="project-btn secondary-btn" onClick={onFavorite}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
          </svg>
          {project.isFavorite ? 'Unfavorite' : 'Favorite'}
        </button>
      </div>
    </div>
  );
};

export default ProjectHeader;