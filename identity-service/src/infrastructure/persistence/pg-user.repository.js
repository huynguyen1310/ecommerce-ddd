const { User } = require('../../domain/user.entity');

class PgUserRepository {
  constructor(pool) {
    this.pool = pool;
  }

  async findAll() {
    const result = await this.pool.query('SELECT id, email, role FROM users ORDER BY email');
    return result.rows;
  }

  async findByEmail(email) {
    const result = await this.pool.query('SELECT * FROM users WHERE email = $1', [email]);
    const row = result.rows[0];
    if (!row) return null;
    return new User(row.id, row.email, row.password, row.role);
  }

  async save(user) {
    const hasId = user.id && user.id !== 'null';
    const result = await this.pool.query(
      hasId
        ? 'INSERT INTO users (id, email, password, role) VALUES ($1, $2, $3, $4) RETURNING id, email, role'
        : 'INSERT INTO users (email, password, role) VALUES ($1, $2, $3) RETURNING id, email, role',
      hasId ? [user.id, user.email, user.password, user.role] : [user.email, user.password, user.role]
    );
    user.id = result.rows[0].id;
  }

  async findById(id) {
    const result = await this.pool.query('SELECT * FROM users WHERE id = $1', [id]);
    const row = result.rows[0];
    if (!row) return null;
    return new User(row.id, row.email, row.password, row.role);
  }

  async updateRole(id, role) {
    await this.pool.query('UPDATE users SET role = $1 WHERE id = $2', [role, id]);
  }

  async init() {
    await this.pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        role TEXT DEFAULT 'customer'
      );
    `);
  }
}

module.exports = { PgUserRepository };
