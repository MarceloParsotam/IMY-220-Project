import React, { useState } from 'react';

const EditProjectModal = ({ project, onSave, onClose }) => {
  const [formData, setFormData] = useState({
    name: project.name || '',
    description: project.description || '',
    type: project.type || 'Web Application',
    tags: project.tags || []
  });
  const [tagInput, setTagInput] = useState('');

  const addTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()]
      }));
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTag();
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">Edit Project</h2>
          <button className="modal-close" onClick={onClose}>&times;</button>
        </div>
        <div className="modal-body">
          <form id="editProjectForm" onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="projectName" className="form-label">Project Name</label>
              <input 
                type="text" 
                id="projectName" 
                className="form-control" 
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                required 
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="projectDescription" className="form-label">Description</label>
              <textarea 
                id="projectDescription" 
                className="form-control form-textarea" 
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                required
              ></textarea>
            </div>
            
            <div className="form-group">
              <label htmlFor="projectType" className="form-label">Project Type</label>
              <select 
                id="projectType" 
                className="form-control" 
                value={formData.type}
                onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value }))}
                required
              >
                <option value="Web Application">Web Application</option>
                <option value="Mobile Application">Mobile Application</option>
                <option value="Backend Service">Backend Service</option>
                <option value="Documentation">Documentation</option>
                <option value="Library">Library</option>
              </select>
            </div>
            
            <div className="form-group">
              <label className="form-label">Tags</label>
              <div className="tag-input">
                <input 
                  type="text" 
                  className="tag-input-field" 
                  placeholder="Add a tag (e.g. JavaScript)"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                />
                <button type="button" className="tag-input-btn" onClick={addTag}>Add</button>
              </div>
              <div className="tags-container">
                {formData.tags.map(tag => (
                  <div key={tag} className="tag">
                    #{tag}
                    <button type="button" onClick={() => removeTag(tag)}>&times;</button>
                  </div>
                ))}
              </div>
            </div>
          </form>
        </div>
        <div className="modal-footer">
          <button type="button" className="project-btn secondary-btn" onClick={onClose}>Cancel</button>
          <button type="submit" form="editProjectForm" className="project-btn primary-btn">Save Changes</button>
        </div>
      </div>
    </div>
  );
};

export default EditProjectModal;