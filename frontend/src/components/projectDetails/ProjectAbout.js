// ProjectAbout.js - COMPLETE UPDATED FILE
import React from 'react';

const ProjectAbout = ({ project }) => {
  return (
    <section className="project-section">
      <h2 className="section-title">About Project</h2>
      <p className="project-description">{project.description}</p>

      <div className="project-details-grid">
        <div className="detail-column">
          <h3 className="detail-subtitle">Members</h3>
          <ul className="detail-list">
            {project.members && project.members.map((member, index) => (
              <li key={index} className="detail-item">{member}</li>
            ))}
          </ul>
        </div>

        <div className="detail-column">
          <h3 className="detail-subtitle">Technologies</h3>
          <div className="tech-tags">
            {project.technologies && project.technologies.map((tech, index) => (
              <span key={index} className="tech-tag">{tech}</span>
            ))}
          </div>
        </div>

        <div className="detail-column">
          <h3 className="detail-subtitle">Project Stats</h3>
          <div className="stats-grid-table">
            <div className="stat-item">
              <span className="stat-value">{project.downloads || 0}</span>
              <span className="stat-label">Downloads</span>
            </div>
            <div className="stat-item">
              <span className="stat-value">{project.stars || 0}</span>
              <span className="stat-label">Stars</span>
            </div>
            <div className="stat-item">
              <span className="stat-value">{project.version || 'v1.0.0'}</span>
              <span className="stat-label">Version</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProjectAbout;