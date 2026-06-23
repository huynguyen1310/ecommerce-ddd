const amqp = require('amqplib');

class RabbitMqConsumer {
  constructor(paymentRepository) {
    this.paymentRepository = paymentRepository;
    this.channel = null;
  }

  async connect(url, exchange, retries = 5) {
    try {
      const connection = await amqp.connect(url);
      this.channel = await connection.createChannel();
      await this.channel.assertExchange(exchange, 'topic', { durable: true });

      const q = await this.channel.assertQueue('payment_service_orders', { durable: true });
      await this.channel.bindQueue(q.queue, exchange, 'order.created');

      console.log('Payment service listening for order.created...');

      this.channel.consume(q.queue, async (msg) => {
        if (msg !== null) {
          try {
            const event = JSON.parse(msg.content.toString());
            const orderId = event.data.order_id;
            console.log('Received order.created for order:', orderId);

            const existing = await this.paymentRepository.findByOrderId(orderId);
            if (existing) {
              console.log('Payment already exists for order:', orderId);
              this.channel.ack(msg);
              return;
            }

            const { Payment } = require('../../domain/payment.entity');
            const payment = new Payment(
              null,
              orderId,
              'PENDING',
              null,
              event.data.total || 0,
              (event.data.items || []).map(i => ({
                product_id: i.product_id,
                quantity: i.quantity,
                price: i.price,
              })),
              new Date(),
              new Date(),
              event.data.customer_email,
              event.data.shipping_address,
            );
            await this.paymentRepository.save(payment);

            this.channel.ack(msg);
          } catch (err) {
            console.error('Error processing order.created:', err.message);
            this.channel.ack(msg);
          }
        }
      });
    } catch (err) {
      if (retries === 0) throw err;
      console.log(`RabbitMQ retry in 5s... (${retries} left)`);
      setTimeout(() => this.connect(url, exchange, retries - 1), 5000);
    }
  }
}

module.exports = { RabbitMqConsumer };
