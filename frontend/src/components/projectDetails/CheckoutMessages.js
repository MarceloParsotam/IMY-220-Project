import React, { useState } from 'react';

const CheckoutMessages = ({ messages, onAddMessage }) => {
  const [newMessage, setNewMessage] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (newMessage.trim()) {
      onAddMessage(newMessage);
      setNewMessage('');
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
          />
        </div>
        <button type="submit" className="submit-btn">
          Add Check-out Message
        </button>
      </form>

      {/* Messages list */}
      <div className="messages-list">
        {messages.map((msg, index) => (
          <div key={index} className="message-item checkout-message">
            <div className="message-header">
              <span className="message-user">{msg.user}</span>
              <span className="message-time">checked out {msg.time}</span>
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

export default CheckoutMessages;