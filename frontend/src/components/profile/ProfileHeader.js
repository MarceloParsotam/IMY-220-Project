import React, { useState, useEffect, useCallback } from 'react';
import AvatarUpload from './AvatarUpload';

const ProfileHeader = ({ user, isOwnProfile, onAvatarUpdate }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [avatarTimestamp, setAvatarTimestamp] = useState(Date.now());

  // Only set up carousel if user has multiple avatars
  useEffect(() => {
    if (user.avatars && user.avatars.length > 1) {
      const interval = setInterval(() => {
        setCurrentImageIndex((prevIndex) => 
          (prevIndex + 1) % user.avatars.length
        );
      }, 3000);

      return () => clearInterval(interval);
    }
  }, [user.avatars]); // Only depend on user.avatars

  const handleAvatarUpdate = useCallback((newAvatarUrl) => {
    setAvatarTimestamp(Date.now()); // Force re-render and cache busting
    if (onAvatarUpdate) {
      onAvatarUpdate(newAvatarUrl);
    }
  }, [onAvatarUpdate]);

  // Add cache busting to avatar URL - only if avatar exists
  const avatarUrl = user.avatar ? `${user.avatar}?t=${avatarTimestamp}` : '/default-avatar.png';

  return (
    <div className="profile-header-strip">
      <div className="profile-header-content">
        <AvatarUpload 
          user={user}
          onAvatarUpdate={handleAvatarUpdate}
          isOwnProfile={isOwnProfile}
        />
        <div className="profile-info">
          <h1 className="profile-name">{user.name}</h1>
          <p className="profile-username">@{user.username}</p>
          <p className="profile-description">{user.description}</p>
        </div>
      </div>
    </div>
  );
};

export default React.memo(ProfileHeader);