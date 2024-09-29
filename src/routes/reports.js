const express = require('express');
const pool = require('../config/db');
const authMiddleware = require('../middleware/authMiddleware');
const router = express.Router();

// Get report for a user
router.get('/user/:id', authMiddleware, async (req, res) => {
    try {
        const userId = req.params.id;

        // Get screen time logs
        const [screenTimeLogs] = await pool.query(
            "SELECT * FROM screen_time_logs WHERE user_id = ?",
            [userId]
        );

        // Get content restrictions
        const [contentRestrictions] = await pool.query(
            "SELECT * FROM content_restrictions WHERE user_id = ?",
            [userId]
        );

        // Calculate screen time durations
        let totalDuration = 0;
        const dailyDurations = {};

        screenTimeLogs.forEach(log => {
            if (log.end_time) {
                const start = new Date(log.start_time);
                const end = new Date(log.end_time);
                const duration = (end - start) / (1000 * 60); // Duration in minutes

                totalDuration += duration;

                const day = start.toISOString().split('T')[0];
                if (!dailyDurations[day]) {
                    dailyDurations[day] = 0;
                }
                dailyDurations[day] += duration;
            }
        });

        // Check for daily limit violations
        const [screenTimeLimits] = await pool.query(
            "SELECT * FROM screen_time_limits WHERE user_id = ?",
            [userId]
        );

        const violations = [];
        screenTimeLimits.forEach(limit => {
            const day = limit.start_time.toISOString().split('T')[0];
            if (dailyDurations[day] && dailyDurations[day] > limit.daily_limit) {
                violations.push({
                    day,
                    limit: limit.daily_limit,
                    used: dailyDurations[day]
                });
            }
        });

        // Generate the report
        const report = {
            screenTimeLogs,
            contentRestrictions,
            totalDuration,
            dailyDurations,
            averageDailyTime: totalDuration / Object.keys(dailyDurations).length || 0,
            violations
        };

        res.status(200).json(report);
    } catch (error) {
        console.error('Error generating report:', error);
        res.status(500).json({ message: 'Error generating report.' });
    }
});

module.exports = router;
