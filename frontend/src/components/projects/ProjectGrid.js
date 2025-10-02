import React from 'react';
import ProjectCard from './ProjectCard';

const ProjectGrid = ({ 
  projects, 
  activeTab, 
  searchQuery, 
  filterType, 
  onCheckoutUpdate, 
  onDeleteProject, 
  onEditProject,
  onFavoriteUpdate 
}) => {
  const filteredProjects = projects.filter(project => {
    // Filter by search query
    const matchesSearch = project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         project.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (project.tags && project.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase())));
    
    // Filter by type
    let matchesType = true;
    if (filterType !== 'All Types') {
      matchesType = project.type === filterType;
    }
    
    return matchesSearch && matchesType;
  });

  if (filteredProjects.length === 0) {
    return (
      <div className="empty-state">
        <p>No projects found matching your criteria.</p>
      </div>
    );
  }

  return (
    <div className="projects-grid">
      {filteredProjects.map(project => (
        <ProjectCard 
          key={project.id} 
          project={project} 
          onCheckoutUpdate={onCheckoutUpdate}
          onDeleteProject={onDeleteProject}
          onEditProject={onEditProject}
          onFavoriteUpdate={onFavoriteUpdate}
        />
      ))}
    </div>
  );
};

export default ProjectGrid;