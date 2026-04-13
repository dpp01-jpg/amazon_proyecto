require('dotenv').config();
const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

async function run() {
    try {
        // Create connection without db parameter to be able to create the database if it doesn't exist
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASS,
            multipleStatements: true
        });

        const sqlScript = fs.readFileSync(path.join(__dirname, '..', 'database.sql'), 'utf-8');
        
        console.log('Running database setup script...');
        await connection.query(sqlScript);
        console.log('Database initialized successfully.');
        
        await connection.end();
        process.exit(0);
    } catch (err) {
        console.error('Error initializing database:', err);
        process.exit(1);
    }
}

run();
