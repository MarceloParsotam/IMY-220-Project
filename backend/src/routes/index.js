const express = require('express');
const router = express.Router();

// Import all route modules
const authRoutes = require('./auth');
const profileRoutes = require('./profile');
const projectRoutes = require('./projects');
const friendRoutes = require('./friends');
const activityRoutes = require('./activities');

// Use routes
router.use('/auth', authRoutes);
router.use('/users', profileRoutes);
router.use('/projects', projectRoutes);
router.use('/friends', friendRoutes);
router.use('/activities', activityRoutes);

module.exports = router;