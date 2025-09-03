import React from 'react';

const Sidebar = () => {
  const personalProjects = [
    'Project 1',
    'Project 2',
    'Project 3'
  ];

  const friends = [
    'Friend 1',
    'Friend 2',
    'Friend 3'
  ];

  return (
    <div className="sidebar">
      <div className="sidebar-section">
        <h3 className="section-title">Personal Projects</h3>
        <ul className="projects-list">
          {personalProjects.map((project, index) => (
            <li key={index} className="project-item">
              {project}
            </li>
          ))}
        </ul>
      </div>
      
      <div className="sidebar-section">
        <h3 className="section-title">Friends</h3>
        <ul className="projects-list">
          {friends.map((friend, index) => (
            <li key={index} className="project-item">
              {friend}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default Sidebar;