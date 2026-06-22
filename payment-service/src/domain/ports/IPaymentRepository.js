/**
 * @interface IPaymentRepository
 *
 * Contract for payment persistence.
 * Implementations: PgPaymentRepository
 */

class IPaymentRepository {
  /** @returns {Promise<void>} */
  async save(payment) { throw new Error('Not implemented'); }

  /** @returns {Promise<object|null>} */
  async findByOrderId(orderId) { throw new Error('Not implemented'); }

  /** @returns {Promise<object>} */
  async findByOrderIdOrFail(orderId) { throw new Error('Not implemented'); }
}

module.exports = { IPaymentRepository };
