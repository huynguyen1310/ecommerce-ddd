import { Injectable, OnModuleInit } from '@nestjs/common';
import { Order } from '../../domain/order.entity';
import { connect } from 'amqplib';
import * as crypto from 'crypto';

@Injectable()
export class RabbitMqOrderPublisher implements OnModuleInit {
  private connection: any;
  private channel: any;
  private readonly exchange = 'events';

  async onModuleInit() {
    await this.connectToRabbit();
  }

  private async connectToRabbit() {
    try {
      const url = process.env.RABBITMQ_URL || 'amqp://guest:guest@localhost:5672';
      this.connection = await connect(url);
      this.channel = await this.connection.createChannel();
      await this.channel.assertExchange(this.exchange, 'topic', { durable: true });
      console.log('[RabbitMQ] Connected and exchange asserted');
    } catch (error) {
      console.error('[RabbitMQ] Connection failed, retrying in 5s...', (error as Error).message);
      setTimeout(() => this.connectToRabbit(), 5000);
    }
  }

  async publishOrderCreated(order: Order): Promise<void> {
    if (!this.channel) {
      console.error('[RabbitMQ] Channel not initialized');
      return;
    }

    const payload = {
      event_id: crypto.randomUUID(),
      occurred_at: new Date().toISOString(),
      data: {
        order_id: order.id,
        customer_id: order.customerId,
        // Using snake_case for cross-service compatibility
        items: order.items.map(item => ({
            product_id: item.productId,
            quantity: item.quantity,
            price: item.price
        })),
        total: order.total,
      },
    };

    const routingKey = 'order.created';
    this.channel.publish(
      this.exchange,
      routingKey,
      Buffer.from(JSON.stringify(payload)),
      { persistent: true }
    );

    console.log(`[RabbitMQ] Published event: ${routingKey}`);
  }
}
