import React, { useState, useEffect } from 'react';
import GlobalActivityFeed from './GlobalActivityFeed';
import LocalActivityFeed from './LocalActivityFeed';
import { useAuth } from '../contexts/AuthContext';

const ActivityFeed = () => {
  const [activeFilter, setActiveFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchResults, setSearchResults] = useState(null);
  const [isSearching, setIsSearching] = useState(false);
  const { currentUser, isAuthenticated } = useAuth();

  useEffect(() => {
    if (searchQuery) {
      handleSearch();
    } else {
      setSearchResults(null);
      fetchActivities();
    }
  }, [activeFilter, currentUser, searchQuery]);

  const fetchActivities = async () => {
    try {
      setLoading(true);
      
      if (!currentUser || !currentUser._id) {
        console.error('No current user or user ID found');
        setMessages([]);
        return;
      }
      
      const response = await fetch(`/api/activities?filter=${activeFilter}`, {
        headers: {
          'Authorization': `Bearer ${currentUser._id}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Activities fetched:', data.activities);
        setMessages(data.activities || []);
      } else {
        const errorText = await response.text();
        console.error('API Error:', response.status, errorText);
        setMessages([]);
      }
    } catch (error) {
      console.error('Fetch Error:', error);
      setMessages([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      setSearchResults(null);
      return;
    }

    setIsSearching(true);
    try {
      const response = await fetch(`/api/search?q=${encodeURIComponent(searchQuery)}`, {
        headers: {
          'Authorization': `Bearer ${currentUser._id}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setSearchResults(data);
      } else {
        console.error('Search failed');
        setSearchResults({ users: [], projects: [] });
      }
    } catch (error) {
      console.error('Search error:', error);
      setSearchResults({ users: [], projects: [] });
    } finally {
      setIsSearching(false);
    }
  };

  const handleHashtagClick = (hashtag) => {
    setSearchQuery(hashtag);
  };

  // Extract hashtags from activity content for clickable functionality
  const extractHashtags = (text) => {
    const hashtagRegex = /#(\w+)/g;
    const matches = text?.match(hashtagRegex) || [];
    return [...new Set(matches)]; // Remove duplicates
  };

  // Render search results when searching
  const renderSearchResults = () => {
    if (!searchResults) return null;

    const { users = [], projects = [] } = searchResults;

    return (
      <div className="search-results-container">
        <div className="search-results-header">
          <h3>Search Results for "{searchQuery}"</h3>
          <button 
            className="clear-search-btn"
            onClick={() => {
              setSearchQuery('');
              setSearchResults(null);
            }}
          >
            Clear Search
          </button>
        </div>

        {/* Users Results */}
        {users.length > 0 && (
          <div className="search-results-section">
            <h4 className="results-section-title">Users ({users.length})</h4>
            <div className="users-results-grid">
              {users.map(user => (
                <div key={user.id} className="user-search-result">
                  <img 
                    src={user.avatar} 
                    alt={user.name}
                    className="user-result-avatar"
                    onError={(e) => {
                      e.target.src = '/default-avatar.png';
                    }}
                  />
                  <div className="user-result-info">
                    <div className="user-result-name">{user.name}</div>
                    <div className="user-result-username">@{user.username}</div>
                  </div>
                  <a 
                    href={`/profile/${user.id}`}
                    className="view-profile-btn"
                    onClick={(e) => {
                      e.preventDefault();
                      window.location.href = `/profile/${user.id}`;
                    }}
                  >
                    View Profile
                  </a>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Projects Results */}
        {projects.length > 0 && (
          <div className="search-results-section">
            <h4 className="results-section-title">Projects ({projects.length})</h4>
            <div className="projects-results-list">
              {projects.map(project => (
                <div key={project.id} className="project-search-result">
                  <div className="project-result-icon">📁</div>
                  <div className="project-result-info">
                    <div className="project-result-name">{project.name}</div>
                    <div className="project-result-description">
                      {project.description}
                    </div>
                    <div className="project-result-tags">
                      {project.tags?.map(tag => (
                        <span 
                          key={tag}
                          className="hashtag-tag clickable"
                          onClick={() => handleHashtagClick(`#${tag}`)}
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>
                  <a 
                    href={`/projects/${project.id}`}
                    className="view-project-btn"
                    onClick={(e) => {
                      e.preventDefault();
                      window.location.href = `/projects/${project.id}`;
                    }}
                  >
                    View Project
                  </a>
                </div>
              ))}
            </div>
          </div>
        )}

        {users.length === 0 && projects.length === 0 && (
          <div className="no-search-results">
            <p>No results found for "{searchQuery}"</p>
            <p>Try searching for users, projects, or hashtags</p>
          </div>
        )}
      </div>
    );
  };

  // Enhanced activity rendering with hashtag support
  const renderActivityWithHashtags = (activity) => {
    if (!activity.content) return activity.content;
    
    const hashtags = extractHashtags(activity.content);
    let content = activity.content;
    
    // Make hashtags clickable
    hashtags.forEach(hashtag => {
      content = content.replace(
        new RegExp(hashtag, 'g'),
        `<span class="hashtag clickable" data-hashtag="${hashtag}">${hashtag}</span>`
      );
    });

    return { __html: content };
  };

  const filteredMessages = messages.filter(message => {
    if (!searchQuery || searchResults) return true;
    
    const searchLower = searchQuery.toLowerCase();
    return (
      message.title.toLowerCase().includes(searchLower) ||
      message.content.toLowerCase().includes(searchLower) ||
      message.author.toLowerCase().includes(searchLower)
    );
  });

  const globalMessages = filteredMessages.filter(msg => msg.type === 'global');
  const localMessages = filteredMessages.filter(msg => msg.type === 'local');

  const renderContent = () => {
    if (loading) {
      return <div className="loading">Loading activities...</div>;
    }

    if (searchResults) {
      return renderSearchResults();
    }

    switch (activeFilter) {
      case 'local':
        return (
          <LocalActivityFeed 
            messages={localMessages} 
            onHashtagClick={handleHashtagClick}
          />
        );
      case 'global':
        return (
          <GlobalActivityFeed 
            messages={globalMessages}
            onHashtagClick={handleHashtagClick}
          />
        );
      case 'all':
      default:
        return (
          <>
            <LocalActivityFeed 
              messages={localMessages}
              onHashtagClick={handleHashtagClick}
            />
            <GlobalActivityFeed 
              messages={globalMessages}
              onHashtagClick={handleHashtagClick}
            />
          </>
        );
    }
  };

  return (
    <div className="activity-feed">
      <div className="feed-header">
        <h2 className="feed-title">Activity Feed</h2>
        <div className="feed-controls">
          <div className="feed-search">
            <svg className="search-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
            <input
              type="text"
              placeholder="Search users, projects, or hashtags..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
            />
            {isSearching && (
              <div className="search-spinner">⟳</div>
            )}
          </div>
          <div className="feed-filter">
            <button 
              className={activeFilter === 'all' ? 'filter-btn active' : 'filter-btn'}
              onClick={() => setActiveFilter('all')}
            >
              All
            </button>
            <button 
              className={activeFilter === 'local' ? 'filter-btn active' : 'filter-btn'}
              onClick={() => setActiveFilter('local')}
            >
              Local
            </button>
            <button 
              className={activeFilter === 'global' ? 'filter-btn active' : 'filter-btn'}
              onClick={() => setActiveFilter('global')}
            >
              Global
            </button>
          </div>
        </div>
      </div>
      
      <div className="messages-container">
        {!loading && !searchResults && filteredMessages.length === 0 ? (
          <div className="empty-state">
            {searchQuery ? `No activities found for "${searchQuery}"` : 'No activities available'}
          </div>
        ) : (
          renderContent()
        )}
      </div>
    </div>
  );
};

export default ActivityFeed;