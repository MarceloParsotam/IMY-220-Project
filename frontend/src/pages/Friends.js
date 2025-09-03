import React, { useState } from 'react';
import FriendsHeader from '../components/friends/FriendsHeader';
import FriendsTabs from '../components/friends/FriendsTabs';
import FriendCard from '../components/friends/FriendCard';
import RequestItem from '../components/friends/RequestItem';
import SuggestionsSection from '../components/friends/SuggestionsSection';

const Friends = () => {
    const [activeTab, setActiveTab] = useState('all');

  // Sample data
  const friends = [
    {
      id: 1,
      avatar: 'https://randomuser.me/api/portraits/women/44.jpg',
      name: 'Sarah Johnson',
      title: 'Frontend Developer',
      projects: 27,
      followers: 1200
    },
    {
      id: 2,
      avatar: 'https://randomuser.me/api/portraits/men/22.jpg',
      name: 'Michael Chen',
      title: 'Data Scientist',
      projects: 15,
      followers: 856
    },
    {
      id: 3,
      avatar: 'https://randomuser.me/api/portraits/women/33.jpg',
      name: 'Emma Rodriguez',
      title: 'Full Stack Dev',
      projects: 42,
      followers: 2300
    },
    {
      id: 4,
      avatar: 'https://randomuser.me/api/portraits/men/65.jpg',
      name: 'Robert Taylor',
      title: 'DevOps Engineer',
      projects: 19,
      followers: 1100
    },
    {
      id: 5,
      avatar: 'https://randomuser.me/api/portraits/women/28.jpg',
      name: 'Lisa Park',
      title: 'UI/UX Designer',
      projects: 31,
      followers: 1500
    },
    {
      id: 6,
      avatar: 'https://randomuser.me/api/portraits/men/41.jpg',
      name: 'David Wilson',
      title: 'Backend Developer',
      projects: 22,
      followers: 987
    }
  ];

  const requests = [
    {
      avatar: 'https://randomuser.me/api/portraits/women/68.jpg',
      name: 'Jennifer Lee',
      meta: 'Python Developer at DataCorp • 5 mutual connections'
    },
    {
      avatar: 'https://randomuser.me/api/portraits/men/85.jpg',
      name: 'Alex Martinez',
      meta: 'React Developer • 3 mutual connections'
    }
  ];

  const suggestions = [
    {
      id: 101,
      avatar: 'https://randomuser.me/api/portraits/women/72.jpg',
      name: 'Olivia Brown',
      title: 'JavaScript Developer',
      projects: 18,
      followers: 723
    },
    {
      id: 102,
      avatar: 'https://randomuser.me/api/portraits/men/93.jpg',
      name: 'James Wilson',
      title: 'Cloud Architect',
      projects: 24,
      followers: 1400
    },
    {
      id: 103,
      avatar: 'https://randomuser.me/api/portraits/women/85.jpg',
      name: 'Sophia Garcia',
      title: 'Mobile Developer',
      projects: 16,
      followers: 892
    }
  ];

  const handleRefresh = () => {
    // Logic to refresh suggestions
    console.log('Refreshing suggestions...');
  };

  return (
    <div className="friends-container">
      <FriendsHeader />
      <FriendsTabs activeTab={activeTab} setActiveTab={setActiveTab} />
      
      {/* Friends Grid */}
      <div className="friends-grid">
        {friends.map((friend, index) => (
          <FriendCard key={index} friend={friend} />
        ))}
      </div>
      
      {/* Connection Requests Section */}
      <div className="section-header">
        <h2 className="section-title">Connection Requests</h2>
        <span className="request-count">5 new requests</span>
      </div>
      
      {requests.map((request, index) => (
        <RequestItem key={index} request={request} />
      ))}
      
      {/* Suggestions Section */}
      <SuggestionsSection suggestions={suggestions} onRefresh={handleRefresh} />
    </div>
  );
};

export default Friends;