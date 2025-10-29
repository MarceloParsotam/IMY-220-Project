import React from 'react';
import { useEffect } from 'react';

const GlobalActivityFeed = ({ messages, onHashtagClick }) => {
  if (!messages || messages.length === 0) {
    return (
      <div className="empty-state">
        <p>No global messages found.</p>
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
    <div className="global-feed">
      {messages.map(message => (
        <div key={message.id} className="message-card global-message">
          <div className="message-header">
            <span className="message-type-badge">Global</span>
            <h4 className="message-title">{message.title}</h4>
            <div className="message-meta">
              <span className="message-author">By {message.author}</span>
              <span className="message-timestamp">{message.timestamp}</span>
            </div>
          </div>
          
          <p className="message-content">{message.content}</p>
        </div>
      ))}
    </div>
  );
};

export default GlobalActivityFeed;