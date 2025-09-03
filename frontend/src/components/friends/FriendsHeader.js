import React from 'react';

const FriendsHeader = () => {
  return (
    <div className="friends-header">
      <h1 className="friends-title">My Connections</h1>
      <div className="friends-search">
        <svg className="search-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="11" cy="11" r="8"></circle>
          <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
        </svg>
        <input type="text" placeholder="Search connections..." />
      </div>
    </div>
  );
};

export default FriendsHeader;