const express = require('express');
const pool = require('../config/db');
const authMiddleware = require('../middleware/authMiddleware');
const router = express.Router();

// Add a content restriction
router.post('/add', authMiddleware, async (req, res) => {
    try {
        const { url } = req.body;
        const userId = req.user.id;

        if (!url) {
            return res.status(400).json({ message: "URL is required." });
        }

        await pool.query("INSERT INTO content_restrictions (user_id, url) VALUES (?, ?)", [userId, url]);
        res.status(201).json({ message: 'Content restriction added successfully!' });
    } catch (error) {
        console.error('Error adding content restriction:', error);
        res.status(500).json({ message: 'Error adding content restriction.' });
    }
});

// Get content restrictions for a user
router.get('/list', authMiddleware, async (req, res) => {
    try {
        const userId = req.user.id;
        const [results] = await pool.query("SELECT * FROM content_restrictions WHERE user_id = ?", [userId]);
        res.status(200).json(results);
    } catch (error) {
        console.error('Error retrieving content restrictions:', error);
        res.status(500).json({ message: 'Error retrieving content restrictions.' });
    }
});

// Delete a content restriction
router.delete('/remove/:id', authMiddleware, async (req, res) => {
    try {
        const restrictionId = req.params.id;
        const userId = req.user.id;

        console.log('Attempting to delete restriction with ID:', restrictionId); // Debug log
        console.log('For user with ID:', userId); // Debug log

        const [results] = await pool.query("DELETE FROM content_restrictions WHERE id = ? AND user_id = ?", [restrictionId, userId]);
        
        if (results.affectedRows === 0) {
            return res.status(404).json({ message: 'Content restriction not found.' });
        }

        res.status(200).json({ message: 'Content restriction removed successfully!' });
    } catch (error) {
        console.error('Error removing content restriction:', error);
        res.status(500).json({ message: 'Error removing content restriction.' });
    }
});

module.exports = router;
