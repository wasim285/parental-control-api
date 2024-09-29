const mysql = require('mysql2');

// Set up a MySQL pool connection
const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
});

// Export a promise-based pool
module.exports = pool.promise();
