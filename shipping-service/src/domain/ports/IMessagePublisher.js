/**
 * @interface IMessagePublisher
 *
 * Contract for publishing shipping events.
 * Implementations: RabbitMqPublisher
 */

class IMessagePublisher {
  /** @returns {Promise<void>} */
  async publishOrderShipped(orderId, trackingNumber, carrier) { throw new Error('Not implemented'); }
}

module.exports = { IMessagePublisher };
