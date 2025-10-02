import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import FriendCard from '../components/friends/FriendCard';

const PossibleConnections = () => {
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const { currentUser, isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated && currentUser) {
      fetchFriendSuggestions();
    }
  }, [currentUser, isAuthenticated]);

  const fetchFriendSuggestions = async () => {
    try {
      setLoading(true);
      
      const response = await fetch(`/api/friends/suggestions/${currentUser._id}`, {
        headers: {
          'Authorization': `Bearer ${currentUser._id}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setSuggestions(data.suggestions || []);
      } else {
        console.error('Failed to fetch friend suggestions');
        setSuggestions(getFallbackSuggestions());
      }
    } catch (error) {
      console.error('Error fetching friend suggestions:', error);
      setSuggestions(getFallbackSuggestions());
    } finally {
      setLoading(false);
    }
  };

  const getFallbackSuggestions = () => {
    // Fallback data if API fails
    return [
      { 
        id: '1', 
        name: 'David Cool',
        title: 'Full Stack Developer',
        skills: ['React', 'Node.js', 'MongoDB'],
        projects: 12,
        followers: 342,
        wasConnected: false
      },
      { 
        id: '2', 
        name: 'Jessica Amber',
        title: 'UI/UX Designer', 
        skills: ['Figma', 'Sketch', 'Adobe XD'],
        projects: 8,
        followers: 287,
        wasConnected: true
      },
      { 
        id: '3', 
        name: 'Alex Johnson',
        title: 'Backend Engineer',
        skills: ['Python', 'Django', 'PostgreSQL'],
        projects: 15,
        followers: 421,
        wasConnected: false
      }
    ];
  };

  const handleConnect = async (userId) => {
    try {
      const response = await fetch('/api/friends/request', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${currentUser._id}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          fromUserId: currentUser._id,
          toUserId: userId
        })
      });

      if (response.ok) {
        // Remove the connected user from suggestions
        setSuggestions(suggestions.filter(suggestion => suggestion.id !== userId));
        alert('Connection request sent!');
      } else {
        console.error('Failed to send connection request');
        alert('Failed to send connection request');
      }
    } catch (error) {
      console.error('Error sending connection request:', error);
      alert('Error sending connection request');
    }
  };

  if (loading) {
    return (
      <div className="possible-connections">
        <h3 className="section-title">Possible Connections</h3>
        <div className="loading">Loading suggestions...</div>
      </div>
    );
  }

  return (
    <div className="possible-connections">
      <h3 className="section-title">Possible Connections</h3>
      
      {suggestions.length === 0 ? (
        <div className="empty-state">
          <p>No connection suggestions available</p>
        </div>
      ) : (
        <div className="connections-grid">
          {suggestions.slice(0, 2).map((suggestion) => (
            <FriendCard
              key={suggestion.id}
              friend={suggestion}
              isSuggestion={true}
              onConnect={handleConnect}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default PossibleConnections;