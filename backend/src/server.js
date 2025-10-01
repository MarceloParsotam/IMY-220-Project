// Marcelo Parsotam u22491717 Pos7 
const express = require("express");
const path = require("path");
const viewDocDB = require("./viewDocDB"); // Import your database module
const { ObjectId } = require('mongodb');
const multer = require('multer');

const app = express();
const PORT = 3000;

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, "../public")));

// Initialize database connection
viewDocDB.connectToDatabase().then(() => {
    console.log("ViewDocDB initialized successfully");
}).catch(error => {
    console.error("Failed to initialize ViewDocDB:", error);
});

// Session storage simulation (in production, use proper sessions)
const activeSessions = new Map();

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

// Test MongoDB Route
app.get('/api/test-db', async (req, res) => {
    try {
        const db = viewDocDB.getDatabase();
        
        // Test by listing collections
        const collections = await db.listCollections().toArray();
        const collectionNames = collections.map(c => c.name);

        res.json({
            success: true,
            message: 'ViewDocDB connection successful!',
            collections: collectionNames,
            database: db.databaseName
        });
    } catch (error) {
        console.error('Database test error:', error);
        res.status(500).json({
            success: false,
            message: 'ViewDocDB test failed',
            error: error.message
        });
    }
});

// Updated Authentication Endpoints using viewDocDB

