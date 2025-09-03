import React from 'react';

const MessagesSection = ({ messages }) => {
  return (
    <section className="project-section">
      <h2 className="section-title">Checked in Messages</h2>
      <div className="messages-list">
        {messages.map((msg, index) => (
          <div key={index} className="message-item">
            <div className="message-header">
              <span className="message-user">{msg.user}</span>
              <span className="message-time">checked in {msg.time}</span>
            </div>
            <p className="message-content">{msg.message}</p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default MessagesSection;