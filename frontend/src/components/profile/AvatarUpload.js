// components/profile/AvatarUpload.js
import React, { useState, useRef } from 'react';

const AvatarUpload = ({ user, onAvatarUpdate, isOwnProfile }) => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const fileInputRef = useRef(null);

  const handleAvatarClick = () => {
    if (isOwnProfile) {
      fileInputRef.current?.click();
    }
  };

  const handleFileChange = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setUploadError('Please select an image file');
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

      // Refresh the avatar by using the avatar endpoint with cache busting
      const newAvatarUrl = `http://localhost:3000/api/users/${user.id}/avatar?t=${Date.now()}`;
      
      // Update the parent component with new avatar
      if (onAvatarUpdate) {
        onAvatarUpdate(newAvatarUrl);
      }

      // Clear the file input
      event.target.value = '';

    } catch (error) {
      console.error('Error uploading avatar:', error);
      setUploadError('Failed to upload avatar');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="avatar-upload-container">
      <div 
        className={`avatar-wrapper ${isOwnProfile ? 'editable' : ''}`}
        onClick={handleAvatarClick}
      >
        <img 
          src={user.avatar || '/default-avatar.png'} 
          alt={user.name}
          className="profile-avatar"
          onError={(e) => {
            // If the avatar fails to load, use default
            e.target.src = '/default-avatar.png';
          }}
        />
        {isOwnProfile && (
          <div className="avatar-overlay">
            {isUploading ? (
              <div className="uploading-spinner">Uploading...</div>
            ) : (
              <div className="upload-icon">📷</div>
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
        <div className="upload-error">{uploadError}</div>
      )}

      {isOwnProfile && (
        <div className="upload-hint">
          Click avatar to upload
        </div>
      )}
    </div>
  );
};

export default AvatarUpload;