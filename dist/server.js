"use strict";

var _excluded = ["password"],
  _excluded2 = ["password"];
function _objectWithoutProperties(e, t) { if (null == e) return {}; var o, r, i = _objectWithoutPropertiesLoose(e, t); if (Object.getOwnPropertySymbols) { var n = Object.getOwnPropertySymbols(e); for (r = 0; r < n.length; r++) o = n[r], -1 === t.indexOf(o) && {}.propertyIsEnumerable.call(e, o) && (i[o] = e[o]); } return i; }
function _objectWithoutPropertiesLoose(r, e) { if (null == r) return {}; var t = {}; for (var n in r) if ({}.hasOwnProperty.call(r, n)) { if (-1 !== e.indexOf(n)) continue; t[n] = r[n]; } return t; }
// Marcelo Parsotam u22491717 Pos7 
var express = require("express");
var path = require("path");
var app = express();
var PORT = 3000;

// Middleware
app.use(express.json());
app.use(express["static"](path.join(__dirname, "../public")));

// Stubbed user data (simulating a database)
var users = [{
  id: 1,
  name: 'John',
  surname: 'Doe',
  username: 'johndoe',
  email: 'john@example.com',
  password: 'password123' // In real app, this would be hashed
}];

// Authentication Endpoints

// POST /api/auth/register - User registration
app.post('/api/auth/register', function (req, res) {
  console.log('Register endpoint hit:', req.body);
  var _req$body = req.body,
    name = _req$body.name,
    surname = _req$body.surname,
    username = _req$body.username,
    email = _req$body.email,
    password = _req$body.password,
    confirmPassword = _req$body.confirmPassword;

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
  var existingUser = users.find(function (user) {
    return user.email === email || user.username === username;
  });
  if (existingUser) {
    return res.status(409).json({
      success: false,
      message: 'User already exists with this email or username'
    });
  }

  // Create new user (in real app, this would save to database)
  var newUser = {
    id: users.length + 1,
    name: name,
    surname: surname,
    username: username,
    email: email,
    password: password // In real app, hash this password!
  };
  users.push(newUser);

  // Return success response with user data (excluding password)
  var _ = newUser.password,
    userWithoutPassword = _objectWithoutProperties(newUser, _excluded);
  res.status(201).json({
    success: true,
    message: 'User registered successfully',
    user: userWithoutPassword,
    token: 'stubbed-jwt-token-' + Date.now() // Mock JWT token
  });
});

// POST /api/auth/login - User login
app.post('/api/auth/login', function (req, res) {
  console.log('Login endpoint hit:', req.body);
  var _req$body2 = req.body,
    email = _req$body2.email,
    password = _req$body2.password;

  // Basic validation
  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: 'Email and password are required'
    });
  }

  // Find user (in real app, this would query database)
  var user = users.find(function (user) {
    return user.email === email;
  });
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
  var _ = user.password,
    userWithoutPassword = _objectWithoutProperties(user, _excluded2);
  res.json({
    success: true,
    message: 'Login successful',
    user: userWithoutPassword,
    token: 'stubbed-jwt-token-' + Date.now() // Mock JWT token
  });
});

// GET /api/auth/me - Get current user (protected route example)
app.get('/api/auth/me', function (req, res) {
  // In real app, you'd verify JWT token from headers
  var authHeader = req.headers.authorization;
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
app.get('/{*any}', function (req, res) {
  return res.sendFile(path.resolve('public', 'index.html'));
});
app.listen(PORT, function () {
  console.log("Server running at http://localhost:".concat(PORT));
});