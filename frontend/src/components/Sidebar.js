import React from 'react';

const Sidebar = () => {
  return (
    <div className="sidebar">
      <div className="sidebar-section">
        <h3 className="sidebar-title">Personal Projects</h3>
        <ul className="sidebar-list">
          <li>Project 1</li>
          <li>Project 2</li>
          <li>Project 3</li>
        </ul>
      </div>
      
      <div className="sidebar-section">
        <h3 className="sidebar-title">Friends</h3>
        <ul className="sidebar-list">
          <li>Friend 1</li>
          <li>Friend 2</li>
          <li>Friend 3</li>
        </ul>
      </div>
    </div>
  );
};

export default Sidebar;