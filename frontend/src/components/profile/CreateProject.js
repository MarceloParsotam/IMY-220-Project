import React, { useState } from 'react';

const CreateProject = ({ onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    type: 'Web Application',
    tags: '',
    isPublic: true
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({
      ...formData,
      tags: formData.tags.split(',').map(tag => tag.trim())
    });
  };

  return (
    <div className="create-project-modal">
      <div className="modal-content">
        <div className="modal-header">
          <h2 className="modal-title">Create New Project</h2>
          <button className="close-btn" onClick={onCancel}>×</button>
        </div>
        
        <form onSubmit={handleSubmit} className="create-form">
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
              <option value="Web Application">Web Application</option>
              <option value="Mobile Application">Mobile Application</option>
              <option value="Backend Service">Backend Service</option>
              <option value="Documentation">Documentation</option>
              <option value="Other">Other</option>
            </select>
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
              placeholder="React, Node.js, MongoDB"
            />
          </div>

          <div className="form-group checkbox-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                name="isPublic"
                checked={formData.isPublic}
                onChange={handleChange}
                className="form-checkbox"
              />
              <span className="checkmark"></span>
              Public Project
            </label>
            <span className="checkbox-help">Anyone can view this project</span>
          </div>

          <div className="form-actions">
            <button type="button" className="cancel-btn" onClick={onCancel}>
              Cancel
            </button>
            <button type="submit" className="create-btn">
              Create Project
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateProject;