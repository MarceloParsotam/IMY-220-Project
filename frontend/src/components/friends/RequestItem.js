import React from 'react';

const RequestItem = ({ request, onAccept, onDecline }) => {
  return (
    <div className="request-item">
      <img 
        src={request.avatar} 
        alt="User" 
        className="request-avatar"
        onError={(e) => {
          e.target.src = '/default-avatar.png';
        }}
      />
      <div className="request-info">
        <h3 className="request-name">{request.name}</h3>
        <p className="request-meta">{request.meta}</p>
      </div>
      <div className="request-actions">
        <button className="request-btn accept-btn" onClick={onAccept}>
          Accept
        </button>
        <button className="request-btn decline-btn" onClick={onDecline}>
          Decline
        </button>
      </div>
    </div>
  );
};

export default RequestItem;