const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
    const authHeader = req.header('Authorization');
    console.log('Auth Header:', authHeader); // Debug log

    if (!authHeader) {
        console.log('No Authorization header found');
        return res.status(401).json({ message: 'Access denied. No token provided.' });
    }

    // Extract the token
    const token = authHeader.split(' ')[1];
    console.log('Extracted Token:', token); // Debug log

    if (!token) {
        return res.status(401).json({ message: 'Access denied. No token provided.' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        console.log('Decoded User:', decoded); // Debug log to verify successful decoding
        req.user = decoded;
        next();
    } catch (error) {
        console.error('Token verification failed:', error); // Debug log
        res.status(400).json({ message: 'Invalid token.' });
    }
};
