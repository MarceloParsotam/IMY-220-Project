const express = require('express');
const router = express.Router();
const { ObjectId } = require('mongodb');
const viewDocDB = require('../viewDocDB');
const { authenticateUser } = require('../middleware/auth');

// GET /api/friends/:userId - Get user's friends
router.get('/:userId', authenticateUser, async (req, res) => {
  try {
    const { userId } = req.params;
    const usersCollection = viewDocDB.getCollection('users');

    const user = await usersCollection.findOne(
      { _id: new ObjectId(userId) },
      { projection: { friends: 1 } }
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const friends = await usersCollection.find({
      _id: { $in: user.friends || [] }
    })
    .project({ name: 1, surname: 1, username: 1, avatar: 1, bio: 1, skills: 1, projects: 1 })
    .toArray();

    const transformedFriends = friends.map(friend => ({
      id: friend._id,
      name: `${friend.name} ${friend.surname}`,
      username: friend.username,
      avatar: (friend.avatar && friend.avatar.data) ? 
        `http://localhost:3000/api/users/${friend._id}/avatar` : 
        '/default-avatar.png',
      title: friend.bio || 'Developer',
      skills: friend.skills || [],
      projects: friend.projects ? friend.projects.length : 0,
      followers: Math.floor(Math.random() * 2000) + 100
    }));

    res.json({
      success: true,
      friends: transformedFriends
    });

  } catch (error) {
    console.error('Error fetching friends:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch friends'
    });
  }
});

// GET /api/friends/requests/:userId - Get friend requests
router.get('/requests/:userId', authenticateUser, async (req, res) => {
  try {
    const { userId } = req.params;
    const usersCollection = viewDocDB.getCollection('users');

    const user = await usersCollection.findOne(
      { _id: new ObjectId(userId) },
      { projection: { friendRequests: 1 } }
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const requests = await usersCollection.find({
      _id: { $in: user.friendRequests || [] }
    })
    .project({ name: 1, surname: 1, username: 1, avatar: 1, bio: 1, skills: 1 })
    .toArray();

    const transformedRequests = requests.map(request => ({
      id: request._id,
      avatar: (request.avatar && request.avatar.data) ? 
        `http://localhost:3000/api/users/${request._id}/avatar` : 
        '/default-avatar.png',
      name: `${request.name} ${request.surname}`,
      meta: `${request.skills?.[0] || 'Developer'} • ${Math.floor(Math.random() * 5) + 1} mutual connections`
    }));

    res.json({
      success: true,
      requests: transformedRequests
    });

  } catch (error) {
    console.error('Error fetching friend requests:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch friend requests'
    });
  }
});

// GET /api/friends/suggestions/:userId - Get friend suggestions
router.get('/suggestions/:userId', authenticateUser, async (req, res) => {
  try {
    const { userId } = req.params;
    const usersCollection = viewDocDB.getCollection('users');

    const currentUser = await usersCollection.findOne(
      { _id: new ObjectId(userId) },
      { projection: { skills: 1, friends: 1, friendRequests: 1, removedFriends: 1 } }
    );

    if (!currentUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const excludedUsers = [
      new ObjectId(userId),
      ...(currentUser.friends || []),
      ...(currentUser.friendRequests || [])
    ];

    let query = {
      _id: { $not: { $in: excludedUsers } }
    };

    if (currentUser.skills && currentUser.skills.length > 0) {
      query.skills = { $in: currentUser.skills };
    }

    const suggestions = await usersCollection.find(query)
    .limit(12)
    .project({ name: 1, surname: 1, username: 1, avatar: 1, bio: 1, skills: 1, projects: 1 })
    .toArray();

    const transformedSuggestions = suggestions.map(suggestion => {
      const wasConnected = currentUser.removedFriends && 
        currentUser.removedFriends.some(removedId => removedId.equals(suggestion._id));
      
      return {
        id: suggestion._id,
        avatar: (suggestion.avatar && suggestion.avatar.data) ? 
          `http://localhost:3000/api/users/${suggestion._id}/avatar` : 
          '/default-avatar.png',
        name: `${suggestion.name} ${suggestion.surname}`,
        title: suggestion.bio || 'Developer',
        skills: suggestion.skills || [],
        projects: suggestion.projects ? suggestion.projects.length : 0,
        followers: Math.floor(Math.random() * 2000) + 100,
        wasConnected: wasConnected
      };
    });

    res.json({
      success: true,
      suggestions: transformedSuggestions
    });

  } catch (error) {
    console.error('Error fetching suggestions:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch suggestions'
    });
  }
});

