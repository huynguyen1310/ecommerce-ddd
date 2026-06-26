const { Client } = require('pg')

class NotificationRepository {
  constructor(connectionString) {
    this.client = new Client({ connectionString })
  }

  async init() {
    await this.client.connect()
    await this.client.query(`
      CREATE TABLE IF NOT EXISTS notifications (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id VARCHAR(255) NOT NULL,
        type VARCHAR(50) NOT NULL,
        title TEXT NOT NULL,
        body TEXT,
        link VARCHAR(500),
        is_read BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `)
    await this.client.query('CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id, created_at DESC)')
    await this.client.query('CREATE INDEX IF NOT EXISTS idx_notifications_unread ON notifications(user_id) WHERE is_read = false')
  }

  async create({ userId, type, title, body, link }) {
    const { rows } = await this.client.query(
      'INSERT INTO notifications (user_id, type, title, body, link) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [userId, type, title, body || null, link || null]
    )
    return rows[0]
  }

  async findByUser(userId, { page = 1, perPage = 20 } = {}) {
    const offset = (page - 1) * perPage
    const { rows } = await this.client.query(
      'SELECT * FROM notifications WHERE user_id = $1 ORDER BY created_at DESC LIMIT $2 OFFSET $3',
      [userId, perPage, offset]
    )
    const { rows: [{ count }] } = await this.client.query(
      'SELECT COUNT(*) FROM notifications WHERE user_id = $1',
      [userId]
    )
    return { data: rows, total: Number(count), page, perPage }
  }

  async unreadCount(userId) {
    const { rows: [{ count }] } = await this.client.query(
      'SELECT COUNT(*) FROM notifications WHERE user_id = $1 AND is_read = false',
      [userId]
    )
    return Number(count)
  }

  async markRead(id) {
    await this.client.query('UPDATE notifications SET is_read = true WHERE id = $1', [id])
  }

  async markAllRead(userId) {
    await this.client.query('UPDATE notifications SET is_read = true WHERE user_id = $1 AND is_read = false', [userId])
  }
}

module.exports = NotificationRepository
