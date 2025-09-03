import React, { useState } from 'react';

const MessagesSection = ({ messages, checkoutMessages, onAddCheckinMessage, onAddCheckoutMessage }) => {
  const [activeMessageTab, setActiveMessageTab] = useState('checkin');

  return (
    <section className="project-section">
      <div className="messages-header">
        <h2 className="section-title">Messages</h2>
        <div className="message-tabs">
          <button 
            className={`message-tab ${activeMessageTab === 'checkin' ? 'active' : ''}`}
            onClick={() => setActiveMessageTab('checkin')}
          >
            Check-in Messages
          </button>
          <button 
            className={`message-tab ${activeMessageTab === 'checkout' ? 'active' : ''}`}
            onClick={() => setActiveMessageTab('checkout')}
          >
            Check-out Messages
          </button>
        </div>
      </div>

      {activeMessageTab === 'checkin' ? (
        <CheckinMessages 
          messages={messages} 
          onAddMessage={onAddCheckinMessage}
        />
      ) : (
        <CheckoutMessages 
          messages={checkoutMessages} 
          onAddMessage={onAddCheckoutMessage}
        />
      )}
    </section>
  );
};

// Checkin Messages Component
const CheckinMessages = ({ messages, onAddMessage }) => {
  const [newMessage, setNewMessage] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (newMessage.trim()) {
      onAddMessage(newMessage, 'checkin');
      setNewMessage('');
    }
  };

  return (
    <div className="messages-content">
      <form onSubmit={handleSubmit} className="message-form">
        <div className="form-group">
          <textarea
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Add a check-in message..."
            className="message-input"
            rows="3"
          />
        </div>
        <button type="submit" className="submit-btn">
          Add Check-in Message
        </button>
      </form>

      <div className="messages-list">
        {messages.map((msg, index) => (
          <div key={index} className="message-item checkin-message">
            <div className="message-header">
              <span className="message-user">{msg.user}</span>
              <span className="message-time">checked in {msg.time}</span>
            </div>
            <p className="message-content">{msg.message}</p>
          </div>
        ))}
        
        {messages.length === 0 && (
          <div className="empty-state">
            No check-in messages yet. Be the first to check in and leave a message!
          </div>
        )}
      </div>
    </div>
  );
};

// Checkout Messages Component
const CheckoutMessages = ({ messages, onAddMessage }) => {
  const [newMessage, setNewMessage] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (newMessage.trim()) {
      onAddMessage(newMessage, 'checkout');
      setNewMessage('');
    }
  };

  return (
    <div className="messages-content">
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

export default MessagesSection;