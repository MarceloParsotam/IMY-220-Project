import React from 'react';
import { useEffect } from 'react';

const LocalActivityFeed = ({ messages, onHashtagClick }) => {
  if (!messages || messages.length === 0) {
    return (
      <div className="empty-state">
        <p>No local messages found.</p>
      </div>
    );
  }
   useEffect(() => {
    const handleHashtagClick = (e) => {
      if (e.target.classList.contains('hashtag')) {
        const hashtag = e.target.getAttribute('data-hashtag');
        if (onHashtagClick) {
          onHashtagClick(hashtag);
        }
      }
    };

    document.addEventListener('click', handleHashtagClick);
    return () => document.removeEventListener('click', handleHashtagClick);
  }, [onHashtagClick]);

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
        </div>
      ))}
    </div>
  );
};

export default LocalActivityFeed;