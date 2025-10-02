import React, { useState, useEffect } from 'react';
import GlobalActivityFeed from './GlobalActivityFeed';
import LocalActivityFeed from './LocalActivityFeed';
import { useAuth } from '../contexts/AuthContext'; // Import your auth context

const ActivityFeed = () => {
  const [activeFilter, setActiveFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const { currentUser, isAuthenticated } = useAuth(); // Get currentUser from auth context

  useEffect(() => {
    fetchActivities();
  }, [activeFilter, currentUser]); // Add currentUser as dependency

  const fetchActivities = async () => {
  try {
    setLoading(true);
    
    // Check if we have the current user with valid ID
    if (!currentUser || !currentUser._id) {
      console.error('No current user or user ID found');
      setMessages([]); // Empty array instead of mock data
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
      setMessages([]); // Empty array instead of mock data
    }
  } catch (error) {
    console.error('Fetch Error:', error);
    setMessages([]); // Empty array instead of mock data
  } finally {
    setLoading(false);
  }
};

  // Rest of your component remains the same...
  const filteredMessages = messages.filter(message => {
    if (!searchQuery) return true;
    
    const searchLower = searchQuery.toLowerCase();
    return (
      message.title.toLowerCase().includes(searchLower) ||
      message.content.toLowerCase().includes(searchLower) ||
      message.author.toLowerCase().includes(searchLower) ||
      (message.project && message.project.toLowerCase().includes(searchLower))
    );
  });

  const globalMessages = filteredMessages.filter(msg => msg.type === 'global');
  const localMessages = filteredMessages.filter(msg => msg.type === 'local');

  const renderContent = () => {
    if (loading) {
      return <div className="loading">Loading activities...</div>;
    }

    switch (activeFilter) {
      case 'local':
        return <LocalActivityFeed messages={localMessages} />;
      case 'global':
        return <GlobalActivityFeed messages={globalMessages} />;
      case 'all':
      default:
        return (
          <>
            <LocalActivityFeed messages={localMessages} />
            <GlobalActivityFeed messages={globalMessages} />
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
              placeholder="Search activities..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
            />
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
        {!loading && filteredMessages.length === 0 ? (
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