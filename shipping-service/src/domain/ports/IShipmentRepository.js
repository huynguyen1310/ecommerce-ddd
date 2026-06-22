/**
 * @interface IShipmentRepository
 *
 * Contract for shipment persistence.
 * Implementations: PgShipmentRepository
 */

class IShipmentRepository {
  /** @returns {Promise<void>} */
  async save(shipment) { throw new Error('Not implemented'); }

  /** @returns {Promise<object|null>} */
  async findByOrderId(orderId) { throw new Error('Not implemented'); }
}

module.exports = { IShipmentRepository };
