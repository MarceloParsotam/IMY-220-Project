import React from 'react';

const ProfileFriends = ({ friends }) => {
  return (
    <div className="profile-section">
      <div className="section-header">
        <h2 className="section-title">Friends</h2>
        <span className="friends-count">{friends.length} friends</span>
      </div>
      
      <div className="friends-grid">
        {friends.map((friend, index) => (
          <div key={index} className="friend-card">
            <img src={friend.avatar} alt={friend.name} className="friend-avatar" />
            <h3 className="friend-name">{friend.name}</h3>
            <p className="friend-title">{friend.title}</p>
            <div className="friend-actions">
              <button className="friend-btn primary-btn">Message</button>
              <button className="friend-btn secondary-btn">Profile</button>
            </div>
          </div>
        ))}
        {friends.length === 0 && (
          <p className="no-friends">No friends yet</p>
        )}
      </div>
    </div>
  );
};

export default ProfileFriends;