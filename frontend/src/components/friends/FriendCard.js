import React from 'react';
import { Link } from 'react-router-dom';

const FriendCard = ({ friend, isSuggestion = false, onRemove, onConnect }) => {
  return (
    <div className="friend-card">
      <Link to={`/profile/${friend.id}`} className="friend-link">
        <img 
          src={friend.avatar} 
          alt="Friend" 
          className="friend-avatar"
          onError={(e) => {
            e.target.src = '/default-avatar.png';
          }}
        />
        <h3 className="friend-name">{friend.name}</h3>
        <p className="friend-title">{friend.title}</p>
        {friend.wasConnected && (
          <div className="previously-connected-badge">
            Previously Connected
          </div>
        )}
        <div className="friend-stats">
          <div className="friend-stat">
            <span className="stat-number">{friend.projects || 0}</span>
            <span>Projects</span>
          </div>
          <div className="friend-stat">
            <span className="stat-number">{friend.followers || 0}</span>
            <span>Followers</span>
          </div>
        </div>
        {friend.skills && friend.skills.length > 0 && (
          <div className="friend-skills">
            {friend.skills.slice(0, 3).map((skill, index) => (
              <span key={index} className="skill-tag small">{skill}</span>
            ))}
            {friend.skills.length > 3 && (
              <span className="skill-tag small">+{friend.skills.length - 3}</span>
            )}
          </div>
        )}
      </Link>
      <div className="friend-actions">
        <button 
          className={`friend-btn ${friend.wasConnected ? 'reconnect-btn' : 'primary-btn'}`}
          onClick={() => isSuggestion ? onConnect(friend.id) : null}
        >
          {friend.wasConnected ? 'Reconnect' : (isSuggestion ? 'Connect' : 'Message')}
        </button>
        {!isSuggestion && onRemove && (
          <button 
            className="friend-btn secondary-btn"
            onClick={onRemove}
          >
            Remove
          </button>
        )}
        {isSuggestion && (
          <button className="friend-btn secondary-btn">View Profile</button>
        )}
      </div>
    </div>
  );
};

export default FriendCard;