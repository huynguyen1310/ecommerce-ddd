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

  async publishOrderCreated(order: Order, customerEmail?: string): Promise<void> {
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
        customer_email: customerEmail,
        ordered_at: order.createdAt.toISOString(),
        shipping_address: order.shippingAddress,
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

  async publishRefundCreated(returnRequest: any, customerId: string): Promise<void> {
    if (!this.channel) return;
    const payload = {
      event_id: crypto.randomUUID(),
      occurred_at: new Date().toISOString(),
      data: {
        return_id: returnRequest.id,
        order_id: returnRequest.orderId,
        buyer_id: returnRequest.buyerId,
        reason: returnRequest.reason,
        amount: returnRequest.refundAmount,
        status: returnRequest.status,
      },
    };
    this.channel.publish(this.exchange, 'refund.created', Buffer.from(JSON.stringify(payload)), { persistent: true });
    console.log('[RabbitMQ] Published event: refund.created');
  }

  async publishRefundCompleted(orderId: string, amount: number, items?: { product_id: string; quantity: number }[]): Promise<void> {
    if (!this.channel) return;
    const payload = {
      event_id: crypto.randomUUID(),
      occurred_at: new Date().toISOString(),
      data: { order_id: orderId, amount, items: items || [] },
    };
    this.channel.publish(this.exchange, 'refund.completed', Buffer.from(JSON.stringify(payload)), { persistent: true });
    console.log('[RabbitMQ] Published event: refund.completed');
  }

  async publishStatusChanged(orderId: string, from: string, to: string): Promise<void> {
    if (!this.channel) return;
    const payload = {
      event_id: crypto.randomUUID(),
      occurred_at: new Date().toISOString(),
      data: { order_id: orderId, from, to },
    };
    this.channel.publish(this.exchange, 'order.status.changed', Buffer.from(JSON.stringify(payload)), { persistent: true });
    console.log('[RabbitMQ] Published event: order.status.changed');
  }
}
