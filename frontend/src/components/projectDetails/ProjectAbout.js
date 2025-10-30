// ProjectAbout.js - FIXED with stars removed
import React, { useState, useEffect } from 'react';

const ProjectAbout = ({ project }) => {
  const [members, setMembers] = useState([]);
  const [favoritesCount, setFavoritesCount] = useState(0);

  useEffect(() => {
    // Fetch members from the API to ensure consistency
    fetchMembers();
    // Fetch real favorites count from the database
    fetchFavoritesCount();
  }, [project._id]);

  const fetchMembers = async () => {
    try {
      const userData = JSON.parse(localStorage.getItem('user'));
      const token = userData?._id || userData?.id || '';

      const response = await fetch(`http://localhost:3000/api/projects/${project._id}/members`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setMembers(data.members || []);
      } else {
        // Fallback to project.members if API fails
        console.log('Using fallback members from project data');
        setMembers(Array.isArray(project.members) ? project.members : []);
      }
    } catch (error) {
      console.error('Error fetching members for About section:', error);
      // Fallback to project.members if API fails
      console.log('Using fallback members due to error');
      setMembers(Array.isArray(project.members) ? project.members : []);
    }
  };

  const fetchFavoritesCount = async () => {
    try {
      const userData = JSON.parse(localStorage.getItem('user'));
      const token = userData?._id || userData?.id || '';

      // Fetch real favorites count from the API
      const response = await fetch(`http://localhost:3000/api/projects/${project._id}/favorites-count`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setFavoritesCount(data.favoritesCount || 0);
      } else {
        console.log('Using fallback favorites count');
        // If the endpoint doesn't exist yet, use 0 as fallback
        setFavoritesCount(0);
      }
    } catch (error) {
      console.error('Error fetching favorites count:', error);
      setFavoritesCount(0);
    }
  };

  // Helper function to safely get member display name
  const getMemberDisplayName = (member) => {
    if (typeof member === 'string') {
      return member; // Old format - just a string
    } else if (typeof member === 'object' && member !== null) {
      // New format - object with name/username properties
      return member.name || member.username || 'Unknown Member';
    }
    return 'Unknown Member';
  };

  return (
    <section className="project-section">
      <h2 className="section-title">About Project</h2>
      <p className="project-description">{project.description}</p>

      <div className="project-details-grid">
        <div className="detail-column">
          <h3 className="detail-subtitle">Members</h3>
          <ul className="detail-list">
            {/* Project Owner */}
            <li key="owner" className="detail-item owner-item">
              {project.username} (Owner)
            </li>
            {/* Project Members */}
            {members.map((member, index) => (
              <li key={member.id || member._id || index} className="detail-item">
                {getMemberDisplayName(member)}
              </li>
            ))}
            {members.length === 0 && (
              <li className="detail-item no-members">No additional members</li>
            )}
          </ul>
        </div>

        <div className="detail-column">
          <h3 className="detail-subtitle">Technologies</h3>
          <div className="tech-tags">
            {project.technologies && project.technologies.map((tech, index) => (
              <span key={index} className="tech-tag">{tech}</span>
            ))}
          </div>
        </div>

        <div className="detail-column">
          <h3 className="detail-subtitle">Project Stats</h3>
          <div className="stats-grid-table">
            <div className="stat-item">
              <span className="stat-value">{favoritesCount}</span>
              <span className="stat-label">Favorites</span>
            </div>
            <div className="stat-item">
              <span className="stat-value">{project.version || 'v1.0.0'}</span>
              <span className="stat-label">Version</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProjectAbout;