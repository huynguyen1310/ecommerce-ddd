import { Controller, Post, Body, Get, Param, NotFoundException, Inject } from '@nestjs/common';
import { CreateOrderUseCase } from '../application/create-order.use-case';
import { IOrderRepository } from '../domain/order.repository.interface';

@Controller('orders')
export class OrderController {
  constructor(
    private readonly createOrderUseCase: CreateOrderUseCase,
    @Inject('IOrderRepository')
    private readonly orderRepository: IOrderRepository,
  ) {}

  @Post()
  async create(@Body() body: { customerId: string; items: Array<{ productId: string; quantity: number; price: number }> }) {
    return await this.createOrderUseCase.execute(body);
  }

  @Get(':id')
  async findById(@Param('id') id: string) {
    const order = await this.orderRepository.findById(id);
    if (!order) throw new NotFoundException('Order not found');
    return {
      id: order.id, customerId: order.customerId, total: order.total,
      status: order.status,
      items: order.items.map(i => ({ productId: i.productId, quantity: i.quantity, price: i.price })),
      createdAt: order.createdAt,
    };
  }

  @Get('customer/:customerId')
  async findByCustomer(@Param('customerId') customerId: string) {
    const orders = await this.orderRepository.findByCustomerId(customerId);
    return orders.map(order => ({
      id: order.id, customerId: order.customerId, total: order.total,
      status: order.status,
      items: order.items.map(i => ({ productId: i.productId, quantity: i.quantity, price: i.price })),
      createdAt: order.createdAt,
    }));
  }
}
