// If you have RequestItem.js, update it similarly
import React from 'react';
import { Link } from 'react-router-dom';

const RequestItem = ({ request, onAccept, onDecline }) => {
  const requestUserId = request.id || request._id;
  
  return (
    <div className="request-item">
      <Link to={`/profile/${requestUserId}`} className="request-user-info">
        <img 
          src={request.avatar} 
          alt={request.name}
          className="request-avatar"
          onError={(e) => {
            e.target.src = '/default-avatar.png';
          }}
        />
        <div className="request-details">
          <h4 className="request-name">{request.name}</h4>
          <p className="request-title">{request.title}</p>
          <span className="request-mutual">5 mutual connections</span>
        </div>
      </Link>
      
      <div className="request-actions">
        <button className="accept-btn" onClick={onAccept}>
          Accept
        </button>
        <button className="decline-btn" onClick={onDecline}>
          Decline
        </button>
      </div>
    </div>
  );
};

export default RequestItem;