import React from 'react';

const ProfileAbout = ({ about }) => {
  return (
    <div className="profile-section">
      <h2 className="section-title">About</h2>
      <p className="profile-about">{about}</p>
    </div>
  );
};

export default ProfileAbout;