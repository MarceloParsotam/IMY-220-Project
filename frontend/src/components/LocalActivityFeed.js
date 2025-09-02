import React from 'react';

const LocalActivityFeed = ({ messages }) => {
  if (!messages || messages.length === 0) {
    return (
      <div className="empty-state">
        <p>No local messages found.</p>
      </div>
    );
  }

  return (
    <div className="local-feed">
      {messages.map(message => (
        <div key={message.id} className="message-card local-message">
          <div className="message-header">
            <span className="message-type-badge">Local</span>
            <h4 className="message-title">{message.title}</h4>
            <div className="message-meta">
              <span className="message-author">By {message.author}</span>
              <span className="message-timestamp">{message.timestamp}</span>
            </div>
          </div>
          
          <p className="message-content">{message.content}</p>
          
          {message.project && (
            <div className="message-project">
              <strong>Project:</strong> {message.project}
            </div>
          )}
          
          <div className="message-actions">
            <button className="message-action-btn">
              <span className="action-icon">👍</span> {message.likes}
            </button>
            <button className="message-action-btn">
              <span className="action-icon">💬</span> {message.comments}
            </button>
            <button className="message-action-btn">
              <span className="action-icon">🔗</span> Share
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default LocalActivityFeed;