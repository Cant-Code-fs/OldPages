const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');

// Initialize Express
const app = express();
const PORT = 5000;

// Middleware
app.use(cors()); // Allow frontend requests
app.use(express.json()); // Parse JSON data

// Create a MySQL connection pool
const pool = mysql.createPool({
    host: 'localhost',
    user: 'root', // Replace with your MySQL username
    password: '123456', // Replace with your MySQL password
    database: 'used_books',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
});

// Basic route to test the server
app.get('/', (req, res) => {
    res.send('Used Books Marketplace Backend is running!');
});

// User registration endpoint
app.post('/api/register', async (req, res) => {
    const { name, email, password, role } = req.body;

    try {
        // Check if the user already exists
        const [existingUser] = await pool.promise().query(
            'SELECT * FROM users WHERE email = ?',
            [email]
        );

        if (existingUser.length > 0) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Insert the new user into the database
        const [result] = await pool.promise().query(
            'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
            [name, email, password, role]
        );

        res.status(201).json({ message: 'User registered successfully', userId: result.insertId });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
// Login endpoint
app.post('/api/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        // Check if the user exists
        const [user] = await pool.promise().query(
            'SELECT * FROM users WHERE email = ?',
            [email]
        );

        if (user.length === 0) {
            return res.status(400).json({ message: 'Invalid email or password' });
        }

        // Compare passwords (plain text for now)
        const storedPassword = user[0].password;
        if (password !== storedPassword) {
            return res.status(400).json({ message: 'Invalid email or password' });
        }

        // Return user data (excluding password)
        const userData = {
            id: user[0].id,
            name: user[0].name,
            email: user[0].email,
            role: user[0].role,
        };

        res.status(200).json({ message: 'Login successful', user: userData });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});