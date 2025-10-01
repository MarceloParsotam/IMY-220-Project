// backend/viewDocDB.js
const { MongoClient } = require('mongodb');

const MONGODB_URI = "mongodb+srv://test-user:test-password@imy220.44tnuyp.mongodb.net/ViewDocDB?retryWrites=true&w=majority&appName=IMY220";

let db = null;
let client = null;

async function connectToDatabase() {
    if (db) {
        return db; // Return existing connection if already connected
    }

    client = new MongoClient(MONGODB_URI);
    
    try {
        await client.connect();
        console.log('Connected to MongoDB Atlas successfully!');
        
        db = client.db(); // Gets the ViewDocDB database
        
        // Test connection by listing collections
        const collections = await db.listCollections().toArray();
        console.log('Collections:', collections.map(c => c.name));
        
        return db;
    } catch (error) {
        console.error('MongoDB Connection failed:', error);
        throw error;
    }
}

function getDatabase() {
    if (!db) {
        throw new Error('Database not connected. Call connectToDatabase() first.');
    }
    return db;
}

function getCollection(collectionName) {
    return getDatabase().collection(collectionName);
}

// Close database connection
async function closeConnection() {
    if (client) {
        await client.close();
        db = null;
        client = null;
        console.log('Database connection closed');
    }
}

module.exports = {
    connectToDatabase,
    getDatabase,
    getCollection,
    closeConnection
};