import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import FriendsHeader from '../components/friends/FriendsHeader';
import FriendsTabs from '../components/friends/FriendsTabs';
import FriendCard from '../components/friends/FriendCard';
import RequestItem from '../components/friends/RequestItem';
import SuggestionsSection from '../components/friends/SuggestionsSection';

const Friends = () => {
  const [activeTab, setActiveTab] = useState('all');
  const [friends, setFriends] = useState([]);
  const [requests, setRequests] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const { currentUser } = useAuth();

  // Get token from localStorage
  const getToken = () => {
    const userData = JSON.parse(localStorage.getItem('user'));
    return userData?._id || userData?.id || '';
  };

  // Filter friends and suggestions based on search query
  const filteredFriends = friends.filter(friend =>
    friend.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredSuggestions = suggestions.filter(suggestion =>
    suggestion.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Fetch all friends data
  const fetchFriendsData = async () => {
    if (!currentUser) return;

    try {
      const token = getToken();
      const userId = currentUser._id || currentUser.id;

      // Fetch friends
      const friendsResponse = await fetch(`http://localhost:3000/api/friends/${userId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (friendsResponse.ok) {
        const friendsData = await friendsResponse.json();
        
        // Transform friends data to include proper IDs and structure
        const transformedFriends = (friendsData.friends || []).map(friend => ({
          id: friend._id || friend.id,
          name: `${friend.name || ''} ${friend.surname || ''}`.trim() || friend.username,
          username: friend.username,
          avatar: friend.avatar || '/default-avatar.png',
          title: friend.title || friend.bio || 'User',
          projects: friend.projects || 0,
          followers: friend.followers || 0,
          skills: friend.skills || [],
          wasConnected: friend.wasConnected || false
        }));
        
        setFriends(transformedFriends);
      }

      // Fetch requests
      const requestsResponse = await fetch(`http://localhost:3000/api/friends/requests/${userId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (requestsResponse.ok) {
        const requestsData = await requestsResponse.json();
        const transformedRequests = (requestsData.requests || []).map(request => ({
          id: request._id || request.id,
          name: `${request.name || ''} ${request.surname || ''}`.trim() || request.username,
          avatar: request.avatar || '/default-avatar.png',
          title: request.title || request.bio || 'User',
          meta: request.meta || 'Developer'
        }));
        setRequests(transformedRequests);
      }

      // Fetch suggestions
      const suggestionsResponse = await fetch(`http://localhost:3000/api/friends/suggestions/${userId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (suggestionsResponse.ok) {
        const suggestionsData = await suggestionsResponse.json();
        const transformedSuggestions = (suggestionsData.suggestions || []).map(suggestion => ({
          id: suggestion._id || suggestion.id,
          name: `${suggestion.name || ''} ${suggestion.surname || ''}`.trim() || suggestion.username,
          avatar: suggestion.avatar || '/default-avatar.png',
          title: suggestion.title || suggestion.bio || 'User',
          projects: suggestion.projects || 0,
          followers: suggestion.followers || 0,
          skills: suggestion.skills || [],
          wasConnected: suggestion.wasConnected || false
        }));
        setSuggestions(transformedSuggestions);
      }

    } catch (error) {
      console.error('Error fetching friends data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFriendsData();
  }, [currentUser]);

  const handleSearch = (query) => {
    setSearchQuery(query);
  };

  const handleConnect = async (suggestionId) => {
    try {
      const token = getToken();
      const userId = currentUser._id || currentUser.id;

      const response = await fetch('http://localhost:3000/api/friends/request', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          fromUserId: userId,
          toUserId: suggestionId
        })
      });

      if (response.ok) {
        // Remove from suggestions and add to requests
        setSuggestions(prev => prev.filter(s => s.id !== suggestionId));
        alert('Connection request sent!');
      }
    } catch (error) {
      console.error('Error sending connection request:', error);
    }
  };

  const handleAcceptRequest = async (requestUserId) => {
    try {
      const token = getToken();
      const userId = currentUser._id || currentUser.id;

      const response = await fetch('http://localhost:3000/api/friends/accept', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          userId: userId,
          requestUserId: requestUserId
        })
      });

      if (response.ok) {
        // Move from requests to friends
        const acceptedRequest = requests.find(r => r.id === requestUserId);
        setRequests(prev => prev.filter(r => r.id !== requestUserId));
        setFriends(prev => [...prev, { 
          ...acceptedRequest, 
          projects: 0, 
          followers: 0,
          skills: [] 
        }]);
        alert('Connection request accepted!');
      }
    } catch (error) {
      console.error('Error accepting request:', error);
    }
  };

  const handleDeclineRequest = async (requestUserId) => {
    try {
      const token = getToken();
      const userId = currentUser._id || currentUser.id;

      const response = await fetch('http://localhost:3000/api/friends/decline', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          userId: userId,
          requestUserId: requestUserId
        })
      });

      if (response.ok) {
        setRequests(prev => prev.filter(r => r.id !== requestUserId));
        alert('Connection request declined.');
      }
    } catch (error) {
      console.error('Error declining request:', error);
    }
  };

  const handleRemoveFriend = async (friendId, friendData) => {
    try {
      const token = getToken();
      const userId = currentUser._id || currentUser.id;

      const response = await fetch('http://localhost:3000/api/friends/remove', {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          userId: userId,
          friendId: friendId
        })
      });

      if (response.ok) {
        // Remove from friends list
        setFriends(prev => prev.filter(f => f.id !== friendId));
        
        // Add to suggestions with "wasConnected" flag
        const removedFriend = {
          ...friendData,
          wasConnected: true
        };
        setSuggestions(prev => [removedFriend, ...prev]); // Add to top of suggestions
        
        alert('Friend removed. They will appear in suggestions if you want to reconnect.');
      }
    } catch (error) {
      console.error('Error removing friend:', error);
    }
  };

  const handleRefreshSuggestions = () => {
    fetchFriendsData(); // Refetch all data to get new suggestions
  };

  if (loading) {
    return (
      <div className="friends-container">
        <div className="loading">Loading connections...</div>
      </div>
    );
  }

  return (
    <div className="friends-container">
      <FriendsHeader onSearch={handleSearch} />
      
      {/* Friends Grid */}
      <div className="section-header">
        <h2 className="section-title">
          My Connections ({filteredFriends.length})
          {searchQuery && ` - Search: "${searchQuery}"`}
        </h2>
      </div>
      
      <div className="friends-grid">
        {filteredFriends.map((friend, index) => (
          <FriendCard 
            key={friend.id || index} 
            friend={friend} 
            onRemove={() => handleRemoveFriend(friend.id, friend)}
          />
        ))}
        {filteredFriends.length === 0 && (
          <div className="no-friends-message">
            {searchQuery ? (
              <p>No friends found for "{searchQuery}"</p>
            ) : (
              <>
                <p>You haven't added any connections yet.</p>
                <p>Check out the suggestions below to get started!</p>
              </>
            )}
          </div>
        )}
      </div>
      
      {/* Connection Requests Section */}
      {requests.length > 0 && (
        <>
          <div className="section-header">
            <h2 className="section-title">Connection Requests</h2>
            <span className="request-count">{requests.length} new request{requests.length !== 1 ? 's' : ''}</span>
          </div>
          
          {requests.map((request, index) => (
            <RequestItem 
              key={request.id || index} 
              request={request}
              onAccept={() => handleAcceptRequest(request.id)}
              onDecline={() => handleDeclineRequest(request.id)}
            />
          ))}
        </>
      )}
      
      {/* Suggestions Section */}
      <SuggestionsSection 
        suggestions={filteredSuggestions} 
        onRefresh={handleRefreshSuggestions}
        onConnect={handleConnect}
        searchQuery={searchQuery}
      />
    </div>
  );
};

export default Friends;