const amqp = require('amqplib');

class RabbitMQConsumer {
  constructor(url, sendOrderEmailUseCase, sendShippedEmailUseCase) {
    this.url = url;
    this.sendOrderEmailUseCase = sendOrderEmailUseCase;
    this.sendShippedEmailUseCase = sendShippedEmailUseCase;
  }

  async start() {
    try {
      const connection = await amqp.connect(this.url);
      const channel = await connection.createChannel();

      const exchange = 'events';
      const queue = 'notification_emails';

      await channel.assertExchange(exchange, 'topic', { durable: true });
      await channel.assertQueue(queue, { durable: true });
      await channel.bindQueue(queue, exchange, 'order.created');
      await channel.bindQueue(queue, exchange, 'order.shipped');

      console.log('[RabbitMQ Consumer] Waiting for order events...');

      channel.consume(queue, async (msg) => {
        if (msg !== null) {
          try {
            const content = JSON.parse(msg.content.toString());
            const routingKey = msg.fields.routingKey;

            if (routingKey === 'order.created') {
              console.log(`[RabbitMQ Consumer] Received Order: ${content.data.order_id}`);
              await this.sendOrderEmailUseCase.execute(content.data);
            } else if (routingKey === 'order.shipped') {
              console.log(`[RabbitMQ Consumer] Order Shipped: ${content.data.order_id}`);
              await this.sendShippedEmailUseCase.execute(content.data);
            }

            channel.ack(msg);
          } catch (error) {
            console.error('[RabbitMQ Consumer] Error processing message:', error.message);
            channel.ack(msg);
          }
        }
      });
    } catch (error) {
      console.error('[RabbitMQ Consumer] Connection error:', error.message);
      setTimeout(() => this.start(), 5000);
    }
  }
}

module.exports = RabbitMQConsumer;
