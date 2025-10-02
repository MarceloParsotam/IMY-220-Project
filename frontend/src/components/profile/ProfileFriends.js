import React from 'react';
import FriendCard from '../friends/FriendCard';
//frontend\src\components\friends\FriendCard.js

const ProfileFriends = ({ friends }) => {
  return (
    <div className="profile-section">
      <div className="section-header">
        <h2 className="section-title">Friends</h2>
        <span className="friends-count">{friends.length} friends</span>
      </div>
      
      <div className="friends-grid">
        {friends.map((friend, index) => (
          <FriendCard 
            key={friend.id || index} 
            friend={friend}
            isSuggestion={false}
          />
        ))}
        {friends.length === 0 && (
          <p className="no-friends">No friends yet</p>
        )}
      </div>
    </div>
  );
};

export default ProfileFriends;