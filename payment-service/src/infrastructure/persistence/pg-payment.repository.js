const crypto = require('crypto');
const { Payment } = require('../../domain/payment.entity');

class PgPaymentRepository {
  constructor(pool) {
    this.pool = pool;
  }

  async save(payment) {
    if (!payment.id) {
      payment.id = crypto.randomUUID();
    }
    const result = await this.pool.query(
      `INSERT INTO payments (id, order_id, status, transaction_id, amount, items, customer_email, shipping_address)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       ON CONFLICT (id) DO UPDATE SET status = $3, transaction_id = $4, updated_at = NOW()
       RETURNING *`,
      [payment.id, payment.orderId, payment.status, payment.transactionId, payment.amount, JSON.stringify(payment.items), payment.customerEmail, payment.shippingAddress ? JSON.stringify(payment.shippingAddress) : null]
    );
    const row = result.rows[0];
    payment.status = row.status;
    payment.transactionId = row.transaction_id;
    payment.updatedAt = row.updated_at;
  }

  async findByOrderId(orderId) {
    const result = await this.pool.query('SELECT * FROM payments WHERE order_id = $1', [orderId]);
    const row = result.rows[0];
    if (!row) return null;
    return new Payment(row.id, row.order_id, row.status, row.transaction_id, parseFloat(row.amount), row.items, row.created_at, row.updated_at, row.customer_email, row.shipping_address);
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
    await this.pool.query(`ALTER TABLE payments ADD COLUMN IF NOT EXISTS customer_email TEXT`);
    await this.pool.query(`ALTER TABLE payments ADD COLUMN IF NOT EXISTS shipping_address JSONB`);
  }
}

module.exports = { PgPaymentRepository };
