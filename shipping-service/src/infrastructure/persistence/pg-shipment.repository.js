const crypto = require('crypto');
const { ShipmentMapper } = require('./shipment.mapper');

/** @implements {import('../../domain/ports/IShipmentRepository').IShipmentRepository} */
class PgShipmentRepository {
  constructor(pool) {
    this.pool = pool;
  }

  async save(shipment) {
    if (!shipment.id) {
      shipment.id = crypto.randomUUID();
    }
    const data = ShipmentMapper.toPersistence(shipment);
    await this.pool.query(
      `INSERT INTO shipments (id, order_id, tracking_number, carrier, status)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (id) DO UPDATE SET status = $5, updated_at = NOW()
       RETURNING *`,
      [data.id, data.order_id, data.tracking_number, data.carrier, data.status]
    );
  }

  async findByOrderId(orderId) {
    const result = await this.pool.query('SELECT * FROM shipments WHERE order_id = $1', [orderId]);
    return ShipmentMapper.toDomain(result.rows[0]);
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
