import React from 'react';

const ProfileSkills = ({ skills, languages }) => {
  return (
    <div className="profile-section">
      <h2 className="section-title">Skills</h2>
      <div className="skills-grid">
        {skills.map((skill, index) => (
          <span key={index} className="skill-tag">{skill}</span>
        ))}
      </div>
      
      <h2 className="section-title">Languages</h2>
      <div className="skills-grid">
        {languages.map((language, index) => (
          <span key={index} className="skill-tag">{language}</span>
        ))}
      </div>
    </div>
  );
};

export default ProfileSkills;