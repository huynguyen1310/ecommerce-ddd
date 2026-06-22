const amqp = require('amqplib');

class RabbitMqConsumer {
  constructor(createShipmentUseCase) {
    this.createShipmentUseCase = createShipmentUseCase;
    this.channel = null;
  }

  async connect(url, exchange, retries = 5) {
    try {
      const connection = await amqp.connect(url);
      this.channel = await connection.createChannel();
      await this.channel.assertExchange(exchange, 'topic', { durable: true });

      const q = await this.channel.assertQueue('shipping_service_payments', { durable: true });
      await this.channel.bindQueue(q.queue, exchange, 'payment.completed');

      console.log('Shipping service listening for payment.completed...');

      this.channel.consume(q.queue, async (msg) => {
        if (msg !== null) {
          try {
            const event = JSON.parse(msg.content.toString());
            const orderId = event.data.order_id;
            console.log('Received payment.completed for order:', orderId);
            await this.createShipmentUseCase.execute(orderId);
            this.channel.ack(msg);
          } catch (err) {
            console.error('Error processing payment.completed:', err.message);
            this.channel.nack(msg, false, true);
          }
        }
      });
    } catch (err) {
      if (retries === 0) throw err;
      console.log(`RabbitMQ retry in 5s... (${retries} left)`);
      setTimeout(() => this.connect(url, exchange, retries - 1), 5000);
    }
  }

  getChannel() {
    return this.channel;
  }
}

module.exports = { RabbitMqConsumer };
