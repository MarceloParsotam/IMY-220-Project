import React from 'react';

const FriendsTabs = ({ activeTab, setActiveTab }) => {
  const tabs = [
    { id: 'all', label: 'All Connections', count: 142 },
    { id: 'colleagues', label: 'Colleagues', count: 23 },
    { id: 'skills', label: 'Same Skills', count: 56 },
    { id: 'following', label: 'Following', count: 87 }
  ];

  return (
    <div className="friends-tabs">
      {tabs.map(tab => (
        <div 
          key={tab.id}
          className={`friends-tab ${activeTab === tab.id ? 'active' : ''}`}
          onClick={() => setActiveTab(tab.id)}
        >
          {tab.label} <span className="friends-count">{tab.count}</span>
        </div>
      ))}
    </div>
  );
};

export default FriendsTabs;