// POST /api/auth/register - User registration
app.post('/api/auth/register', async (req, res) => {
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
            about: "No about information available",
            bio: "No bio available",
            avatar: null // Start with no avatar
        };

        const result = await usersCollection.insertOne(newUser);

        // Return success response with user data (excluding password)
        const { password: _, ...userWithoutPassword } = newUser;
        
        res.status(201).json({
            success: true,
            message: 'User registered successfully',
            user: { ...userWithoutPassword, _id: result.insertedId },
            // Return user ID for localStorage session
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
app.post('/api/auth/login', async (req, res) => {
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
            // Return user ID for localStorage session
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

// AVATAR ENDPOINTS

// PUT /api/users/:userId/avatar - Update user avatar (store binary in MongoDB)
app.put('/api/users/:userId/avatar', authenticateUser, upload.single('avatar'), async (req, res) => {
  try {
    const { userId } = req.params;

    // Check if user is updating their own profile
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

    // Prepare the avatar object for MongoDB binary storage
    const avatarData = {
      data: req.file.buffer, // The actual binary image data
      contentType: req.file.mimetype,
      filename: req.file.originalname,
      uploadedAt: new Date(),
      size: req.file.size
    };

    // Update user's avatar in database
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

// GET /api/users/:userId/avatar - Get user avatar image from MongoDB
app.get('/api/users/:userId/avatar', async (req, res) => {
  try {
    const { userId } = req.params;
    const usersCollection = viewDocDB.getCollection('users');

    // Find user and only return avatar field
    const user = await usersCollection.findOne(
      { _id: new ObjectId(userId) },
      { projection: { avatar: 1 } }
    );

    if (!user || !user.avatar || !user.avatar.data) {
      // Return default avatar if no avatar exists
      return res.redirect('/default-avatar.png');
    }

    // Convert the binary data to Buffer if it's not already
    let imageBuffer;
    if (Buffer.isBuffer(user.avatar.data)) {
      imageBuffer = user.avatar.data;
    } else if (user.avatar.data.buffer) {
      // Handle Binary data from MongoDB
      imageBuffer = Buffer.from(user.avatar.data.buffer);
    } else if (typeof user.avatar.data === 'string') {
      // Handle base64 string
      imageBuffer = Buffer.from(user.avatar.data, 'base64');
    } else {
      throw new Error('Unsupported avatar data format');
    }

    // Set appropriate headers and send the binary data
    res.set('Content-Type', user.avatar.contentType || 'image/jpeg');
    res.set('Cache-Control', 'public, max-age=3600'); // Cache for 1 hour
    
    // Only set Content-Length if we have a valid buffer
    if (imageBuffer && imageBuffer.length) {
      res.set('Content-Length', imageBuffer.length);
    }
    
    res.send(imageBuffer);

  } catch (error) {
    console.error('Error fetching avatar:', error);
    res.redirect('/default-avatar.png');
  }
});

// PROFILE ENDPOINTS

// GET /api/users/:userId - Get user profile data with all related data
app.get('/api/users/:userId', authenticateUser, async (req, res) => {
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

        // Get user's activities (from checkins or activity collection)
        const activitiesCollection = viewDocDB.getCollection('activities');
        const checkinsCollection = viewDocDB.getCollection('checkins');
        
        let userActivities = [];
        let userCheckins = [];

        // Try to get activities first, fallback to checkins
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

        // If no activities, use checkins
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

        // Transform projects data for frontend
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

        // Transform activities data for frontend
        const transformedActivities = userActivities.map(activity => ({
            id: activity._id,
            title: activity.title || `Activity on ${new Date(activity.date).toLocaleDateString()}`,
            description: activity.description || `Completed ${activity.type || 'task'}`,
            date: activity.date,
            type: activity.type
        }));

        // Transform checkins to activities if no activities exist
        const checkinActivities = userCheckins.map(checkin => ({
            id: checkin._id,
            title: `Check-in at ${checkin.location || 'Unknown Location'}`,
            description: checkin.notes || `Checked in on ${new Date(checkin.checkinDate).toLocaleDateString()}`,
            date: checkin.checkinDate,
            type: 'checkin'
        }));

        // Combine activities and checkins
        const allActivities = [...transformedActivities, ...checkinActivities]
            .sort((a, b) => new Date(b.date) - new Date(a.date))
            .slice(0, 10);

        // Transform friends data for frontend
        const transformedFriends = userFriends.map(friend => ({
            id: friend._id,
            name: `${friend.name} ${friend.surname}`,
            // Use avatar endpoint for friends' avatars too
            avatar: (friend.avatar && friend.avatar.data) ? 
                `http://localhost:3000/api/users/${friend._id}/avatar` : 
                '/default-avatar.png',
            title: friend.bio || 'Developer'
        }));

        // Generate avatar URL - use our endpoint if avatar exists in binary form
        const avatarUrl = (user.avatar && user.avatar.data) ? 
            `http://localhost:3000/api/users/${user._id}/avatar` : 
            '/default-avatar.png';

        // Return user data in format expected by frontend
        const userResponse = {
            _id: user._id,
            name: user.name,
            surname: user.surname,
            username: user.username,
            email: user.email,
            avatar: avatarUrl,
            avatars: [avatarUrl],
            bio: user.bio || 'No bio available',
            description: user.bio || 'No bio available', // For ProfileHeader
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
app.put('/api/users/:userId', authenticateUser, async (req, res) => {
    try {
        const { userId } = req.params;
        const { name, surname, bio, about, skills } = req.body;

        // Check if user is updating their own profile
        if (req.user._id.toString() !== userId) {
            return res.status(403).json({
                success: false,
                message: 'You can only update your own profile'
            });
        }

        const usersCollection = viewDocDB.getCollection('users');

        // Update user data
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

        // Get updated user data
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

// PROJECT ENDPOINTS

// POST /api/projects - Create new project
app.post('/api/projects', authenticateUser, async (req, res) => {
    try {
        const { name, description, type, tags, isPublic } = req.body;
        const userId = req.user._id;

        // Basic validation
        if (!name || !description) {
            return res.status(400).json({
                success: false,
                message: 'Project name and description are required'
            });
        }

        const projectsCollection = viewDocDB.getCollection('projects');

        // Create new project
        const newProject = {
            name,
            description,
            type: type || 'Web Application',
            tags: tags || [],
            isPublic: isPublic !== undefined ? isPublic : true,
            userId: new ObjectId(userId),
            createdAt: new Date(),
            updatedAt: new Date(),
            status: 'active'
        };

        const result = await projectsCollection.insertOne(newProject);

        // Also create an activity for the new project
        try {
            const activitiesCollection = viewDocDB.getCollection('activities');
            await activitiesCollection.insertOne({
                userId: new ObjectId(userId),
                type: 'project_created',
                title: 'Created New Project',
                description: `Created project: ${name}`,
                date: new Date(),
                projectId: result.insertedId
            });
        } catch (activityError) {
            console.log('Could not create activity record:', activityError);
        }

        res.status(201).json({
            success: true,
            message: 'Project created successfully',
            project: {
                _id: result.insertedId,
                ...newProject
            }
        });
    } catch (error) {
        console.error('Error creating project:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create project'
        });
    }
});

// GET /api/projects/user/:userId - Get user's projects
app.get('/api/projects/user/:userId', authenticateUser, async (req, res) => {
    try {
        const { userId } = req.params;
        const projectsCollection = viewDocDB.getCollection('projects');

        const projects = await projectsCollection.find({ 
            userId: new ObjectId(userId) 
        })
        .sort({ createdAt: -1 })
        .toArray();

        // Transform projects for frontend
        const transformedProjects = projects.map(project => ({
            id: project._id,
            initials: project.name.substring(0, 2).toUpperCase(),
            title: project.name,
            description: project.description,
            type: project.type,
            tags: project.tags || []
        }));

        res.json(transformedProjects);
    } catch (error) {
        console.error('Error fetching projects:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch projects'
        });
    }
});

// ACTIVITY ENDPOINTS

// POST /api/activities - Create new activity
app.post('/api/activities', authenticateUser, async (req, res) => {
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

// CHECKIN ENDPOINTS

// POST /api/checkins - Create new checkin
app.post('/api/checkins', authenticateUser, async (req, res) => {
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

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({
        success: true,
        message: 'Server is running',
        timestamp: new Date().toISOString()
    });
});

app.get('/{*any}', (req, res) => res.sendFile(path.resolve('public', 'index.html')));

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});