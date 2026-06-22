const crypto = require('crypto');

/** @implements {import('../../domain/ports/IMessagePublisher').IMessagePublisher} */
class RabbitMqPublisher {
  constructor(channel, exchange) {
    this.channel = channel;
    this.exchange = exchange;
  }

  publishCompleted(orderId, transactionId) {
    const event = {
      event_id: crypto.randomUUID(),
      occurred_at: new Date().toISOString(),
      data: {
        order_id: orderId,
        transaction_id: transactionId,
        status: 'SUCCESS',
      },
    };
    this.channel.publish(this.exchange, 'payment.completed', Buffer.from(JSON.stringify(event)));
    console.log('Published payment.completed for order:', orderId);
  }

  publishFailed(orderId, items, reason) {
    const event = {
      event_id: crypto.randomUUID(),
      occurred_at: new Date().toISOString(),
      data: {
        order_id: orderId,
        reason: reason || 'User cancelled or payment failed',
        items: items || [],
      },
    };
    this.channel.publish(this.exchange, 'payment.failed', Buffer.from(JSON.stringify(event)));
    console.log('Published payment.failed for order:', orderId);
  }
}

module.exports = { RabbitMqPublisher };
