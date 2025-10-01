import React from 'react';

const ProfileProjects = ({ projects }) => {
  return (
    <div className="profile-section">
      <h2 className="section-title">Projects</h2>
      <div className="projects-list">
        {projects.map((project, index) => (
          <div key={index} className="project-item">
            <div className="project-header">
              <span className="project-initials">{project.initials}</span>
              <h3 className="project-title">{project.title}</h3>
            </div>
            <p className="project-description">{project.description}</p>
          </div>
        ))}
        {projects.length === 0 && (
          <p className="no-projects">No projects yet</p>
        )}
      </div>
    </div>
  );
};

export default ProfileProjects;