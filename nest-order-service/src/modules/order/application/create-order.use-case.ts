import { IOrderRepository } from '../domain/order.repository.interface';
import { Order, ShippingAddress } from '../domain/order.entity';
import { RabbitMqOrderPublisher } from '../infrastructure/messaging/rabbitmq-order-publisher';
import * as crypto from 'crypto';
import { Inject, Injectable } from '@nestjs/common';

@Injectable()
export class CreateOrderUseCase {
  constructor(
    @Inject('IOrderRepository')
    private readonly orderRepository: IOrderRepository,
    private readonly messagePublisher: RabbitMqOrderPublisher,
  ) {}

  async execute(input: { customerId: string; customerEmail?: string; items: Array<{ productId: string; quantity: number; price: number }>; shippingAddress?: ShippingAddress }) {
    const id = crypto.randomUUID();
    const order = Order.create(id, input.customerId, input.items, input.shippingAddress);
    await this.orderRepository.save(order);
    
    await this.messagePublisher.publishOrderCreated(order, input.customerEmail);
    
    return {
      id: order.id,
      customerId: order.customerId,
      total: order.total,
      status: order.status,
      shippingAddress: order.shippingAddress,
      items: order.items.map(item => ({
        productId: item.productId,
        quantity: item.quantity,
        price: item.price
      })),
      createdAt: order.createdAt,
    };
  }
}
