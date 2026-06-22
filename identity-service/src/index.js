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

const initDb = async (retries = 5) => {
  try {
    await userRepository.init();

    const adminEmail = 'admin@example.com';
    const existing = await userRepository.findByEmail(adminEmail);
    if (!existing) {
      const hashedPassword = await bcrypt.hash('admin', 10);
      const { User } = require('./domain/user.entity');
      const admin = new User(null, adminEmail, hashedPassword, 'admin');
      await userRepository.save(admin);
      console.log('Default admin user created (admin@example.com / admin)');
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
