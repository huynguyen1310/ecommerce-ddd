const crypto = require('crypto');

class RabbitMqPublisher {
  constructor(channel, exchange) {
    this.channel = channel;
    this.exchange = exchange;
  }

  async publishOrderShipped(orderId, trackingNumber, carrier) {
    const event = {
      event_id: crypto.randomUUID(),
      occurred_at: new Date().toISOString(),
      data: {
        order_id: orderId,
        tracking_number: trackingNumber,
        carrier: carrier || 'FedEx',
      },
    };
    this.channel.publish(this.exchange, 'order.shipped', Buffer.from(JSON.stringify(event)));
    console.log('Published order.shipped for order:', orderId);
  }
}

module.exports = { RabbitMqPublisher };
