const express = require('express');
const router = express.Router();
const { ObjectId } = require('mongodb');
const viewDocDB = require('../viewDocDB');
const { authenticateUser } = require('../middleware/auth');

// POST /api/activities - Create new activity
router.post('/', authenticateUser, async (req, res) => {
    try {
        const { title, description, type } = req.body;
        const userId = req.user._id;

        const activitiesCollection = viewDocDB.getCollection('activities');

        const newActivity = {
            userId: new ObjectId(userId),
            title,
            description,
            type: type || 'general',
            date: new Date()
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

// POST /api/checkins - Create new checkin
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

// GET /api/activities - Get activities for feed
router.get('/', authenticateUser, async (req, res) => {
    try {
        const { filter = 'all', limit = 20 } = req.query;
        const currentUserId = req.user._id;

        const activitiesCollection = viewDocDB.getCollection('activities');
        const usersCollection = viewDocDB.getCollection('users');
        
        //console.log('🔍 Current user ID:', currentUserId);
        //console.log('🔍 Filter:', filter);

        // Define which activity types are local vs global
        // LOCAL: Personal user actions (check-ins, favorites, etc.)
        const localActivityTypes = [
            'project_checked_in', 
            'project_checked_out', 
            'project_favorited',
            'code_commit',
            'bug_fix',
            'documentation'
        ];
        
        // GLOBAL: Public announcements, system updates, major milestones
        const globalActivityTypes = [
            'project_completed',
            'milestone', 
            'collaboration',
            'announcement',
            'system_update',
            'performance',
            'new_feature'
        ];

        // Build query based on filter
        let query = {};
        
        switch (filter) {
            case 'local':
                // Only show personal activity types
                query.type = { $in: localActivityTypes };
                //console.log('🔍 Local query - personal actions only');
                break;
            case 'global':
                // Only show global/public activity types  
                query.type = { $in: globalActivityTypes };
                //console.log('🔍 Global query - public announcements only');
                break;
            case 'all':
            default:
                // Show all activity types
                //console.log('🔍 All activities - all types');
                break;
        }

        const activities = await activitiesCollection
            .find(query)
            .sort({ date: -1 })
            .limit(parseInt(limit))
            .toArray();

        //console.log('🔍 Found activities:', activities.length);

        // Get usernames
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
            .toArray();
        
        const userMap = {};
        users.forEach(user => {
            userMap[user._id.toString()] = user.username || user.email;
        });

        // Format activities
        const formattedActivities = activities.map(activity => {
            const isLocalType = localActivityTypes.includes(activity.type);
            const activityType = isLocalType ? 'local' : 'global';

            return {
                id: activity._id.toString(),
                type: activityType,
                title: activity.title,
                content: activity.description,
                author: userMap[activity.userId] || 'Unknown User',
                timestamp: formatRelativeTime(activity.date),
                projectId: activity.projectId ? activity.projectId.toString() : null,
                likes: Math.floor(Math.random() * 50),
                comments: Math.floor(Math.random() * 10),
                isCurrentUser: activity.userId === currentUserId
            };
        });

        //console.log('✅ Sending activities:', formattedActivities.length);
        //console.log('✅ Activity breakdown:', {
        //     local: formattedActivities.filter(a => a.type === 'local').length,
        //     global: formattedActivities.filter(a => a.type === 'global').length
        // });

        res.json({
            success: true,
            activities: formattedActivities
        });
    } catch (error) {
        //console.error('Error fetching activities:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch activities'
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

// POST /api/activities - Create new activity
router.post('/', authenticateUser, async (req, res) => {
    try {
        const { title, description, type, projectId } = req.body;
        const userId = req.user._id;

        const activitiesCollection = viewDocDB.getCollection('activities');

        const newActivity = {
            userId: userId, // Store as string
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

module.exports = router;