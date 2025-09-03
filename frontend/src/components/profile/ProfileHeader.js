import React, { useState, useEffect } from 'react';

const ProfileHeader = ({ user }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    if (user.avatars && user.avatars.length > 1) {
      const interval = setInterval(() => {
        setCurrentImageIndex((prevIndex) => 
          (prevIndex + 1) % user.avatars.length
        );
      }, 3000); // Change image every 3 seconds

      return () => clearInterval(interval);
    }
  }, [user.avatars]);

  return (
    <div className="profile-header-strip">
      <div className="profile-header-content">
        <div className="profile-avatar">
          <img 
            src={user.avatars ? user.avatars[currentImageIndex] : user.avatar} 
            alt={user.name} 
          />
        </div>
        <div className="profile-info">
          <h1 className="profile-name">{user.name}</h1>
          <p className="profile-description">{user.description}</p>
          <div className="profile-location">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
              <circle cx="12" cy="10" r="3"></circle>
            </svg>
            <span>{user.location}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileHeader;