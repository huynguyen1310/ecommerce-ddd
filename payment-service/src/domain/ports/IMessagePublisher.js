/**
 * @interface IMessagePublisher
 *
 * Contract for publishing payment events.
 * Implementations: RabbitMqPublisher
 */

class IMessagePublisher {
  /** @returns {Promise<void>} */
  async publishCompleted(orderId, transactionId) { throw new Error('Not implemented'); }

  /** @returns {Promise<void>} */
  async publishFailed(orderId, items, reason) { throw new Error('Not implemented'); }
}

module.exports = { IMessagePublisher };
