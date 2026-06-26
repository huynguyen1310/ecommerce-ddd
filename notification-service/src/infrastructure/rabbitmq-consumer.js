const amqp = require('amqplib');

class RabbitMQConsumer {
  constructor(url, sendOrderEmailUseCase, sendShippedEmailUseCase, sendPaymentEmailUseCase, mailProvider, notifRepo) {
    this.url = url;
    this.sendOrderEmailUseCase = sendOrderEmailUseCase;
    this.sendShippedEmailUseCase = sendShippedEmailUseCase;
    this.sendPaymentEmailUseCase = sendPaymentEmailUseCase;
    this.mailProvider = mailProvider;
    this.notifRepo = notifRepo;
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
      await channel.bindQueue(queue, exchange, 'payment.completed');
      await channel.bindQueue(queue, exchange, 'refund.created');
      await channel.bindQueue(queue, exchange, 'refund.completed');

      console.log('[RabbitMQ Consumer] Waiting for order events...');

      channel.consume(queue, async (msg) => {
        if (msg !== null) {
          try {
            const content = JSON.parse(msg.content.toString());
            const routingKey = msg.fields.routingKey;

            if (routingKey === 'order.created') {
              console.log(`[RabbitMQ Consumer] Received Order: ${content.data.order_id}`);
              if (this.notifRepo) {
                await this.notifRepo.create({
                  userId: content.data.customer_id,
                  type: 'order.created',
                  title: 'Order Confirmed',
                  body: `Your order #${content.data.order_id.slice(0, 8)} for $${content.data.total} has been placed successfully.`,
                  link: `/orders/${content.data.order_id}`,
                });
              }
              await this.sendOrderEmailUseCase.execute(content.data);
            } else if (routingKey === 'order.shipped') {
              console.log(`[RabbitMQ Consumer] Order Shipped: ${content.data.order_id}`);
              await this.sendShippedEmailUseCase.execute(content.data);
            } else if (routingKey === 'payment.completed') {
              console.log(`[RabbitMQ Consumer] Payment completed: ${content.data.order_id}`);
              await this.sendPaymentEmailUseCase.execute(content.data);
            } else if (routingKey === 'refund.created') {
              console.log(`[RabbitMQ Consumer] Refund requested: ${content.data.return_id}`);
              if (this.notifRepo) {
                await this.notifRepo.create({
                  userId: content.data.buyer_id,
                  type: 'refund.created',
                  title: 'Return Request Received',
                  body: `Your return request for order #${content.data.order_id.slice(0, 8)} has been received.`,
                  link: `/orders/${content.data.order_id}`,
                });
              }
              if (this.mailProvider) {
                await this.mailProvider.send({
                  to: content.data.buyer_id,
                  subject: 'Return Request Received',
                  text: `Your return request for order ${content.data.order_id} has been received. Reason: ${content.data.reason}. We'll notify you once it's processed.`,
                });
              }
            } else if (routingKey === 'refund.completed') {
              console.log(`[RabbitMQ Consumer] Refund completed: ${content.data.order_id}`);
              if (this.mailProvider) {
                await this.mailProvider.send({
                  to: content.data.buyer_id,
                  subject: 'Refund Processed',
                  text: `Your refund of $${content.data.amount} for order ${content.data.order_id} has been processed.`,
                });
              }
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
