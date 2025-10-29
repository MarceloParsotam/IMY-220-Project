const express = require('express');
const router = express.Router();
const { ObjectId } = require('mongodb');
const viewDocDB = require('../viewDocDB');
const { authenticateUser } = require('../middleware/auth');

// GET /api/activities - Get activities for feed (FIXED VERSION)
router.get('/', authenticateUser, async (req, res) => {
    try {
        const { filter = 'all', limit = 20 } = req.query;
        const currentUserId = req.user._id;

        const activitiesCollection = viewDocDB.getCollection('activities');
        const usersCollection = viewDocDB.getCollection('users');
        
        console.log('🔍 Current user ID:', currentUserId);
        console.log('🔍 Filter:', filter);

        // Get current user's friends list
        const currentUser = await usersCollection.findOne(
            { _id: new ObjectId(currentUserId) },
            { projection: { friends: 1 } }
        );

        const userFriends = currentUser?.friends || [];
        console.log('🔍 User friends count:', userFriends.length);

        // Build query based on friendship logic
        let userQuery = {};
        
        switch (filter) {
            case 'local':
                // Show activities from FRIENDS only
                userQuery = { 
                    userId: { 
                        $in: [
                            new ObjectId(currentUserId), // Include own activities
                            ...userFriends.map(friendId => new ObjectId(friendId))
                        ]
                    } 
                };
                console.log('🔍 Local query - friends & own activities only');
                break;
                
            case 'global':
                // Show activities from NON-FRIENDS only (exclude self and friends)
                userQuery = { 
                    userId: { 
                        $not: { 
                            $in: [
                                new ObjectId(currentUserId),
                                ...userFriends.map(friendId => new ObjectId(friendId))
                            ]
                        }
                    } 
                };
                console.log('🔍 Global query - non-friends only');
                break;
                
            case 'all':
            default:
                // Show activities from EVERYONE
                console.log('🔍 All activities - everyone');
                break;
        }

        const activities = await activitiesCollection
            .find(userQuery)
            .sort({ date: -1 }) // Reverse chronological order
            .limit(parseInt(limit))
            .toArray();

        console.log('🔍 Found activities:', activities.length);

        // Get user details for all activity authors
        const userIds = [...new Set(activities.map(activity => activity.userId))];
        const userObjectIds = userIds.map(id => {
            try {
                return new ObjectId(id);
            } catch (error) {
                console.error('Invalid ObjectId:', id);
                return null;
            }
        }).filter(id => id !== null);

        const users = await usersCollection
            .find({ _id: { $in: userObjectIds } })
            .project({ username: 1, name: 1, surname: 1, email: 1, avatar: 1 })
            .toArray();
        
        const userMap = {};
        users.forEach(user => {
            userMap[user._id.toString()] = {
                username: user.username,
                name: `${user.name || ''} ${user.surname || ''}`.trim() || user.username,
                email: user.email,
                avatar: user.avatar
            };
        });

        // Format activities with friendship-based types
        const formattedActivities = activities.map(activity => {
            const activityUserId = activity.userId.toString();
            const isCurrentUser = activityUserId === currentUserId;
            const isFriend = userFriends.some(friendId => friendId.toString() === activityUserId);
            
            // Determine activity type based on friendship
            let activityType = 'global'; // Default to global
            if (isCurrentUser || isFriend) {
                activityType = 'local';
            }

            return {
                id: activity._id.toString(),
                type: activityType,
                title: activity.title,
                content: activity.description,
                author: userMap[activityUserId]?.name || 'Unknown User',
                username: userMap[activityUserId]?.username,
                avatar: userMap[activityUserId]?.avatar,
                timestamp: formatRelativeTime(activity.date),
                projectId: activity.projectId ? activity.projectId.toString() : null,
                isCurrentUser: isCurrentUser,
                isFriend: isFriend,
                likes: Math.floor(Math.random() * 50),
                comments: Math.floor(Math.random() * 10)
            };
        });

        console.log('✅ Sending activities:', formattedActivities.length);
        console.log('✅ Activity breakdown:', {
            local: formattedActivities.filter(a => a.type === 'local').length,
            global: formattedActivities.filter(a => a.type === 'global').length,
            own: formattedActivities.filter(a => a.isCurrentUser).length,
            friends: formattedActivities.filter(a => a.isFriend && !a.isCurrentUser).length,
            strangers: formattedActivities.filter(a => !a.isFriend && !a.isCurrentUser).length
        });

        res.json({
            success: true,
            activities: formattedActivities
        });
    } catch (error) {
        console.error('Error fetching activities:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch activities'
        });
    }
});

// POST /api/activities - Create new activity
router.post('/', authenticateUser, async (req, res) => {
    try {
        const { title, description, type, projectId } = req.body;
        const userId = req.user._id;

        const activitiesCollection = viewDocDB.getCollection('activities');

        const newActivity = {
            userId: userId,
            title,
            description,
            type: type || 'general',
            date: new Date(),
            projectId: projectId || null
        };

        const result = await activitiesCollection.insertOne(newActivity);

        res.status(201).json({
            success: true,
            message: 'Activity created successfully',
            activity: {
                _id: result.insertedId,
                ...newActivity
            }
        });
    } catch (error) {
        console.error('Error creating activity:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create activity'
        });
    }
});

// POST /api/activities/checkins - Create new checkin
router.post('/checkins', authenticateUser, async (req, res) => {
    try {
        const { location, notes, projectId } = req.body;
        const userId = req.user._id;

        const checkinsCollection = viewDocDB.getCollection('checkins');

        const newCheckin = {
            userId: new ObjectId(userId),
            location: location || 'Unknown Location',
            notes: notes || '',
            projectId: projectId ? new ObjectId(projectId) : null,
            checkinDate: new Date()
        };

        const result = await checkinsCollection.insertOne(newCheckin);

        res.status(201).json({
            success: true,
            message: 'Checkin created successfully',
            checkin: {
                _id: result.insertedId,
                ...newCheckin
            }
        });
    } catch (error) {
        console.error('Error creating checkin:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create checkin'
        });
    }
});

// Helper function to format relative time
function formatRelativeTime(date) {
    const now = new Date();
    const diffMs = now - new Date(date);
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} minutes ago`;
    if (diffHours < 24) return `${diffHours} hours ago`;
    if (diffDays === 1) return '1 day ago';
    return `${diffDays} days ago`;
}

module.exports = router;