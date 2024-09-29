const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../config/db');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware'); // Import the middleware

// User Registration Route
router.post('/register', async (req, res) => {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({ message: "Username and password are required." });
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Insert the new user into the database
        await pool.query("INSERT INTO users (username, password) VALUES (?, ?)", [username, hashedPassword]);
        res.status(201).json({ message: 'User registered successfully!' });
    } catch (error) {
        console.error('Error occurred during user registration:', error);
        res.status(500).json({ message: 'Error registering user.' });
    }
});

// User Login Route
router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({ message: "Username and password are required." });
        }

        // Check if user exists
        const [results] = await pool.query("SELECT * FROM users WHERE username = ?", [username]);
        if (results.length === 0) {
            return res.status(401).json({ message: 'Invalid username or password.' });
        }

        const user = results[0];
        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid username or password.' });
        }

        // Create a JWT token
        const token = jwt.sign({ id: user.id, username: user.username }, process.env.JWT_SECRET, { expiresIn: '1h' });
        res.json({ token });
    } catch (error) {
        console.error('Error occurred during login:', error);
        res.status(500).json({ message: 'Error logging in.' });
    }
});

// User Profile Route - Protected by Middleware
router.get('/profile', authMiddleware, (req, res) => {
    try {
        console.log('Profile accessed by:', req.user); // Debug statement
        res.status(200).json({
            message: `Welcome, ${req.user.username}!`,
            userId: req.user.id
        });
    } catch (error) {
        console.error('Error accessing profile:', error);
        res.status(500).json({ message: 'Error retrieving profile.' });
    }
});

module.exports = router;
