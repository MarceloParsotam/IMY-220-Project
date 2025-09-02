import React from 'react';

const TrendingProjects = () => {
  const projects = [
    'Fun Project 1',
    'Fun Project 2',
    'Fun Project 3',
    'Fun Project 4',
    'Fun Project 5'
  ];

  return (
    <div className="trending-projects">
      <h3 className="section-title">Trending Projects</h3>
      <ul className="projects-list">
        {projects.map((project, index) => (
          <li key={index} className="project-item">
            {project}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default TrendingProjects;