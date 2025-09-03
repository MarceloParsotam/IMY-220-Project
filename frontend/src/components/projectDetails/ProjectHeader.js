import React from 'react';

const ProjectHeader = ({ project }) => {
  return (
    <div className="project-header">
      <h1 className="project-title">{project.name}</h1>
      <div className="project-meta">
        <span className="project-username">{project.username}</span>
        <span className="project-date">Started {project.startDate}</span>
        <span className="project-views">{project.views} views</span>
      </div>
      <div className="project-languages">
        {project.languages.map((lang, index) => (
          <span key={index} className="language-tag">{lang}</span>
        ))}
      </div>
      <div className="project-actions">
        <button className="project-btn primary-btn">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 15v4c0 1.1.9 2 2 2h14a2 2 0 0 0 2-2v-4M17 9l-5-5-5 5M12 4.2v10.3"></path>
          </svg>
          Check Out
        </button>
        <button className="project-btn secondary-btn">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 19V5M5 12l7-7 7 7"></path>
          </svg>
          Check In
        </button>
      </div>
    </div>
  );
};

export default ProjectHeader;