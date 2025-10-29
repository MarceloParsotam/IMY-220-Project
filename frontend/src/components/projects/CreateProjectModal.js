// CreateProjectModal.js - UPDATED
import React, { useState, useCallback } from 'react';

const CreateProjectModal = ({ isOpen, onClose, onCreateProject }) => {
  const [tags, setTags] = useState([]);
  const [tagInput, setTagInput] = useState('');
  const [formData, setFormData] = useState({
    projectName: '',
    projectDescription: '',
    projectType: ''
  });
  const [projectImage, setProjectImage] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState([]);

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

  // Handle image file selection
  const handleImageSelect = (file) => {
    if (file && file.type.startsWith('image/')) {
      setProjectImage(file);
      
      // Create preview URL
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Drag and drop handlers
  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = Array.from(e.dataTransfer.files);
    
    // Handle image files
    const imageFile = files.find(file => file.type.startsWith('image/'));
    if (imageFile) {
      handleImageSelect(imageFile);
    }
    
    // Handle other files for tag generation
    const otherFiles = files.filter(file => !file.type.startsWith('image/'));
    if (otherFiles.length > 0) {
      handleFilesForTags(otherFiles);
    }
  }, []);

  // Handle file input change
  const handleFileInputChange = (e) => {
    const files = Array.from(e.target.files);
    
    const imageFile = files.find(file => file.type.startsWith('image/'));
    if (imageFile) {
      handleImageSelect(imageFile);
    }
    
    const otherFiles = files.filter(file => !file.type.startsWith('image/'));
    if (otherFiles.length > 0) {
      handleFilesForTags(otherFiles);
    }
  };

  // Generate tags based on file types
  const handleFilesForTags = (files) => {
    setUploadedFiles(prev => [...prev, ...files]);
    
    const newTags = [];
    
    files.forEach(file => {
      const extension = file.name.split('.').pop()?.toLowerCase();
      const type = file.type;
      
      // Generate tags based on file extensions and types
      if (extension) {
        switch (extension) {
          case 'js':
          case 'jsx':
            if (!tags.includes('javascript') && !newTags.includes('javascript')) {
              newTags.push('javascript');
            }
            break;
          case 'ts':
          case 'tsx':
            if (!tags.includes('typescript') && !newTags.includes('typescript')) {
              newTags.push('typescript');
            }
            break;
          case 'html':
            if (!tags.includes('html') && !newTags.includes('html')) {
              newTags.push('html');
            }
            break;
          case 'css':
            if (!tags.includes('css') && !newTags.includes('css')) {
              newTags.push('css');
            }
            break;
          case 'py':
            if (!tags.includes('python') && !newTags.includes('python')) {
              newTags.push('python');
            }
            break;
          case 'java':
            if (!tags.includes('java') && !newTags.includes('java')) {
              newTags.push('java');
            }
            break;
          case 'cpp':
          case 'c':
            if (!tags.includes('c++') && !newTags.includes('c++')) {
              newTags.push('c++');
            }
            break;
          case 'php':
            if (!tags.includes('php') && !newTags.includes('php')) {
              newTags.push('php');
            }
            break;
          case 'json':
            if (!tags.includes('json') && !newTags.includes('json')) {
              newTags.push('json');
            }
            break;
          case 'md':
            if (!tags.includes('markdown') && !newTags.includes('markdown')) {
              newTags.push('markdown');
            }
            break;
          default:
            if (!tags.includes(extension) && !newTags.includes(extension)) {
              newTags.push(extension);
            }
        }
      }
      
      // Generate tags based on MIME types
      if (type.includes('javascript')) {
        if (!tags.includes('javascript') && !newTags.includes('javascript')) {
          newTags.push('javascript');
        }
      }
    });
    
    if (newTags.length > 0) {
      setTags(prev => [...prev, ...newTags]);
    }
  };

  // In CreateProjectModal.js - ensure consistent field names
const handleSubmit = async (e) => {
  e.preventDefault();
  
  // Create FormData with consistent field names
  const submitData = new FormData();
  
  // Use these exact field names that the backend expects
  submitData.append('name', formData.projectName);
  submitData.append('description', formData.projectDescription);
  submitData.append('type', formData.projectType);
  submitData.append('tags', JSON.stringify(tags));
  submitData.append('isPublic', 'true');
  
  // Append project image with consistent field name
  if (projectImage) {
    submitData.append('projectImage', projectImage); // This field name must match
  }
  
  // Append other files for tag generation
  uploadedFiles.forEach((file, index) => {
    submitData.append('files', file); // Use 'files' as field name
  });

  console.log('FormData contents before submit:');
  for (let [key, value] of submitData.entries()) {
    console.log(key, value instanceof File ? `File: ${value.name}` : value);
  }

  onCreateProject(submitData);
  
  // Reset form
  setFormData({
    projectName: '',
    projectDescription: '',
    projectType: ''
  });
  setTags([]);
  setProjectImage(null);
  setImagePreview('');
  setUploadedFiles([]);
};

  const removeImage = () => {
    setProjectImage(null);
    setImagePreview('');
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
            {/* Project Image Upload Section */}
            <div className="form-group">
              <label className="form-label">Project Image</label>
              <div 
                className={`image-upload-area ${isDragging ? 'dragging' : ''} ${imagePreview ? 'has-image' : ''}`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                {imagePreview ? (
                  <div className="image-preview">
                    <img src={imagePreview} alt="Project preview" />
                    <button type="button" className="remove-image-btn" onClick={removeImage}>
                      &times;
                    </button>
                  </div>
                ) : (
                  <div className="upload-placeholder">
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h7"></path>
                      <line x1="16" y1="5" x2="22" y2="5"></line>
                      <line x1="19" y1="2" x2="19" y2="8"></line>
                      <circle cx="9" cy="9" r="2"></circle>
                      <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"></path>
                    </svg>
                    <p>Drag & drop a project image here, or click to browse</p>
                    <input 
                      type="file" 
                      accept="image/*"
                      onChange={handleFileInputChange}
                      className="file-input"
                    />
                  </div>
                )}
              </div>
            </div>

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
            
            {/* File Upload for Tag Generation */}
            <div className="form-group">
              <label className="form-label">Upload Files (for automatic tag generation)</label>
              <div className="file-upload-area">
                <input 
                  type="file" 
                  multiple
                  onChange={(e) => handleFilesForTags(Array.from(e.target.files))}
                  className="file-input"
                />
                <p className="file-upload-hint">Upload project files to automatically generate relevant tags</p>
              </div>
              {uploadedFiles.length > 0 && (
                <div className="uploaded-files">
                  <p>Uploaded files: {uploadedFiles.length}</p>
                  <ul>
                    {uploadedFiles.map((file, index) => (
                      <li key={index}>{file.name}</li>
                    ))}
                  </ul>
                </div>
              )}
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
              <p className="tag-hint">Tags are automatically generated from uploaded files</p>
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