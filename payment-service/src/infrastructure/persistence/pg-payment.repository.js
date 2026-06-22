const crypto = require('crypto');
const { PaymentMapper } = require('./payment.mapper');

class PgPaymentRepository {
  constructor(pool) {
    this.pool = pool;
  }

  async save(payment) {
    if (!payment.id) {
      payment.id = crypto.randomUUID();
    }
    const data = PaymentMapper.toPersistence(payment);
    const result = await this.pool.query(
      `INSERT INTO payments (id, order_id, status, transaction_id, amount, items)
       VALUES ($1, $2, $3, $4, $5, $6)
       ON CONFLICT (id) DO UPDATE SET status = $3, transaction_id = $4, updated_at = NOW()
       RETURNING *`,
      [data.id, data.order_id, data.status, data.transaction_id, data.amount, data.items]
    );
    const updated = PaymentMapper.toDomain(result.rows[0]);
    payment.status = updated.status;
    payment.transactionId = updated.transactionId;
    payment.updatedAt = updated.updatedAt;
  }

  async findByOrderId(orderId) {
    const result = await this.pool.query('SELECT * FROM payments WHERE order_id = $1', [orderId]);
    return PaymentMapper.toDomain(result.rows[0]);
  }

  async init() {
    await this.pool.query(`
      CREATE TABLE IF NOT EXISTS payments (
        id UUID PRIMARY KEY,
        order_id UUID NOT NULL UNIQUE,
        status TEXT NOT NULL DEFAULT 'PENDING',
        transaction_id TEXT,
        amount DECIMAL(10,2),
        items JSONB DEFAULT '[]',
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `);
  }
}

module.exports = { PgPaymentRepository };
