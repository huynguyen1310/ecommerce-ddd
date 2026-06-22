import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { IOrderRepository } from '../domain/order.repository.interface';
import { OrderDto } from './dtos/order.dto';

@Injectable()
export class FindOrderByIdUseCase {
  constructor(
    @Inject('IOrderRepository')
    private readonly orderRepository: IOrderRepository,
  ) {}

  async execute(id: string): Promise<OrderDto> {
    const order = await this.orderRepository.findById(id);
    if (!order) {
      throw new NotFoundException('Order not found');
    }

    return {
      id: order.id,
      customerId: order.customerId,
      total: order.total,
      status: order.status,
      items: order.items.map(item => ({
        productId: item.productId,
        quantity: item.quantity,
        price: item.price,
      })),
      createdAt: order.createdAt,
    };
  }
}
