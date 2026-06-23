const crypto = require('crypto');
const { Shipment } = require('../../domain/shipment.entity');

class PgShipmentRepository {
  constructor(pool) {
    this.pool = pool;
  }

  async save(shipment) {
    if (!shipment.id) {
      shipment.id = crypto.randomUUID();
    }
    await this.pool.query(
      `INSERT INTO shipments (id, order_id, tracking_number, carrier, status)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (id) DO UPDATE SET status = $5, updated_at = NOW()
       RETURNING *`,
      [shipment.id, shipment.orderId, shipment.trackingNumber, shipment.carrier, shipment.status]
    );
  }

  async findByOrderId(orderId) {
    const result = await this.pool.query('SELECT * FROM shipments WHERE order_id = $1', [orderId]);
    const row = result.rows[0];
    if (!row) return null;
    return new Shipment(row.id, row.order_id, row.tracking_number, row.carrier, row.status, row.created_at, row.updated_at);
  }

  async init() {
    await this.pool.query(`
      CREATE TABLE IF NOT EXISTS shipments (
        id UUID PRIMARY KEY,
        order_id UUID NOT NULL UNIQUE,
        tracking_number TEXT NOT NULL,
        carrier TEXT NOT NULL DEFAULT 'FedEx',
        status TEXT NOT NULL DEFAULT 'SHIPPED',
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `);
  }
}

module.exports = { PgShipmentRepository };
