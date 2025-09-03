import React from 'react';

const DiscussionTab = ({ discussions }) => {
  return (
    <section className="project-section">
      <h2 className="section-title">Discussion</h2>
      <div className="discussions-list">
        {discussions.map((discussion, index) => (
          <div key={index} className="discussion-item">
            <div className="discussion-header">
              <strong>{discussion.user}</strong>
              <span className="discussion-time">{discussion.time}</span>
            </div>
            <p className="discussion-content">{discussion.content}</p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default DiscussionTab;