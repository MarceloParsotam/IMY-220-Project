import React from 'react';

const ProfileSkills = ({ skills }) => {
  return (
    <div className="profile-section">
      <h2 className="section-title">Skills</h2>
      <div className="skills-grid">
        {skills.map((skill, index) => (
          <span key={index} className="skill-tag">{skill}</span>
        ))}
        {skills.length === 0 && (
          <p className="no-skills">No skills added yet</p>
        )}
      </div>
    </div>
  );
};

export default ProfileSkills;