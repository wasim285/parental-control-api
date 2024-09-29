// Load environment variables
require('dotenv').config();

// Import necessary packages
const express = require('express');
const cors = require('cors');

// Import custom routes
const authRoutes = require('./routes/auth');           // User authentication routes
const screenTimeRoutes = require('./routes/screenTime'); // Screen time management routes
const contentRoutes = require('./routes/content');     // Content restrictions routes
const reportRoutes = require('./routes/reports');      // Report routes

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 4000;

// Middleware to parse incoming JSON requests
app.use(express.json());

// Enable CORS for all routes
app.use(cors());

// Root route to verify server status
app.get('/', (req, res) => {
    res.send('Server is running!');
});

// Mount custom routes with log messages
console.log('Mounting authentication routes...');
app.use('/api/auth', authRoutes);  // Authentication routes

console.log('Mounting screen time management routes...');
app.use('/api/screen-time', screenTimeRoutes);  // Screen time management routes

console.log('Mounting content restrictions routes...');
app.use('/api/content', contentRoutes);  // Content restrictions management routes

console.log('Mounting report routes...');
app.use('/api/reports', reportRoutes);  // Report routes

// Error handling middleware for invalid routes
app.use((req, res) => {
    res.status(404).json({ message: 'Route not found' });
});

// Error handling middleware for server errors
app.use((err, req, res, next) => {
    console.error('Server Error:', err);
    res.status(500).json({ message: 'An unexpected error occurred.' });
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
