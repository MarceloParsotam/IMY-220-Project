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

// Import routes
const routes = require('./routes');
app.use('/api', routes);
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({
        success: true,
        message: 'Server is running',
        timestamp: new Date().toISOString()
    });
});

// Catch-all route for SPA
app.get('/{*any}', (req, res) => res.sendFile(path.resolve('public', 'index.html')));

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});