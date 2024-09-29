const express = require('express');
const pool = require('../config/db');
const authMiddleware = require('../middleware/authMiddleware');
const router = express.Router();

// Start a new screen time session
router.post('/start', authMiddleware, async (req, res) => {
    try {
        const userId = req.user.id;

        // Insert a new screen time log for the user
        await pool.query(
            "INSERT INTO screen_time_logs (user_id, start_time) VALUES (?, NOW())",
            [userId]
        );
        res.status(201).json({ message: 'Screen time session started successfully!' });
    } catch (error) {
        console.error('Error starting screen time session:', error);
        res.status(500).json({ message: 'Error starting screen time session.' });
    }
});

// Stop an ongoing screen time session
router.post('/stop', authMiddleware, async (req, res) => {
    try {
        const userId = req.user.id;

        // Update the end time for the ongoing session
        const [results] = await pool.query(
            "UPDATE screen_time_logs SET end_time = NOW() WHERE user_id = ? AND end_time IS NULL",
            [userId]
        );

        if (results.affectedRows === 0) {
            return res.status(404).json({ message: 'No ongoing screen time session found.' });
        }

        res.status(200).json({ message: 'Screen time session stopped successfully!' });
    } catch (error) {
        console.error('Error stopping screen time session:', error);
        res.status(500).json({ message: 'Error stopping screen time session.' });
    }
});

// Get the screen time limit for the current user
router.get('/get', authMiddleware, async (req, res) => {
    try {
        const userId = req.user.id;

        const [results] = await pool.query("SELECT * FROM screen_time_limits WHERE user_id = ?", [userId]);
        if (results.length === 0) {
            return res.status(404).json({ message: 'No screen time limit set for this user.' });
        }

        res.status(200).json(results[0]);
    } catch (error) {
        console.error('Error retrieving screen time limit:', error);
        res.status(500).json({ message: 'Error retrieving screen time limit.' });
    }
});

// Get all screen time logs for the current user
router.get('/logs', authMiddleware, async (req, res) => {
    try {
        const userId = req.user.id;

        // Fetch all screen time logs for the user
        const [logs] = await pool.query(
            "SELECT id, user_id, start_time, end_time, TIMESTAMPDIFF(MINUTE, start_time, end_time) AS duration FROM screen_time_logs WHERE user_id = ?",
            [userId]
        );

        res.status(200).json(logs);
    } catch (error) {
        console.error('Error retrieving screen time logs:', error);
        res.status(500).json({ message: 'Error retrieving screen time logs.' });
    }
});

// Set a screen time limit for the user
router.post('/set', authMiddleware, async (req, res) => {
    try {
        const { dailyLimit, startTime, endTime } = req.body;
        const userId = req.user.id;

        if (!dailyLimit) {
            return res.status(400).json({ message: "Daily limit is required." });
        }

        // Insert a new screen time limit for the user
        await pool.query(
            "INSERT INTO screen_time_limits (user_id, daily_limit, start_time, end_time) VALUES (?, ?, ?, ?)",
            [userId, dailyLimit, startTime, endTime]
        );
        res.status(201).json({ message: 'Screen time limit set successfully!' });
    } catch (error) {
        console.error('Error setting screen time limit:', error);
        res.status(500).json({ message: 'Error setting screen time limit.' });
    }
});

// Update the screen time limit for the current user
router.put('/update', authMiddleware, async (req, res) => {
    try {
        const { dailyLimit, startTime, endTime } = req.body;
        const userId = req.user.id;

        const [results] = await pool.query(
            "UPDATE screen_time_limits SET daily_limit = ?, start_time = ?, end_time = ? WHERE user_id = ?",
            [dailyLimit, startTime, endTime, userId]
        );

        if (results.affectedRows === 0) {
            return res.status(404).json({ message: 'No screen time limit set for this user.' });
        }

        res.status(200).json({ message: 'Screen time limit updated successfully!' });
    } catch (error) {
        console.error('Error updating screen time limit:', error);
        res.status(500).json({ message: 'Error updating screen time limit.' });
    }
});

// Get screen time report for current user
router.get('/report', authMiddleware, async (req, res) => {
    try {
        const userId = req.user.id;

        // Get the screen time logs
        const [logs] = await pool.query(
            "SELECT id, user_id, start_time, end_time, TIMESTAMPDIFF(MINUTE, start_time, end_time) AS duration FROM screen_time_logs WHERE user_id = ?",
            [userId]
        );

        // Calculate the total and daily averages
        let totalMinutes = 0;
        let dayMap = {};

        logs.forEach(log => {
            if (log.duration) {
                totalMinutes += log.duration;
                const day = log.start_time.toISOString().split('T')[0];
                dayMap[day] = (dayMap[day] || 0) + log.duration;
            }
        });

        const totalDays = Object.keys(dayMap).length;
        const averageDaily = totalDays > 0 ? totalMinutes / totalDays : 0;

        // Get user's daily limit
        const [limits] = await pool.query(
            "SELECT daily_limit FROM screen_time_limits WHERE user_id = ?",
            [userId]
        );

        let violations = [];
        if (limits.length > 0) {
            const dailyLimit = limits[0].daily_limit;
            for (const [day, minutes] of Object.entries(dayMap)) {
                if (minutes > dailyLimit) {
                    violations.push({ day, minutes, exceededBy: minutes - dailyLimit });
                }
            }
        }

        res.status(200).json({
            totalScreenTime: totalMinutes,
            averageDailyUsage: averageDaily,
            violations,
            logs
        });
    } catch (error) {
        console.error('Error retrieving screen time report:', error);
        res.status(500).json({ message: 'Error retrieving screen time report.' });
    }
});

module.exports = router;
