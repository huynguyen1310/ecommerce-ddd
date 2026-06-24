const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const { Pool } = require('pg');
require('dotenv').config();

const { PgUserRepository } = require('./infrastructure/persistence/pg-user.repository');
const { JwtProvider } = require('./infrastructure/auth/jwt.provider');
const { RegisterUseCase } = require('./application/register.use-case');
const { LoginUseCase } = require('./application/login.use-case');
const { AuthController } = require('./interface/auth.controller');
const jwt = require('jsonwebtoken');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const userRepository = new PgUserRepository(pool);
const jwtProvider = new JwtProvider(process.env.JWT_SECRET || 'secret');
const registerUseCase = new RegisterUseCase(userRepository);
const loginUseCase = new LoginUseCase(userRepository, jwtProvider);
const authController = new AuthController(registerUseCase, loginUseCase);

const app = express();
app.use(cors());
app.use(express.json());

app.post('/register', (req, res) => authController.register(req, res));
app.post('/login', (req, res) => authController.login(req, res));
app.get('/users', async (req, res) => {
  try {
    const users = await userRepository.findAll();
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

const authMiddleware = (req, res, next) => {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) return res.status(401).json({ error: 'Unauthorized' });
  try {
    req.user = jwt.verify(header.split(' ')[1], process.env.JWT_SECRET || 'secret');
    next();
  } catch { res.status(401).json({ error: 'Invalid token' }); }
};

app.post('/become-vendor', authMiddleware, async (req, res) => {
  try {
    const user = await userRepository.findById(req.user.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    if (user.role !== 'customer') return res.status(400).json({ error: `Already a ${user.role}` });
    await userRepository.updateRole(user.id, 'vendor');
    res.json({ id: user.id, email: user.email, role: 'vendor' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to become vendor' });
  }
});

const VENDORS = [
  { id: 'a1b2c3d4-e5f6-4789-abcd-ef1234567890', email: 'vendor1@example.com', name: 'Shop One' },
  { id: 'b2c3d4e5-f6a7-4890-bcde-f12345678901', email: 'vendor2@example.com', name: 'Shop Two' },
  { id: 'c3d4e5f6-a7b8-4901-cdef-123456789012', email: 'vendor3@example.com', name: 'Shop Three' },
];

const initDb = async (retries = 5) => {
  try {
    await userRepository.init();

    const adminEmail = 'admin@example.com';
    const existingAdmin = await userRepository.findByEmail(adminEmail);
    if (!existingAdmin) {
      const { User } = require('./domain/user.entity');
      const hashedPassword = await bcrypt.hash('admin', 10);
      const admin = new User(null, adminEmail, hashedPassword, 'admin');
      await userRepository.save(admin);
      console.log('Default admin user created (admin@example.com / admin)');
    }

    for (const v of VENDORS) {
      const existing = await userRepository.findByEmail(v.email);
      if (!existing) {
        const { User } = require('./domain/user.entity');
        const hashedPassword = await bcrypt.hash('password', 10);
        const user = new User(v.id, v.email, hashedPassword, 'vendor');
        await userRepository.save(user);
        console.log(`Vendor user created (${v.email} / password)`);
      }
    }
  } catch (err) {
    if (retries === 0) {
      console.error('Database initialization failed:', err.message);
      return;
    }
    console.log(`DB connection failed, retrying in 5s... (${retries} retries left)`);
    setTimeout(() => initDb(retries - 1), 5000);
  }
};

initDb();

const PORT = process.env.PORT || 3002;
app.listen(PORT, () => console.log(`Identity service running on port ${PORT}`));
