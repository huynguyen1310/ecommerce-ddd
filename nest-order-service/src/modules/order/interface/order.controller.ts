import { Controller, Post, Body, Get, Param, NotFoundException, Inject } from '@nestjs/common';
import { CreateOrderUseCase } from '../application/create-order.use-case';
import { IOrderRepository } from '../domain/order.repository.interface';
import { ShippingAddress } from '../domain/order.entity';

@Controller('orders')
export class OrderController {
  constructor(
    private readonly createOrderUseCase: CreateOrderUseCase,
    @Inject('IOrderRepository')
    private readonly orderRepository: IOrderRepository,
  ) {}

  @Post()
  async create(@Body() body: { customerId: string; customerEmail?: string; items: Array<{ productId: string; quantity: number; price: number }>; shippingAddress?: ShippingAddress }) {
    return await this.createOrderUseCase.execute(body);
  }

  private formatOrder(order: any) {
    return {
      id: order.id, customerId: order.customerId, total: order.total,
      status: order.status,
      shippingAddress: order.shippingAddress,
      items: order.items.map(i => ({ productId: i.productId, quantity: i.quantity, price: i.price })),
      createdAt: order.createdAt,
    };
  }

  @Get()
  async findAll() {
    const orders = await this.orderRepository.findAll();
    return orders.map(this.formatOrder);
  }

  @Get(':id')
  async findById(@Param('id') id: string) {
    const order = await this.orderRepository.findById(id);
    if (!order) throw new NotFoundException('Order not found');
    return this.formatOrder(order);
  }

  @Get('customer/:customerId')
  async findByCustomer(@Param('customerId') customerId: string) {
    const orders = await this.orderRepository.findByCustomerId(customerId);
    return orders.map(this.formatOrder);
  }
}
