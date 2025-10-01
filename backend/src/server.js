// Marcelo Parsotam u22491717 Pos7 
const express = require("express");
const path = require("path");
const viewDocDB = require("./viewDocDB"); // Import your database module

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
            friendRequests: []
        };

        const result = await usersCollection.insertOne(newUser);

        // Return success response with user data (excluding password)
        const { password: _, ...userWithoutPassword } = newUser;
        
        res.status(201).json({
            success: true,
            message: 'User registered successfully',
            user: { ...userWithoutPassword, _id: result.insertedId },
            token: 'stubbed-jwt-token-' + Date.now()
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
            token: 'stubbed-jwt-token-' + Date.now() 
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});

app.get('/{*any}', (req, res) => res.sendFile(path.resolve('public', 'index.html')));

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});