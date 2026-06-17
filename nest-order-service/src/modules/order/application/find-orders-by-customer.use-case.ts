import { Inject, Injectable } from '@nestjs/common';
import { IOrderRepository } from '../domain/order.repository.interface';
import { OrderDto } from './dtos/order.dto';

@Injectable()
export class FindOrdersByCustomerUseCase {
  constructor(
    @Inject('IOrderRepository')
    private readonly orderRepository: IOrderRepository,
  ) {}

  async execute(customerId: string): Promise<OrderDto[]> {
    const orders = await this.orderRepository.findByCustomerId(customerId);
    
    return orders.map(order => ({
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
    }));
  }
}
