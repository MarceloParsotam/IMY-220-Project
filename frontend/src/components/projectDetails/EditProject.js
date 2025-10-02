// EditProject.js - UPDATED
import React, { useState, useEffect } from 'react';

const EditProject = ({ project, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    version: '',
    technologies: '',
    members: '',
    type: '',
    tags: ''
  });

  // Initialize form data when project changes
  useEffect(() => {
    setFormData({
      name: project.name || '',
      description: project.description || '',
      version: project.version || '',
      technologies: project.technologies?.join(', ') || '',
      members: project.members?.join(', ') || '',
      type: project.type || 'Web Application',
      tags: project.tags?.join(', ') || ''
    });
  }, [project]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Prepare the data to send to backend
    const updatedData = {
      name: formData.name,
      description: formData.description,
      version: formData.version,
      type: formData.type,
      technologies: formData.technologies.split(',').map(tech => tech.trim()).filter(tech => tech),
      members: formData.members.split(',').map(member => member.trim()).filter(member => member),
      tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag)
    };
    
    onSave(updatedData);
  };

  // Close modal when clicking outside
  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onCancel();
    }
  };

  const projectTypes = [
    'Web Application',
    'Mobile Application', 
    'Backend Service',
    'Documentation',
    'Library',
    'API',
    'Desktop Application'
  ];

  return (
    <div className="edit-project-modal" onClick={handleOverlayClick}>
      <div className="modal-content">
        <div className="modal-header">
          <h2 className="modal-title">Edit Project</h2>
          <button className="close-btn" onClick={onCancel}>×</button>
        </div>
        
        <form onSubmit={handleSubmit} className="edit-form">
          <div className="form-group">
            <label htmlFor="projectName">Project Name</label>
            <input
              type="text"
              id="projectName"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="form-input"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="projectDescription">Description</label>
            <textarea
              id="projectDescription"
              name="description"
              value={formData.description}
              onChange={handleChange}
              className="form-textarea"
              rows="4"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="projectType">Project Type</label>
            <select
              id="projectType"
              name="type"
              value={formData.type}
              onChange={handleChange}
              className="form-select"
            >
              {projectTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="projectVersion">Version</label>
            <input
              type="text"
              id="projectVersion"
              name="version"
              value={formData.version}
              onChange={handleChange}
              className="form-input"
              placeholder="v1.0.0"
            />
          </div>

          <div className="form-group">
            <label htmlFor="projectTechnologies">Technologies (comma-separated)</label>
            <input
              type="text"
              id="projectTechnologies"
              name="technologies"
              value={formData.technologies}
              onChange={handleChange}
              className="form-input"
              placeholder="React, Node.js, MongoDB"
            />
          </div>

          <div className="form-group">
            <label htmlFor="projectTags">Tags (comma-separated)</label>
            <input
              type="text"
              id="projectTags"
              name="tags"
              value={formData.tags}
              onChange={handleChange}
              className="form-input"
              placeholder="web, mobile, api"
            />
          </div>

          <div className="form-group">
            <label htmlFor="projectMembers">Members (comma-separated)</label>
            <input
              type="text"
              id="projectMembers"
              name="members"
              value={formData.members}
              onChange={handleChange}
              className="form-input"
              placeholder="John Doe, Jane Smith"
            />
          </div>

          <div className="form-actions">
            <button type="button" className="cancel-btn" onClick={onCancel}>
              Cancel
            </button>
            <button type="submit" className="save-btn">
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProject;