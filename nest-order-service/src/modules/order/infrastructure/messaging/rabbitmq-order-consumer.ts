import { Injectable, OnModuleInit, Inject } from '@nestjs/common';
import { connect, Connection, Channel } from 'amqplib';
import { IOrderRepository } from '../../domain/order.repository.interface';

@Injectable()
export class RabbitMqOrderConsumer implements OnModuleInit {
  private connection: any;
  private channel: any;
  private readonly exchange = 'events';
  private readonly queue = 'order_service_inventory_updates';

  constructor(
    @Inject('IOrderRepository')
    private readonly orderRepository: IOrderRepository,
  ) {}

  async onModuleInit() {
    await this.connectToRabbit();
  }

  private async connectToRabbit() {
    try {
      const url = process.env.RABBITMQ_URL || 'amqp://guest:guest@localhost:5672';
      this.connection = await connect(url);
      this.channel = await this.connection.createChannel();
      
      await this.channel.assertExchange(this.exchange, 'topic', { durable: true });
      await this.channel.assertQueue(this.queue, { durable: true });
      
      // Bind to all relevant events for order state management
      await this.channel.bindQueue(this.queue, this.exchange, 'inventory.deducted');
      await this.channel.bindQueue(this.queue, this.exchange, 'inventory.insufficient');
      await this.channel.bindQueue(this.queue, this.exchange, 'payment.completed');
      await this.channel.bindQueue(this.queue, this.exchange, 'payment.failed');

      console.log('[RabbitMQ Consumer] Waiting for order lifecycle events...');

      this.channel.consume(this.queue, async (msg) => {
        if (msg !== null) {
          const content = JSON.parse(msg.content.toString());
          await this.handleEvent(msg.fields.routingKey, content);
          this.channel.ack(msg);
        }
      });
    } catch (error) {
      console.error('[RabbitMQ Consumer] Connection failed, retrying...', error.message);
      setTimeout(() => this.connectToRabbit(), 5000);
    }
  }

  private async handleEvent(routingKey: string, payload: any) {
    const { order_id } = payload.data;
    const order = await this.orderRepository.findById(order_id);

    if (!order) {
      console.warn(`[RabbitMQ Consumer] Order not found: ${order_id}`);
      return;
    }

    console.log(`[RabbitMQ Consumer] Handling ${routingKey} for Order: ${order_id}`);

    switch (routingKey) {
      case 'inventory.deducted':
        // Optional: set to 'AWAITING_PAYMENT' or keep as 'PENDING'
        console.log(`[RabbitMQ Consumer] Inventory secured. Awaiting payment...`);
        break;
      
      case 'inventory.insufficient':
        console.log(`[RabbitMQ Consumer] Stock failed. Cancelling...`);
        order.status = 'CANCELLED';
        break;

      case 'payment.completed':
        console.log(`[RabbitMQ Consumer] Payment successful! Shipping order...`);
        order.status = 'PAID';
        // In a real app, maybe SHIPPED comes after a warehouse event
        break;

      case 'payment.failed':
        console.log(`[RabbitMQ Consumer] Payment failed. Reason: ${payload.data.reason}. Cancelling...`);
        order.status = 'CANCELLED';
        break;
    }

    await this.orderRepository.save(order);
  }
}