// POST /api/friends/request - Send friend request
router.post('/request', authenticateUser, async (req, res) => {
  try {
    const { fromUserId, toUserId } = req.body;

    if (fromUserId !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You can only send requests from your own account'
      });
    }

    const usersCollection = viewDocDB.getCollection('users');

    const result = await usersCollection.updateOne(
      { _id: new ObjectId(toUserId) },
      { $addToSet: { friendRequests: new ObjectId(fromUserId) } }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      message: 'Friend request sent successfully'
    });

  } catch (error) {
    console.error('Error sending friend request:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send friend request'
    });
  }
});

// POST /api/friends/accept - Accept friend request
router.post('/accept', authenticateUser, async (req, res) => {
  try {
    const { userId, requestUserId } = req.body;

    if (userId !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You can only accept requests for your own account'
      });
    }

    const usersCollection = viewDocDB.getCollection('users');

    await usersCollection.updateOne(
      { _id: new ObjectId(userId) },
      { 
        $pull: { friendRequests: new ObjectId(requestUserId) },
        $addToSet: { friends: new ObjectId(requestUserId) }
      }
    );

    await usersCollection.updateOne(
      { _id: new ObjectId(requestUserId) },
      { $addToSet: { friends: new ObjectId(userId) } }
    );

    res.json({
      success: true,
      message: 'Friend request accepted successfully'
    });

  } catch (error) {
    console.error('Error accepting friend request:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to accept friend request'
    });
  }
});

// POST /api/friends/decline - Decline friend request
router.post('/decline', authenticateUser, async (req, res) => {
  try {
    const { userId, requestUserId } = req.body;

    if (userId !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You can only decline requests for your own account'
      });
    }

    const usersCollection = viewDocDB.getCollection('users');

    await usersCollection.updateOne(
      { _id: new ObjectId(userId) },
      { $pull: { friendRequests: new ObjectId(requestUserId) } }
    );

    res.json({
      success: true,
      message: 'Friend request declined successfully'
    });

  } catch (error) {
    console.error('Error declining friend request:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to decline friend request'
    });
  }
});

// DELETE /api/friends/remove - Remove friend
router.delete('/remove', authenticateUser, async (req, res) => {
  try {
    const { userId, friendId } = req.body;

    if (userId !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You can only remove friends from your own account'
      });
    }

    const usersCollection = viewDocDB.getCollection('users');

    await usersCollection.updateOne(
      { _id: new ObjectId(userId) },
      { $pull: { friends: new ObjectId(friendId) } }
    );

    await usersCollection.updateOne(
      { _id: new ObjectId(friendId) },
      { $pull: { friends: new ObjectId(userId) } }
    );

    res.json({
      success: true,
      message: 'Friend removed successfully',
      removedFriendId: friendId
    });

  } catch (error) {
    console.error('Error removing friend:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to remove friend'
    });
  }
});
// GET /api/friends/status/:userId - Check friendship status
router.get('/status/:userId', authenticateUser, async (req, res) => {
  try {
    const { userId } = req.params;
    const currentUserId = req.query.currentUserId || req.user._id.toString();

    // If checking own profile, always return as friend
    if (userId === currentUserId) {
      return res.json({
        success: true,
        isFriend: true,
        status: 'own-profile'
      });
    }

    const usersCollection = viewDocDB.getCollection('users');

    // Check if users are friends
    const currentUser = await usersCollection.findOne(
      { _id: new ObjectId(currentUserId) },
      { projection: { friends: 1, friendRequests: 1 } }
    );

    if (!currentUser) {
      return res.status(404).json({
        success: false,
        message: 'Current user not found'
      });
    }

    const isFriend = currentUser.friends && 
      currentUser.friends.some(friendId => friendId.equals(new ObjectId(userId)));

    // Check if there's a pending request
    const hasPendingRequest = currentUser.friendRequests && 
      currentUser.friendRequests.some(requestId => requestId.equals(new ObjectId(userId)));

    let status = 'not-friend';
    if (isFriend) {
      status = 'friend';
    } else if (hasPendingRequest) {
      status = 'pending';
    }

    res.json({
      success: true,
      isFriend: isFriend,
      status: status
    });

  } catch (error) {
    console.error('Error checking friendship status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to check friendship status'
    });
  }
});

module.exports = router;