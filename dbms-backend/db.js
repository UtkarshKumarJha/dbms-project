const mysql = require('mysql2');
require('dotenv').config();

const db = mysql.createConnection({
    host: process.env.DB_HOST, // e.g., 'localhost'
    user: process.env.DB_USER, // e.g., 'root'
    password: process.env.DB_PASSWORD, // e.g., 'password'
    database: process.env.DB_NAME // e.g., 'mydatabase'
});

db.connect(err => {
    if (err) {
        console.error('Database connection failed:', err);
    } else {
        console.log('Connected to MySQL database');
    }
});

module.exports = db.promise();
