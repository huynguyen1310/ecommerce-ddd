import { IOrderRepository } from '../domain/order.repository.interface';
import { Order } from '../domain/order.entity';
import { IMessagePublisher } from '../domain/ports/message-publisher.interface';
import { CreateOrderDto } from './dtos/create-order.dto';
import { OrderDto } from './dtos/order.dto';
import * as crypto from 'crypto';
import { Inject, Injectable } from '@nestjs/common';

@Injectable()
export class CreateOrderUseCase {
  constructor(
    @Inject('IOrderRepository')
    private readonly orderRepository: IOrderRepository,
    @Inject('IMessagePublisher')
    private readonly messagePublisher: IMessagePublisher,
  ) {}

  async execute(input: CreateOrderDto): Promise<OrderDto> {
    const id = crypto.randomUUID();
    const order = Order.create(id, input.customerId, input.items);
    await this.orderRepository.save(order);
    
    await this.messagePublisher.publishOrderCreated(order);
    
    return {
      id: order.id,
      customerId: order.customerId,
      total: order.total,
      status: order.status,
      items: order.items.map(item => ({
        productId: item.productId,
        quantity: item.quantity,
        price: item.price
      })),
      createdAt: order.createdAt,
    };
  }
}
