// CheckoutMessages.js - UPDATED
import React, { useState } from 'react';

const CheckoutMessages = ({ messages, onAddMessage }) => {
  const [newMessage, setNewMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;
    
    setSubmitting(true);
    try {
      await onAddMessage(newMessage.trim(), 'checkout');
      setNewMessage('');
    } catch (error) {
      console.error('Error submitting message:', error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="checkout-section">
      <h2 className="section-title">Check-out Messages</h2>
      
      {/* Add new message form */}
      <form onSubmit={handleSubmit} className="message-form">
        <div className="form-group">
          <textarea
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Add a check-out message..."
            className="message-input"
            rows="3"
            disabled={submitting}
          />
        </div>
        <button 
          type="submit" 
          className="submit-btn"
          disabled={submitting || !newMessage.trim()}
        >
          {submitting ? 'Adding...' : 'Add Check-out Message'}
        </button>
      </form>

      {/* Messages list */}
      <div className="messages-list">
        {messages.map((msg, index) => (
          <div key={index} className="message-item checkout-message">
            <div className="message-header">
              <span className="message-user">{msg.user}</span>
              <span className="message-time">
                {msg.time ? `checked out ${formatTime(msg.time)}` : 'Recently'}
              </span>
            </div>
            <p className="message-content">{msg.message}</p>
          </div>
        ))}
        
        {messages.length === 0 && (
          <div className="empty-state">
            No check-out messages yet. Be the first to check out and leave a message!
          </div>
        )}
      </div>
    </div>
  );
};

// Helper function to format time
const formatTime = (timeString) => {
  try {
    const time = new Date(timeString);
    const now = new Date();
    const diffMs = now - time;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} minutes ago`;
    if (diffHours < 24) return `${diffHours} hours ago`;
    if (diffDays < 7) return `${diffDays} days ago`;
    return time.toLocaleDateString();
  } catch (error) {
    return 'Recently';
  }
};

export default CheckoutMessages;