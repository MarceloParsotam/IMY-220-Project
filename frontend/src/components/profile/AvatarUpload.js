import React, { useState, useRef, useCallback } from 'react';

const AvatarUpload = ({ user, onAvatarUpdate, isOwnProfile, maxImages = 3 }) => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [avatarLoadError, setAvatarLoadError] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const [currentImages, setCurrentImages] = useState([]);
  const fileInputRef = useRef(null);

  // Initialize with user's existing images
  React.useEffect(() => {
    if (user.avatars && user.avatars.length > 0) {
      setCurrentImages(user.avatars.slice(0, maxImages));
    } else if (user.avatar) {
      setCurrentImages([user.avatar]);
    } else {
      setCurrentImages([]);
    }
  }, [user.avatars, user.avatar, maxImages]);

  const handleAvatarClick = () => {
    if (isOwnProfile) {
      fileInputRef.current?.click();
    }
  };

  // Drag and drop handlers
  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    if (isOwnProfile && !isUploading) {
      setIsDragOver(true);
    }
  }, [isOwnProfile, isUploading]);

  const handleDragEnter = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    if (isOwnProfile && !isUploading) {
      setIsDragOver(true);
    }
  }, [isOwnProfile, isUploading]);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.currentTarget.contains(e.relatedTarget)) return;
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    
    if (!isOwnProfile || isUploading) return;

    const files = Array.from(e.dataTransfer.files);
    const imageFiles = files.filter(file => file.type.startsWith('image/'));
    
    if (imageFiles.length > 0) {
      handleFileUpload(imageFiles[0]);
    } else {
      setUploadError('Please drop an image file');
    }
  }, [isOwnProfile, isUploading]);

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  const handleFileUpload = async (file) => {
    // Validate file type
    if (!file.type.startsWith('image/')) {
      setUploadError('Please select an image file (JPEG, PNG, etc.)');
      return;
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      setUploadError('Image must be smaller than 5MB');
      return;
    }

    setIsUploading(true);
    setUploadError('');

    try {
      const formData = new FormData();
      formData.append('avatar', file);

      const userData = JSON.parse(localStorage.getItem('user'));
      const token = userData?._id || userData?.id;

      const response = await fetch(`http://localhost:3000/api/users/${user.id}/avatar`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData
      });

      if (!response.ok) {
        throw new Error('Failed to upload avatar');
      }

      // Refresh the avatar with cache busting
      const newAvatarUrl = `http://localhost:3000/api/users/${user.id}/avatar?t=${Date.now()}`;
      
      // Update current images - add new image or replace if at max
      const updatedImages = [...currentImages];
      if (updatedImages.length < maxImages) {
        updatedImages.push(newAvatarUrl);
      } else {
        updatedImages[0] = newAvatarUrl; // Replace first image if at max
      }
      setCurrentImages(updatedImages);
      
      // Update parent component
      if (onAvatarUpdate) {
        onAvatarUpdate(newAvatarUrl);
      }

      // Reset error state
      setAvatarLoadError(false);

      // Clear file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }

    } catch (error) {
      console.error('Error uploading avatar:', error);
      setUploadError('Failed to upload avatar. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleImageError = useCallback(() => {
    console.log('Avatar image failed to load, using default');
    setAvatarLoadError(true);
  }, []);

  // Determine avatar URL for main display
  const getMainAvatarUrl = () => {
    if (avatarLoadError || currentImages.length === 0) {
      return '/default-avatar.png';
    }
    return `${currentImages[0]}?t=${Date.now()}`;
  };

  const removeImage = (index) => {
    const updatedImages = currentImages.filter((_, i) => i !== index);
    setCurrentImages(updatedImages);
    
    // If we removed the main avatar, update parent
    if (index === 0 && updatedImages.length > 0 && onAvatarUpdate) {
      onAvatarUpdate(updatedImages[0]);
    }
  };

  return (
    <div className="avatar-upload-container">
      <div className="avatar-display-section">
        {/* Main Avatar Display */}
        <div 
          className={`main-avatar-wrapper ${isOwnProfile ? 'editable' : ''} ${isDragOver ? 'drag-over' : ''} ${isUploading ? 'uploading' : ''}`}
          onClick={handleAvatarClick}
          onDragOver={handleDragOver}
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <img 
            src={getMainAvatarUrl()}
            alt={user.name || 'User avatar'}
            className="main-profile-avatar"
            onError={handleImageError}
            loading="lazy"
          />
          
          {isOwnProfile && (
            <div className="avatar-overlay">
              {isUploading ? (
                <div className="uploading-spinner">
                  <div className="spinner"></div>
                  <span>Uploading...</span>
                </div>
              ) : isDragOver ? (
                <div className="drag-drop-indicator">
                  <div className="drop-icon"></div>
                  <span>Drop to upload</span>
                </div>
              ) : (
                <div className="upload-indicator">
                  <div className="upload-icon"></div>
                  <span>Change Photo</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Additional Images Grid */}
        {currentImages.length > 1 && (
          <div className="additional-images-grid">
            {currentImages.slice(1).map((image, index) => (
              <div key={index + 1} className="additional-avatar-wrapper">
                <img 
                  src={`${image}?t=${Date.now()}`}
                  alt={`Profile image ${index + 2}`}
                  className="additional-profile-avatar"
                  onError={(e) => {
                    e.target.src = '/default-avatar.png';
                  }}
                />
                {isOwnProfile && (
                  <button 
                    className="remove-image-btn"
                    onClick={() => removeImage(index + 1)}
                    title="Remove image"
                  >
                    ×
                  </button>
                )}
              </div>
            ))}
            
            {/* Empty slots for additional uploads */}
            {isOwnProfile && currentImages.length < maxImages && (
              <div 
                className="empty-avatar-slot"
                onClick={handleAvatarClick}
              >
                <div className="add-more-icon">+</div>
                <span>Add More</span>
              </div>
            )}
          </div>
        )}
      </div>

      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        style={{ display: 'none' }}
      />

      {uploadError && (
        <div className="upload-error">
          {uploadError}
        </div>
      )}

      {isOwnProfile && !isUploading && (
        <div className="upload-hint">
          {currentImages.length}/{maxImages} images • JPEG, PNG, GIF • Max 5MB each
        </div>
      )}
    </div>
  );
};

export default AvatarUpload;