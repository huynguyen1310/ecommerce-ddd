const { User } = require('../../domain/user.entity');

class PgUserRepository {
  constructor(pool) {
    this.pool = pool;
  }

  async findByEmail(email) {
    const result = await this.pool.query('SELECT * FROM users WHERE email = $1', [email]);
    const row = result.rows[0];
    if (!row) return null;
    return new User(row.id, row.email, row.password, row.role);
  }

  async save(user) {
    const result = await this.pool.query(
      'INSERT INTO users (email, password, role) VALUES ($1, $2, $3) RETURNING id, email, role',
      [user.email, user.password, user.role]
    );
    user.id = result.rows[0].id;
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
