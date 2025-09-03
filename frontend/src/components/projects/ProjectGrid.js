import React from 'react';
import ProjectCard from './ProjectCard';

const ProjectGrid = ({ projects, activeTab, searchQuery, filterType }) => {
  const filteredProjects = projects.filter(project => {
    // Filter by search query
    const matchesSearch = project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         project.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         project.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    
    // Filter by active tab
    let matchesTab = true;
    if (activeTab === 'Checked Out') {
      matchesTab = project.isCheckedOut;
    } else if (activeTab === 'Favorites') {
      matchesTab = project.isFavorite;
    } else if (activeTab === 'Checked In') {
      matchesTab = !project.isCheckedOut;
    }
    
    // Filter by type
    let matchesType = true;
    if (filterType !== 'All Types') {
      matchesType = project.type === filterType;
    }
    
    return matchesSearch && matchesTab && matchesType;
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
        <ProjectCard key={project.id} project={project} />
      ))}
    </div>
  );
};

export default ProjectGrid;