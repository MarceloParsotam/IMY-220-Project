import React from 'react';
import { Link } from 'react-router-dom';

const FriendCard = ({ friend, isSuggestion = false }) => {
  return (
    <div className="friend-card">
      <Link to={`/profile/${friend.id || friend.name.replace(' ', '-').toLowerCase()}`} className="friend-link">
        <img src={friend.avatar} alt="Friend" className="friend-avatar" />
        <h3 className="friend-name">{friend.name}</h3>
        <p className="friend-title">{friend.title}</p>
        <div className="friend-stats">
          <div className="friend-stat">
            <span className="stat-number">{friend.projects}</span>
            <span>Projects</span>
          </div>
          <div className="friend-stat">
            <span className="stat-number">{friend.followers}</span>
            <span>Followers</span>
          </div>
        </div>
      </Link>
      <div className="friend-actions">
        <button className="friend-btn primary-btn">
          {isSuggestion ? 'Connect' : 'Message'}
        </button>
        <button className="friend-btn secondary-btn">Profile</button>
      </div>
    </div>
  );
};

export default FriendCard;