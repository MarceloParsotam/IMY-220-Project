const { ObjectId } = require('mongodb');
const viewDocDB = require('../viewDocDB');

// Middleware to check authentication from localStorage session
const authenticateUser = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        
        if (!authHeader) {
            return res.status(401).json({
                success: false,
                message: 'No authorization header'
            });
        }

        // Extract user ID from header (format: "Bearer userId")
        const userId = authHeader.replace('Bearer ', '').trim();
        
        if (!userId) {
            return res.status(401).json({
                success: false,
                message: 'Invalid authorization format'
            });
        }

        // Verify user exists
        const usersCollection = viewDocDB.getCollection('users');
        const user = await usersCollection.findOne({ 
            _id: new ObjectId(userId) 
        });

        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'User not found'
            });
        }

        // Add user to request
        req.user = user;
        next();
    } catch (error) {
        console.error('Authentication error:', error);
        res.status(401).json({
            success: false,
            message: 'Authentication failed'
        });
    }
};

module.exports = {
    authenticateUser
};