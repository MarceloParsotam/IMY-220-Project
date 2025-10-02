const express = require('express');
const router = express.Router();
const { ObjectId } = require('mongodb');
const viewDocDB = require('../viewDocDB');

// POST /api/auth/register - User registration
router.post('/register', async (req, res) => {
    console.log('Register endpoint hit:', req.body);
    
    const { name, surname, username, email, password, confirmPassword } = req.body;

    // Basic validation
    if (!name || !surname || !username || !email || !password || !confirmPassword) {
        return res.status(400).json({
            success: false,
            message: 'All fields are required'
        });
    }

    if (password !== confirmPassword) {
        return res.status(400).json({
            success: false,
            message: 'Passwords do not match'
        });
    }

    try {
        const usersCollection = viewDocDB.getCollection('users');
        
        // Check if user already exists in database
        const existingUser = await usersCollection.findOne({
            $or: [{ email }, { username }]
        });

        if (existingUser) {
            return res.status(409).json({
                success: false,
                message: 'User already exists with this email or username'
            });
        }

        // Create new user in database
        const newUser = {
            name,
            surname,
            username,
            email,
            password, // In real app, hash this password!
            joinedDate: new Date(),
            skills: [],
            friends: [],
            friendRequests: [],
            removedFriends: [],
            about: "No about information available",
            bio: "No bio available",
            avatar: null
        };

        const result = await usersCollection.insertOne(newUser);

        // Return success response with user data (excluding password)
        const { password: _, ...userWithoutPassword } = newUser;
        
        res.status(201).json({
            success: true,
            message: 'User registered successfully',
            user: { ...userWithoutPassword, _id: result.insertedId },
            userId: result.insertedId.toString()
        });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});

// POST /api/auth/login - User login
router.post('/login', async (req, res) => {
    console.log('Login endpoint hit:', req.body);
    
    const { email, password } = req.body;

    // Basic validation
    if (!email || !password) {
        return res.status(400).json({
            success: false,
            message: 'Email and password are required'
        });
    }

    try {
        const usersCollection = viewDocDB.getCollection('users');
        
        // Find user in database
        const user = await usersCollection.findOne({ email });

        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        // Check password (in real app, this would compare hashed passwords)
        if (user.password !== password) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        // Return success response with user data (excluding password)
        const { password: _, ...userWithoutPassword } = user;
        
        res.json({
            success: true,
            message: 'Login successful',
            user: userWithoutPassword,
            userId: user._id.toString()
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});

// POST /api/auth/logout - User logout
router.post('/logout', (req, res) => {
    // Since we're using localStorage sessions, logout is handled on the client side
    res.json({
        success: true,
        message: 'Logout successful'
    });
});

module.exports = router;