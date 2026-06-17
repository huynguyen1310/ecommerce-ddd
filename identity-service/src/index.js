const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { Pool } = require('pg');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const JWT_SECRET = process.env.JWT_SECRET || 'secret';

// Initialize DB with retries
const initDb = async (retries = 5) => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        role TEXT DEFAULT 'customer'
      );
    `);
    console.log('Database initialized successfully');
    
    // Seed default admin
    const adminEmail = 'admin@example.com';
    const checkAdmin = await pool.query('SELECT * FROM users WHERE email = $1', [adminEmail]);
    if (checkAdmin.rows.length === 0) {
      const hashedPassword = await bcrypt.hash('admin', 10);
      await pool.query(
        'INSERT INTO users (email, password, role) VALUES ($1, $2, $3)',
        [adminEmail, hashedPassword, 'admin']
      );
      console.log('Default admin user created (admin@example.com / admin)');
    }
  } catch (err) {
    if (retries === 0) {
      console.error('Database initialization failed after multiple retries:', err.message);
      return;
    }
    console.log(`Database connection failed, retrying in 5 seconds... (${retries} retries left)`);
    setTimeout(() => initDb(retries - 1), 5000);
  }
};
initDb();

app.post('/register', async (req, res) => {
  const { email, password } = req.body;
  console.log(`Attempting to register user: ${email}`);
  const hashedPassword = await bcrypt.hash(password, 10);
  try {
    const result = await pool.query(
      'INSERT INTO users (email, password) VALUES ($1, $2) RETURNING id, email, role',
      [email, hashedPassword]
    );
    console.log(`User registered successfully: ${email}`);
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Registration error:', err.message);
    if (err.code === '23505') { // Unique violation
      return res.status(400).json({ error: 'User already exists' });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
  const user = result.rows[0];
  if (user && await bcrypt.compare(password, user.password)) {
    const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET);
    res.json({ token, user: { id: user.id, email: user.email, role: user.role } });
  } else {
    res.status(401).json({ error: 'Invalid credentials' });
  }
});

const PORT = process.env.PORT || 3002;
app.listen(PORT, () => console.log(`Identity service running on port ${PORT}`));
