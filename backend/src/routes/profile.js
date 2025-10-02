const express = require('express');
const router = express.Router();
const multer = require('multer');
const { ObjectId } = require('mongodb');
const viewDocDB = require('../viewDocDB');
const { authenticateUser } = require('../middleware/auth');

// Configure multer for file uploads (memory storage for binary data)
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  },
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

// GET /api/users/:userId - Get user profile data with all related data
router.get('/:userId', authenticateUser, async (req, res) => {
    try {
        const { userId } = req.params;
        const usersCollection = viewDocDB.getCollection('users');

        // Find user by ID
        const user = await usersCollection.findOne({ 
            _id: new ObjectId(userId) 
        });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Get user's projects
        const projectsCollection = viewDocDB.getCollection('projects');
        const userProjects = await projectsCollection.find({ 
            userId: new ObjectId(userId) 
        }).toArray();

        // Get user's activities and checkins
        const activitiesCollection = viewDocDB.getCollection('activities');
        const checkinsCollection = viewDocDB.getCollection('checkins');
        
        let userActivities = [];
        let userCheckins = [];

        try {
            userActivities = await activitiesCollection.find({ 
                userId: new ObjectId(userId) 
            })
            .sort({ date: -1 })
            .limit(10)
            .toArray();
        } catch (error) {
            console.log('Activities collection not available, using checkins');
        }

        if (userActivities.length === 0) {
            try {
                userCheckins = await checkinsCollection.find({ 
                    userId: new ObjectId(userId) 
                })
                .sort({ checkinDate: -1 })
                .limit(10)
                .toArray();
            } catch (error) {
                console.log('Checkins collection not available');
            }
        }

        // Get user's friends
        const friendsCollection = viewDocDB.getCollection('users');
        let userFriends = [];
        
        if (user.friends && user.friends.length > 0) {
            userFriends = await friendsCollection.find({
                _id: { $in: user.friends.map(friendId => new ObjectId(friendId)) }
            })
            .project({ name: 1, surname: 1, username: 1, avatar: 1, bio: 1 })
            .limit(12)
            .toArray();
        }

        // Transform data for frontend
        const transformedProjects = userProjects.map(project => ({
            id: project._id,
            initials: project.name.substring(0, 2).toUpperCase(),
            title: project.name,
            description: project.description,
            type: project.type,
            tags: project.tags || [],
            isPublic: project.isPublic,
            createdAt: project.createdAt
        }));

        const transformedActivities = userActivities.map(activity => ({
            id: activity._id,
            title: activity.title || `Activity on ${new Date(activity.date).toLocaleDateString()}`,
            description: activity.description || `Completed ${activity.type || 'task'}`,
            date: activity.date,
            type: activity.type
        }));

        const checkinActivities = userCheckins.map(checkin => ({
            id: checkin._id,
            title: `Check-in at ${checkin.location || 'Unknown Location'}`,
            description: checkin.notes || `Checked in on ${new Date(checkin.checkinDate).toLocaleDateString()}`,
            date: checkin.checkinDate,
            type: 'checkin'
        }));

        const allActivities = [...transformedActivities, ...checkinActivities]
            .sort((a, b) => new Date(b.date) - new Date(a.date))
            .slice(0, 10);

        const transformedFriends = userFriends.map(friend => ({
            id: friend._id,
            name: `${friend.name} ${friend.surname}`,
            avatar: (friend.avatar && friend.avatar.data) ? 
                `http://localhost:3000/api/users/${friend._id}/avatar` : 
                '/default-avatar.png',
            title: friend.bio || 'Developer'
        }));

        const avatarUrl = (user.avatar && user.avatar.data) ? 
            `http://localhost:3000/api/users/${user._id}/avatar` : 
            '/default-avatar.png';

        const userResponse = {
            _id: user._id,
            name: user.name,
            surname: user.surname,
            username: user.username,
            email: user.email,
            avatar: avatarUrl,
            avatars: [avatarUrl],
            bio: user.bio || 'No bio available',
            description: user.bio || 'No bio available',
            about: user.about || 'No about information available',
            skills: user.skills || [],
            projects: transformedProjects,
            activities: allActivities,
            friends: transformedFriends
        };

        res.json(userResponse);
    } catch (error) {
        console.error('Error fetching user data:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch user data'
        });
    }
});

// PUT /api/users/:userId - Update user profile
router.put('/:userId', authenticateUser, async (req, res) => {
    try {
        const { userId } = req.params;
        const { name, surname, bio, about, skills } = req.body;

        if (req.user._id.toString() !== userId) {
            return res.status(403).json({
                success: false,
                message: 'You can only update your own profile'
            });
        }

        const usersCollection = viewDocDB.getCollection('users');

        const updateData = {};
        if (name) updateData.name = name;
        if (surname) updateData.surname = surname;
        if (bio !== undefined) updateData.bio = bio;
        if (about !== undefined) updateData.about = about;
        if (skills) updateData.skills = skills;

        const result = await usersCollection.updateOne(
            { _id: new ObjectId(userId) },
            { $set: updateData }
        );

        if (result.matchedCount === 0) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        const updatedUser = await usersCollection.findOne({ 
            _id: new ObjectId(userId) 
        });

        const { password: _, ...userWithoutPassword } = updatedUser;

        res.json({
            success: true,
            message: 'Profile updated successfully',
            user: userWithoutPassword
        });
    } catch (error) {
        console.error('Error updating profile:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update profile'
        });
    }
});

// AVATAR ENDPOINTS

// PUT /api/users/:userId/avatar - Update user avatar
router.put('/:userId/avatar', authenticateUser, upload.single('avatar'), async (req, res) => {
  try {
    const { userId } = req.params;

    if (req.user._id.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: 'You can only update your own avatar'
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    const usersCollection = viewDocDB.getCollection('users');

    const avatarData = {
      data: req.file.buffer,
      contentType: req.file.mimetype,
      filename: req.file.originalname,
      uploadedAt: new Date(),
      size: req.file.size
    };

    const result = await usersCollection.updateOne(
      { _id: new ObjectId(userId) },
      { $set: { avatar: avatarData } }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      message: 'Avatar updated successfully'
    });

  } catch (error) {
    console.error('Error updating avatar:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update avatar'
    });
  }
});

// GET /api/users/:userId/avatar - Get user avatar image
router.get('/:userId/avatar', async (req, res) => {
  try {
    const { userId } = req.params;
    const usersCollection = viewDocDB.getCollection('users');

    const user = await usersCollection.findOne(
      { _id: new ObjectId(userId) },
      { projection: { avatar: 1 } }
    );

    if (!user || !user.avatar || !user.avatar.data) {
      return res.redirect('/default-avatar.png');
    }

    let imageBuffer;
    if (Buffer.isBuffer(user.avatar.data)) {
      imageBuffer = user.avatar.data;
    } else if (user.avatar.data.buffer) {
      imageBuffer = Buffer.from(user.avatar.data.buffer);
    } else if (typeof user.avatar.data === 'string') {
      imageBuffer = Buffer.from(user.avatar.data, 'base64');
    } else {
      throw new Error('Unsupported avatar data format');
    }

    res.set('Content-Type', user.avatar.contentType || 'image/jpeg');
    res.set('Cache-Control', 'public, max-age=3600');
    
    if (imageBuffer && imageBuffer.length) {
      res.set('Content-Length', imageBuffer.length);
    }
    
    res.send(imageBuffer);

  } catch (error) {
    console.error('Error fetching avatar:', error);
    res.redirect('/default-avatar.png');
  }
});

module.exports = router;