import React from 'react';
import FriendCard from './FriendCard';

const SuggestionsSection = ({ suggestions, onRefresh, onConnect, searchQuery = '' }) => {
  // Filter suggestions based on search query (by name)
  const filteredSuggestions = suggestions.filter(suggestion =>
    suggestion.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
        {filteredSuggestions.map((suggestion, index) => (
          <FriendCard 
            key={suggestion.id || index} 
            friend={suggestion} 
            isSuggestion={true}
            onConnect={onConnect}
          />
        ))}
        {filteredSuggestions.length === 0 && (
          <div className="no-suggestions-message">
            {searchQuery ? (
              <p>No suggestions found for "{searchQuery}"</p>
            ) : (
              <>
                <p>No suggestions available at the moment.</p>
                <p>Try refreshing or add more skills to your profile!</p>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default SuggestionsSection;