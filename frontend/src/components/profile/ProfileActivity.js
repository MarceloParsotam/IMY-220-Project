import React from 'react';

const ProfileActivity = ({ activities }) => {
  return (
    <div className="profile-section">
      <h2 className="section-title">Activity</h2>
      <div className="activity-list">
        {activities.map((activity, index) => (
          <div key={index} className="activity-item">
            <h3 className="activity-title">{activity.title}</h3>
            <p className="activity-description">{activity.description}</p>
          </div>
        ))}
        {activities.length === 0 && (
          <p className="no-activity">No recent activity</p>
        )}
      </div>
    </div>
  );
};

export default ProfileActivity;