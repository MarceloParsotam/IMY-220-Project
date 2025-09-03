import React from 'react';
import FriendCard from './FriendCard';
const SuggestionsSection = ({ suggestions, onRefresh }) => {
  return (
    <div className="suggestions-section">
      <div className="section-header">
        <h2 className="section-title">People You May Know</h2>
        <button className="refresh-btn" onClick={onRefresh}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="23 4 23 10 17 10"></polyline>
            <polyline points="1 20 1 14 7 14"></polyline>
            <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path>
          </svg>
          Refresh
        </button>
      </div>
      <div className="friends-grid">
        {suggestions.map((suggestion, index) => (
          <FriendCard key={index} friend={suggestion} isSuggestion={true} />
        ))}
      </div>
    </div>
  );
};

export default SuggestionsSection;