import React, { useState } from 'react';
import GlobalActivityFeed from './GlobalActivityFeed';
import LocalActivityFeed from './LocalActivityFeed';

const ActivityFeed = () => {
  const [activeFilter, setActiveFilter] = useState('all'); // 'all', 'local', 'global'

  const messages = [
    {
      id: 1,
      type: 'global',
      title: 'Global Message 1',
      content: 'Lorem ipsum dolor sit amet. Et facilis ducimus non laboriosam sunt et nesciunt quasi et ipsa voluptatem a quidem culpa. Sit nulla nihil est aspernatur itaque hic consequuntur corrupti eos iusto iste.',
      author: 'John Doe',
      timestamp: '2 hours ago',
      likes: 24,
      comments: 5
    },
    {
      id: 2,
      type: 'local',
      title: 'Local Message 1',
      content: 'Just deployed my new React project! Check it out and let me know what you think. Built with modern hooks and context API.',
      author: 'Sarah Johnson',
      timestamp: '1 hour ago',
      likes: 15,
      comments: 3,
      project: 'React Portfolio App'
    },
    {
      id: 3,
      type: 'global',
      title: 'Global Message 2',
      content: 'Lorem ipsum dolor sit amet. Et facilis ducimus non laboriosam sunt et nesciunt quasi et ipsa voluptatem a quidem culpa. Sit nulla nihil est aspernatur itaque hic consequuntur corrupti eos iusto iste.',
      author: 'Global Bot',
      timestamp: '3 hours ago',
      likes: 42,
      comments: 12
    },
    {
      id: 4,
      type: 'local',
      title: 'Need feedback on UI design',
      content: 'Working on a new dashboard interface. Would appreciate some feedback on the color scheme and layout choices.',
      author: 'Mike Chen',
      timestamp: '45 minutes ago',
      likes: 8,
      comments: 7,
      project: 'Admin Dashboard'
    },
    {
      id: 5,
      type: 'global',
      title: 'Global Message 3',
      content: 'Lorem ipsum dolor sit amet. Et facilis ducimus non laboriosam sunt et nesciunt quasi et ipsa voluptatem a quidem culpa. Sit nulla nihil est aspernatur itaque hic consequuntur corrupti eos iusto iste.',
      author: 'Community Manager',
      timestamp: '5 hours ago',
      likes: 37,
      comments: 8
    }
  ];

  const globalMessages = messages.filter(msg => msg.type === 'global');
  const localMessages = messages.filter(msg => msg.type === 'local');

  const renderContent = () => {
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
      
      <div className="messages-container">
        {renderContent()}
      </div>
    </div>
  );
};

export default ActivityFeed;