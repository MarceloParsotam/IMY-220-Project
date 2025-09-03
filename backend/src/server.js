// Marcelo Parsotam u22491717 Pos7 
const express = require("express");
const path = require("path");
const app = express();
const PORT = 3000;

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, "../public")));

// Stubbed user data (simulating a database)
const users = [
  {
    id: 1,
    name: 'John',
    surname: 'Doe',
    username: 'johndoe',
    email: 'john@example.com',
    password: 'password123' // In real app, this would be hashed
  }
];

// Authentication Endpoints

// POST /api/auth/register - User registration
app.post('/api/auth/register', (req, res) => {
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

  // Check if user already exists
  const existingUser = users.find(user => 
    user.email === email || user.username === username
  );

  if (existingUser) {
    return res.status(409).json({
      success: false,
      message: 'User already exists with this email or username'
    });
  }

  // Create new user (in real app, this would save to database)
  const newUser = {
    id: users.length + 1,
    name,
    surname,
    username,
    email,
    password // In real app, hash this password!
  };

  users.push(newUser);

  // Return success response with user data (excluding password)
  const { password: _, ...userWithoutPassword } = newUser;
  
  res.status(201).json({
    success: true,
    message: 'User registered successfully',
    user: userWithoutPassword,
    token: 'stubbed-jwt-token-' + Date.now() // Mock JWT token
  });
});

// POST /api/auth/login - User login
app.post('/api/auth/login', (req, res) => {
  console.log('Login endpoint hit:', req.body);
  
  const { email, password } = req.body;

  // Basic validation
  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: 'Email and password are required'
    });
  }

  // Find user (in real app, this would query database)
  const user = users.find(user => user.email === email);

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
    token: 'stubbed-jwt-token-' + Date.now() // Mock JWT token
  });
});

// GET /api/auth/me - Get current user (protected route example)
app.get('/api/auth/me', (req, res) => {
  // In real app, you'd verify JWT token from headers
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      message: 'Access token required'
    });
  }

  // Mock user data based on token
  // In real app, you'd decode JWT and get user from database
  res.json({
    success: true,
    user: {
      id: 1,
      name: 'John',
      surname: 'Doe',
      username: 'johndoe',
      email: 'john@example.com'
    }
  });
});

app.get('/{*any}',(req, res) => res.sendFile(path.resolve('public', 'index.html')));

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});

