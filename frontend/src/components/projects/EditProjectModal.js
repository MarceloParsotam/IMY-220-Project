import React, { useState, useCallback } from 'react';

const EditProjectModal = ({ project, onSave, onClose }) => {
  const [formData, setFormData] = useState({
    name: project.name || '',
    description: project.description || '',
    type: project.type || 'Web Application',
    tags: project.tags || []
  });
  const [tagInput, setTagInput] = useState('');
  const [projectImage, setProjectImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(
    project.image ? `data:${project.image.contentType};base64,${project.image.data}` : ''
  );
  const [isDragging, setIsDragging] = useState(false);
  const [loading, setLoading] = useState(false);

  // Compress image function
  const compressImage = (file, maxWidth = 800, quality = 0.7) => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let { width, height } = img;

          // Calculate new dimensions while maintaining aspect ratio
          if (width > maxWidth) {
            height = (height * maxWidth) / width;
            width = maxWidth;
          }

          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);

          canvas.toBlob(
            (blob) => {
              resolve(blob);
            },
            'image/jpeg',
            quality
          );
        };
        img.src = e.target.result;
      };
      reader.readAsDataURL(file);
    });
  };

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

  // Handle image file selection with compression
  const handleImageSelect = async (file) => {
    if (file && file.type.startsWith('image/')) {
      try {
        // Check file size first (5MB limit)
        if (file.size > 5 * 1024 * 1024) {
          alert('Image file is too large. Please choose an image smaller than 5MB.');
          return;
        }

        // Compress image if it's larger than 1MB
        let processedFile = file;
        if (file.size > 1024 * 1024) { // 1MB
          processedFile = await compressImage(file);
          console.log('Image compressed from', file.size, 'to', processedFile.size);
        }

        setProjectImage(processedFile);
        
        // Create preview URL
        const reader = new FileReader();
        reader.onload = (e) => {
          setImagePreview(e.target.result);
        };
        reader.readAsDataURL(processedFile);
      } catch (error) {
        console.error('Error processing image:', error);
        // Fallback to original file if compression fails
        setProjectImage(file);
        const reader = new FileReader();
        reader.onload = (e) => {
          setImagePreview(e.target.result);
        };
        reader.readAsDataURL(file);
      }
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
  }, []);

  // Handle file input change
  const handleFileInputChange = (e) => {
    const files = Array.from(e.target.files);
    
    const imageFile = files.find(file => file.type.startsWith('image/'));
    if (imageFile) {
      handleImageSelect(imageFile);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // Create FormData for the update
      const submitData = new FormData();
      
      // Add all form fields
      submitData.append('name', formData.name);
      submitData.append('description', formData.description);
      submitData.append('type', formData.type);
      submitData.append('tags', JSON.stringify(formData.tags));
      submitData.append('version', project.version || 'v1.0.0');
      
      // Add image if a new one was selected
      if (projectImage) {
        submitData.append('projectImage', projectImage);
        console.log('Image size:', projectImage.size, 'bytes');
      }
      
      // Get authentication token
      const userData = JSON.parse(localStorage.getItem('user'));
      const token = userData?._id || userData?.id || '';

      console.log('Making PUT request for project:', project._id || project.id);

      // Make the API call
      const response = await fetch(`http://localhost:3000/api/projects/${project._id || project.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          // Don't set Content-Type - let the browser set it with boundary for FormData
        },
        body: submitData
      });

      console.log('Response status:', response.status);

      if (!response.ok) {
        if (response.status === 413) {
          throw new Error('Image file is too large. Please choose a smaller image (under 5MB).');
        }
        const errorText = await response.text();
        console.error('Error response:', errorText);
        throw new Error(`Failed to update project: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();
      console.log('Update successful:', result);
      
      // Call the onSave callback with the updated project
      if (onSave) {
        onSave(result.project);
      }
      
      onClose();
      
    } catch (error) {
      console.error('Error updating project:', error);
      alert(error.message || 'Failed to update project. The image might be too large.');
    } finally {
      setLoading(false);
    }
  };

  const removeImage = () => {
    setProjectImage(null);
    setImagePreview('');
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
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
                    <div className="image-overlay">
                      <p>Click to change image</p>
                      <button type="button" className="remove-image-btn" onClick={removeImage}>
                        Remove Image
                      </button>
                    </div>
                    <input 
                      type="file" 
                      accept="image/*"
                      onChange={handleFileInputChange}
                      className="file-input-overlay"
                    />
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
                    <p>Drag & drop a new project image here, or click to browse</p>
                    <p className="file-size-hint">Maximum file size: 5MB</p>
                    <input 
                      type="file" 
                      accept="image/*"
                      onChange={handleFileInputChange}
                      className="file-input"
                    />
                  </div>
                )}
              </div>
              <p className="image-hint">
                {project.image ? 'Upload a new image to replace the current one' : 'Add a project image'}
                <br />
                <small>Images will be automatically compressed if larger than 1MB</small>
              </p>
            </div>

            <div className="form-group">
              <label htmlFor="projectName" className="form-label">Project Name</label>
              <input 
                type="text" 
                id="projectName" 
                name="name"
                className="form-control" 
                value={formData.name}
                onChange={handleInputChange}
                required 
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="projectDescription" className="form-label">Description</label>
              <textarea 
                id="projectDescription" 
                name="description"
                className="form-control form-textarea" 
                value={formData.description}
                onChange={handleInputChange}
                required
                rows="4"
              ></textarea>
            </div>
            
            <div className="form-group">
              <label htmlFor="projectType" className="form-label">Project Type</label>
              <select 
                id="projectType" 
                name="type"
                className="form-control" 
                value={formData.type}
                onChange={handleInputChange}
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
          <button type="button" className="project-btn secondary-btn" onClick={onClose} disabled={loading}>
            Cancel
          </button>
          <button type="submit" form="editProjectForm" className="project-btn primary-btn" disabled={loading}>
            {loading ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditProjectModal;