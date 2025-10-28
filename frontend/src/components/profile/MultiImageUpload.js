import React, { useState, useCallback } from 'react';

const MultiImageUpload = ({ user, onImagesUpdate, isOwnProfile, maxImages = 3 }) => {
  const [uploadingIndex, setUploadingIndex] = useState(null);
  const [uploadErrors, setUploadErrors] = useState({});
  const [isDragOver, setIsDragOver] = useState(false);

  // Initialize with user's existing images or empty slots
  const [images, setImages] = useState(() => {
    const initialImages = Array(maxImages).fill(null);
    if (user.avatars && user.avatars.length > 0) {
      user.avatars.forEach((avatar, index) => {
        if (index < maxImages) {
          initialImages[index] = avatar;
        }
      });
    }
    return initialImages;
  });

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    if (isOwnProfile) {
      setIsDragOver(true);
    }
  }, [isOwnProfile]);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    
    if (!isOwnProfile) return;

    const files = Array.from(e.dataTransfer.files);
    const imageFiles = files.filter(file => file.type.startsWith('image/'));
    
    if (imageFiles.length > 0) {
      // Find first empty slot and upload there
      const emptySlotIndex = images.findIndex(img => !img);
      if (emptySlotIndex !== -1) {
        handleImageUpload(imageFiles[0], emptySlotIndex);
      } else {
        setUploadErrors(prev => ({
          ...prev,
          general: `Maximum ${maxImages} images allowed`
        }));
      }
    }
  }, [isOwnProfile, images, maxImages]);

  const handleFileInput = (index) => (event) => {
    const file = event.target.files[0];
    if (file) {
      handleImageUpload(file, index);
    }
  };

  const handleImageUpload = async (file, index) => {
    // Validate file type
    if (!file.type.startsWith('image/')) {
      setUploadErrors(prev => ({
        ...prev,
        [index]: 'Please select an image file'
      }));
      return;
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      setUploadErrors(prev => ({
        ...prev,
        [index]: 'Image must be smaller than 5MB'
      }));
      return;
    }

    setUploadingIndex(index);
    setUploadErrors(prev => ({ ...prev, [index]: '', general: '' }));

    try {
      const formData = new FormData();
      formData.append('avatar', file);
      formData.append('imageIndex', index); // Tell backend which slot

      const userData = JSON.parse(localStorage.getItem('user'));
      const token = userData?._id || userData?.id;

      const response = await fetch(`http://localhost:3000/api/users/${user.id}/avatars`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData
      });

      if (!response.ok) {
        throw new Error('Failed to upload image');
      }

      const result = await response.json();
      
      // Update local state with new image
      const newImages = [...images];
      newImages[index] = result.avatarUrl || URL.createObjectURL(file); // Fallback to object URL
      setImages(newImages);

      // Notify parent component
      if (onImagesUpdate) {
        onImagesUpdate(newImages.filter(img => img));
      }

    } catch (error) {
      console.error('Error uploading image:', error);
      setUploadErrors(prev => ({
        ...prev,
        [index]: 'Failed to upload image'
      }));
    } finally {
      setUploadingIndex(null);
    }
  };

  const removeImage = (index) => {
    const newImages = [...images];
    newImages[index] = null;
    setImages(newImages);
    
    if (onImagesUpdate) {
      onImagesUpdate(newImages.filter(img => img));
    }
  };

  return (
    <div className="multi-image-upload">
      <h3 className="section-title">Profile Images ({images.filter(img => img).length}/{maxImages})</h3>
      
      <div 
        className={`images-grid ${isDragOver ? 'drag-over' : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {images.map((image, index) => (
          <div key={index} className="image-slot">
            <div className="image-container">
              {image ? (
                <>
                  <img 
                    src={image} 
                    alt={`Profile image ${index + 1}`}
                    className="profile-image"
                    onError={(e) => {
                      e.target.src = '/default-avatar.png';
                    }}
                  />
                  {isOwnProfile && (
                    <button 
                      className="remove-image-btn"
                      onClick={() => removeImage(index)}
                      title="Remove image"
                    >
                      ×
                    </button>
                  )}
                </>
              ) : (
                <div className="empty-slot">
                  {isOwnProfile && (
                    <>
                      <input
                        type="file"
                        onChange={handleFileInput(index)}
                        accept="image/*"
                        style={{ display: 'none' }}
                        id={`image-upload-${index}`}
                      />
                      <label 
                        htmlFor={`image-upload-${index}`}
                        className="upload-placeholder"
                      >
                        {uploadingIndex === index ? (
                          <div className="uploading-text">Uploading...</div>
                        ) : (
                          <>
                            <div className="upload-icon">+</div>
                            <div className="upload-text">Add Image</div>
                          </>
                        )}
                      </label>
                    </>
                  )}
                </div>
              )}
            </div>
            
            {uploadErrors[index] && (
              <div className="image-error">{uploadErrors[index]}</div>
            )}
          </div>
        ))}
      </div>

      {isOwnProfile && (
        <div className="upload-instructions">
          <p>Drag and drop images here or click to upload</p>
          <p>Maximum {maxImages} images allowed</p>
        </div>
      )}

      {uploadErrors.general && (
        <div className="general-error">{uploadErrors.general}</div>
      )}
    </div>
  );
};

export default MultiImageUpload;