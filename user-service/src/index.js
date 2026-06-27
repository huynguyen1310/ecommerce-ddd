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
app.get('/users/:id/status', async (req, res) => {
  try {
    const user = await userRepository.findById(req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({ status: user.status });
  } catch { res.status(500).json({ error: 'Failed' }); }
});

app.get('/users', async (req, res) => {
  try {
    const users = await userRepository.findAll();
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

const authMiddleware = async (req, res, next) => {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) return res.status(401).json({ error: 'Unauthorized' });
  try {
    req.user = jwt.verify(header.split(' ')[1], process.env.JWT_SECRET || 'secret');
    const user = await userRepository.findById(req.user.id);
    if (!user || user.status === 'suspended') return res.status(403).json({ error: 'Account suspended' });
    next();
  } catch {
    res.status(401).json({ error: 'Invalid token' });
  }
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

app.get('/users/me', authMiddleware, async (req, res) => {
  try {
    const user = await userRepository.findById(req.user.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({ id: user.id, email: user.email, role: user.role, shopId: user.shopId });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

app.patch('/users/shop', authMiddleware, async (req, res) => {
  try {
    await userRepository.updateShopId(req.user.id, req.body.shopId);
    res.json({ success: true, shopId: req.body.shopId });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update shop' });
  }
});

// ─── Chat ─────────────────────────────────────────────────────────────────

app.get('/chat/unread-count', authMiddleware, async (req, res) => {
  try {
    const user = await userRepository.findById(req.user.id);
    if (!user) return res.status(401).json({ error: 'User not found. Try re-login.' });
    let count;
    if (user.role === 'vendor' && user.shopId) {
      const result = await pool.query(
        'SELECT COUNT(*) as cnt FROM chat_messages WHERE shop_id = $1 AND buyer_id != $2 AND NOT is_read',
        [user.shopId, req.user.id]
      );
      count = parseInt(result.rows[0].cnt, 10);
    } else {
      const result = await pool.query(
        'SELECT COUNT(*) as cnt FROM chat_messages WHERE shop_id IN (SELECT shop_id FROM chat_messages WHERE buyer_id = $1) AND buyer_id != $1 AND NOT is_read',
        [req.user.id]
      );
      count = parseInt(result.rows[0].cnt, 10);
    }
    res.json({ count });
  } catch (err) {
    console.error('Failed to get unread count:', err);
    res.status(500).json({ error: 'Failed to get unread count' });
  }
});

app.get('/chat/conversations', authMiddleware, async (req, res) => {
  try {
    const user = await userRepository.findById(req.user.id);
    if (!user) return res.status(401).json({ error: 'User not found. Try re-login.' });
    let rows;
    if (user.role === 'vendor' && user.shopId) {
      // Vendor: conversations for their shop, grouped by buyer
      const result = await pool.query(`
        SELECT c.buyer_id, c.shop_id, c.shop_name, u.email as buyer_email,
          (SELECT message FROM chat_messages c2 WHERE c2.shop_id = c.shop_id AND (c2.buyer_id = c.buyer_id OR c2.buyer_id = $1) ORDER BY created_at DESC LIMIT 1) as last_message,
          (SELECT created_at FROM chat_messages c2 WHERE c2.shop_id = c.shop_id AND (c2.buyer_id = c.buyer_id OR c2.buyer_id = $1) ORDER BY created_at DESC LIMIT 1) as last_message_at,
          (SELECT COUNT(*) FROM chat_messages c2 WHERE c2.shop_id = c.shop_id AND c2.buyer_id = c.buyer_id AND NOT c2.is_read AND c2.buyer_id != $1) as unread_count
        FROM chat_messages c
        JOIN users u ON u.id::text = c.buyer_id
        WHERE c.shop_id = $2 AND c.buyer_id != $1
        GROUP BY c.buyer_id, c.shop_id, c.shop_name, u.email
        ORDER BY last_message_at DESC
      `, [req.user.id, user.shopId]);
      rows = result.rows;
    } else {
      // Buyer: conversations grouped by shop
      const result = await pool.query(`
        SELECT shop_id, shop_name,
          (SELECT message FROM chat_messages c2 WHERE c2.shop_id = c.shop_id ORDER BY created_at DESC LIMIT 1) as last_message,
          (SELECT created_at FROM chat_messages c2 WHERE c2.shop_id = c.shop_id ORDER BY created_at DESC LIMIT 1) as last_message_at,
          0 as unread_count
        FROM chat_messages c
        WHERE c.shop_id IN (SELECT DISTINCT shop_id FROM chat_messages WHERE buyer_id = $1)
        GROUP BY shop_id, shop_name
        ORDER BY last_message_at DESC
      `, [req.user.id]);
      rows = result.rows;
    }
    res.json(rows);
  } catch (err) {
    console.error('Failed to fetch conversations:', err);
    res.status(500).json({ error: 'Failed to fetch conversations' });
  }
});

app.get('/chat/:shopId', authMiddleware, async (req, res) => {
  try {
    const { shopId } = req.params;
    const { buyerId } = req.query;
    const user = await userRepository.findById(req.user.id);
    if (!user) return res.status(401).json({ error: 'User not found. Try re-login.' });
    let rows;
    if (user.role === 'vendor' && user.shopId === shopId && buyerId) {
      // Vendor sees messages with a specific buyer (including their own replies)
      const result = await pool.query(
        'SELECT * FROM chat_messages WHERE shop_id = $1 AND (buyer_id = $2 OR buyer_id = $3) ORDER BY created_at ASC',
        [shopId, buyerId, req.user.id]
      );
      rows = result.rows;
    } else if (user.role === 'vendor' && user.shopId === shopId) {
      // Vendor sees all messages for their shop (fallback)
      const result = await pool.query(
        'SELECT * FROM chat_messages WHERE shop_id = $1 ORDER BY created_at ASC',
        [shopId]
      );
      rows = result.rows;
    } else {
      // Buyer sees all messages in the shop (own + vendor replies)
      const result = await pool.query(
        'SELECT * FROM chat_messages WHERE shop_id = $1 ORDER BY created_at ASC',
        [shopId]
      );
      rows = result.rows;
    }
    res.json(rows);
  } catch (err) {
    console.error('Failed to fetch messages:', err);
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
});

app.post('/chat/:shopId', authMiddleware, async (req, res) => {
  try {
    const { shopId } = req.params;
    const { message, shopName, productId, productName } = req.body;
    if (!message || !message.trim()) return res.status(400).json({ error: 'Message is required' });
    const sender = await userRepository.findById(req.user.id);
    if (!sender) return res.status(401).json({ error: 'User not found. Try re-login.' });
    const result = await pool.query(
      `INSERT INTO chat_messages (shop_id, buyer_id, message, product_id, product_name, shop_name)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [shopId, req.user.id, message.trim(), productId || null, productName || null, shopName || null]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Failed to send message:', err);
    res.status(500).json({ error: 'Failed to send message' });
  }
});

app.patch('/chat/:shopId/read', authMiddleware, async (req, res) => {
  try {
    const { shopId } = req.params;
    const user = await userRepository.findById(req.user.id);
    if (!user) return res.status(401).json({ error: 'User not found. Try re-login.' });
    if (user.role === 'vendor' && user.shopId === shopId) {
      // Vendor marks all messages for their shop as read
      await pool.query(
        'UPDATE chat_messages SET is_read = true WHERE shop_id = $1 AND buyer_id != $2',
        [shopId, req.user.id]
      );
    } else {
      // Buyer marks vendor replies as read
      await pool.query(
        'UPDATE chat_messages SET is_read = true WHERE shop_id = $1 AND buyer_id != $2',
        [shopId, req.user.id]
      );
    }
    res.json({ success: true });
  } catch (err) {
    console.error('Failed to mark as read:', err);
    res.status(500).json({ error: 'Failed to mark as read' });
  }
});

app.delete('/chat/:shopId', authMiddleware, async (req, res) => {
  try {
    const { shopId } = req.params;
    const { buyerId } = req.query;
    const user = await userRepository.findById(req.user.id);
    if (!user) return res.status(401).json({ error: 'User not found. Try re-login.' });
    if (user.role === 'vendor' && user.shopId) {
      if (!buyerId) return res.status(400).json({ error: 'buyerId required' });
      await pool.query('DELETE FROM chat_messages WHERE shop_id = $1 AND buyer_id = $2', [shopId, buyerId]);
    } else {
      await pool.query('DELETE FROM chat_messages WHERE shop_id = $1 AND buyer_id = $2', [shopId, req.user.id]);
    }
    res.json({ success: true });
  } catch (err) {
    console.error('Failed to delete conversation:', err);
    res.status(500).json({ error: 'Failed to delete conversation' });
  }
});

// ─── Admin ────────────────────────────────────────────────────────────────

const adminMiddleware = (req, res, next) => {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) return res.status(401).json({ error: 'Unauthorized' });
  try {
    const decoded = jwt.verify(header.split(' ')[1], process.env.JWT_SECRET || 'secret');
    if (decoded.role !== 'admin') return res.status(403).json({ error: 'Forbidden' });
    req.user = decoded;
    next();
  } catch { res.status(401).json({ error: 'Invalid token' }); }
};

app.get('/admin/users', adminMiddleware, async (req, res) => {
  try {
    const { status, role } = req.query;
    const users = await userRepository.findAll();
    let filtered = users;
    if (status) filtered = filtered.filter(u => u.status === status);
    if (role) filtered = filtered.filter(u => u.role === role);
    res.json(filtered);
  } catch (err) {
    console.error('Admin list users error:', err);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

app.patch('/admin/users/:id/role', adminMiddleware, async (req, res) => {
  try {
    const { role } = req.body;
    if (!['customer', 'vendor', 'admin'].includes(role)) return res.status(400).json({ error: 'Invalid role' });
    await userRepository.updateRole(req.params.id, role);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update role' });
  }
});

app.patch('/admin/users/:id/suspend', adminMiddleware, async (req, res) => {
  try {
    const user = await userRepository.findById(req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    const newStatus = user.status === 'suspended' ? 'active' : 'suspended';
    await userRepository.updateStatus(req.params.id, newStatus);
    res.json({ success: true, status: newStatus });
  } catch (err) {
    res.status(500).json({ error: 'Failed to toggle suspend' });
  }
});

// ─── Seed ─────────────────────────────────────────────────────────────────

const VENDORS = [
  { id: 'a1b2c3d4-e5f6-4789-abcd-ef1234567890', email: 'vendor1@example.com', name: 'Shop One' },
  { id: 'b2c3d4e5-f6a7-4890-bcde-f12345678901', email: 'vendor2@example.com', name: 'Shop Two' },
  { id: 'c3d4e5f6-a7b8-4901-cdef-123456789012', email: 'vendor3@example.com', name: 'Shop Three' },
];

// Shop UUIDs must match Laravel ShopSeeder (same hardcoded IDs)
const VENDOR_SHOP_IDS = {
  'a1b2c3d4-e5f6-4789-abcd-ef1234567890': 'd1e2f3a4-b5c6-4789-a1b2-c3d4e5f6a7b8',
  'b2c3d4e5-f6a7-4890-bcde-f12345678901': 'e2f3a4b5-c6d7-4890-b2c3-d4e5f6a7b8c9',
  'c3d4e5f6-a7b8-4901-cdef-123456789012': 'f3a4b5c6-d7e8-4901-c3d4-e5f6a7b8c9d0',
};

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
      // Link vendor to their catalog shop (idempotent — runs on every startup)
      const shopId = VENDOR_SHOP_IDS[v.id];
      if (shopId) {
        await userRepository.updateShopId(v.id, shopId);
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
app.listen(PORT, () => console.log(`User service running on port ${PORT}`));
