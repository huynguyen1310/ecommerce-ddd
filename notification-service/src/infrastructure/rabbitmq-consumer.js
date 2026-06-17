const amqp = require('amqplib');

class RabbitMQConsumer {
  constructor(url, sendOrderEmailUseCase) {
    this.url = url;
    this.sendOrderEmailUseCase = sendOrderEmailUseCase;
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

      console.log('[RabbitMQ Consumer] Waiting for order events...');

      channel.consume(queue, async (msg) => {
        if (msg !== null) {
          try {
            const content = JSON.parse(msg.content.toString());
            console.log(`[RabbitMQ Consumer] Received Order: ${content.data.order_id}`);
            await this.sendOrderEmailUseCase.execute(content.data);
            channel.ack(msg);
          } catch (error) {
            console.error('[RabbitMQ Consumer] Error processing message:', error.message);
            // In a real app, we might want to nack or move to DLQ
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
