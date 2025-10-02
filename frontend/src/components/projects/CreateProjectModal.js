import React, { useState } from 'react';

const CreateProjectModal = ({ isOpen, onClose, onCreateProject }) => {
  const [tags, setTags] = useState([]);
  const [tagInput, setTagInput] = useState('');
  const [formData, setFormData] = useState({
    projectName: '',
    projectDescription: '',
    projectType: ''
  });

  const addTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTag();
    }
  };

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [id]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const projectData = {
      ...formData,
      tags: tags
    };

    onCreateProject(projectData);
    
    // Reset form
    setFormData({
      projectName: '',
      projectDescription: '',
      projectType: ''
    });
    setTags([]);
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">Create New Project</h2>
          <button className="modal-close" onClick={onClose}>&times;</button>
        </div>
        <div className="modal-body">
          <form id="projectForm" onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="projectName" className="form-label">Project Name</label>
              <input 
                type="text" 
                id="projectName" 
                className="form-control" 
                value={formData.projectName}
                onChange={handleInputChange}
                required 
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="projectDescription" className="form-label">Description</label>
              <textarea 
                id="projectDescription" 
                className="form-control form-textarea" 
                value={formData.projectDescription}
                onChange={handleInputChange}
                required
              ></textarea>
            </div>
            
            <div className="form-group">
              <label htmlFor="projectType" className="form-label">Project Type</label>
              <select 
                id="projectType" 
                className="form-control" 
                value={formData.projectType}
                onChange={handleInputChange}
                required
              >
                <option value="">Select a type</option>
                <option value="Web Application">Web Application</option>
                <option value="Mobile Application">Mobile Application</option>
                <option value="Backend Service">Backend Service</option>
                <option value="Documentation">Documentation</option>
                <option value="Library">Library</option>
              </select>
            </div>
            
            <div className="form-group">
              <label className="form-label">Programming Languages (Hashtags)</label>
              <div className="tag-input">
                <input 
                  type="text" 
                  className="tag-input-field" 
                  placeholder="Add a programming language (e.g. JavaScript)"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                />
                <button type="button" className="tag-input-btn" onClick={addTag}>Add</button>
              </div>
              <div className="tags-container">
                {tags.map(tag => (
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
          <button type="submit" form="projectForm" className="project-btn primary-btn">Create Project</button>
        </div>
      </div>
    </div>
  );
};

export default CreateProjectModal;