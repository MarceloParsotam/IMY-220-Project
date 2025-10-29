import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';

const SearchBar = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState({ users: [], projects: [] });
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const { currentUser } = useAuth();

  useEffect(() => {
    if (query.length > 2) {
      performSearch();
    } else {
      setResults({ users: [], projects: [] });
      setShowResults(false);
    }
  }, [query]);

  const performSearch = async () => {
    setIsSearching(true);
    try {
      const response = await fetch(`/api/search?q=${encodeURIComponent(query)}`, {
        headers: {
          'Authorization': `Bearer ${currentUser._id}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setResults(data);
        setShowResults(true);
      }
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setIsSearching(false);
    }
  };

  const handleHashtagClick = (hashtag) => {
    setQuery(hashtag);
  };

  const extractHashtags = (text) => {
    const hashtagRegex = /#(\w+)/g;
    return [...text.matchAll(hashtagRegex)].map(match => match[0]);
  };

  return (
    <div className="search-container">
      <div className="search-bar">
        <svg className="search-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="11" cy="11" r="8"></circle>
          <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
        </svg>
        <input
          type="text"
          placeholder="Search users, projects, or hashtags..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="search-input"
        />
        {isSearching && <div className="search-spinner">⟳</div>}
      </div>

      {showResults && (
        <div className="search-results">
          {/* Users Results */}
          {results.users.length > 0 && (
            <div className="results-section">
              <h4>Users</h4>
              {results.users.map(user => (
                <Link 
                  key={user.id} 
                  to={`/profile/${user.id}`}
                  className="result-item user-result"
                  onClick={() => setShowResults(false)}
                >
                  <img src={user.avatar} alt={user.name} className="result-avatar" />
                  <div className="result-info">
                    <div className="result-name">{user.name}</div>
                    <div className="result-username">@{user.username}</div>
                  </div>
                </Link>
              ))}
            </div>
          )}

          {/* Projects Results */}
          {results.projects.length > 0 && (
            <div className="results-section">
              <h4>Projects</h4>
              {results.projects.map(project => (
                <Link 
                  key={project.id} 
                  to={`/projects/${project.id}`}
                  className="result-item project-result"
                  onClick={() => setShowResults(false)}
                >
                  <div className="project-icon">📁</div>
                  <div className="result-info">
                    <div className="result-name">{project.name}</div>
                    <div className="result-description">{project.description}</div>
                    <div className="project-tags">
                      {project.tags?.map(tag => (
                        <span 
                          key={tag} 
                          className="hashtag-tag"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleHashtagClick(`#${tag}`);
                          }}
                        >#{tag}</span>
                      ))}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}

          {results.users.length === 0 && results.projects.length === 0 && (
            <div className="no-results">No results found for "{query}"</div>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchBar;