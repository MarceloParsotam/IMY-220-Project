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

module.exports = router;