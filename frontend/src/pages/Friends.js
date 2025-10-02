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
  const { currentUser } = useAuth();

  // Get token from localStorage
  const getToken = () => {
    const userData = JSON.parse(localStorage.getItem('user'));
    return userData?._id || userData?.id || '';
  };

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
        setFriends(friendsData.friends || []);
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
        setRequests(requestsData.requests || []);
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
        setSuggestions(suggestionsData.suggestions || []);
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
        setFriends(prev => [...prev, { ...acceptedRequest, projects: 0, followers: 0 }]);
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
      <FriendsHeader />
      <FriendsTabs activeTab={activeTab} setActiveTab={setActiveTab} />
      
      {/* Friends Grid */}
      <div className="section-header">
        <h2 className="section-title">My Connections ({friends.length})</h2>
      </div>
      
      <div className="friends-grid">
        {friends.map((friend, index) => (
          <FriendCard 
            key={friend.id || index} 
            friend={friend} 
            onRemove={() => handleRemoveFriend(friend.id, friend)}
          />
        ))}
        {friends.length === 0 && (
          <div className="no-friends-message">
            <p>You haven't added any connections yet.</p>
            <p>Check out the suggestions below to get started!</p>
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
        suggestions={suggestions} 
        onRefresh={handleRefreshSuggestions}
        onConnect={handleConnect}
      />
    </div>
  );
};

export default Friends;