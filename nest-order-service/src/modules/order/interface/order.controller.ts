import { Controller, Post, Body, Get, Param, Patch, NotFoundException, BadRequestException, Inject } from '@nestjs/common';
import { CreateOrderUseCase } from '../application/create-order.use-case';
import { IOrderRepository } from '../domain/order.repository.interface';
import { ShippingAddress, OrderItem } from '../domain/order.entity';

@Controller('orders')
export class OrderController {
  constructor(
    private readonly createOrderUseCase: CreateOrderUseCase,
    @Inject('IOrderRepository')
    private readonly orderRepository: IOrderRepository,
  ) {}

  @Post()
  async create(@Body() body: { customerId: string; customerEmail?: string; items: OrderItem[]; shippingAddress?: ShippingAddress; couponCode?: string }) {
    return await this.createOrderUseCase.execute(body);
  }

  private formatOrder(order: any) {
    return {
      id: order.id, customerId: order.customerId, total: order.total,
      status: order.status,
      shippingAddress: order.shippingAddress,
      couponCode: order.couponCode,
      discount: order.discount ? Number(order.discount) : undefined,
      items: order.items.map(i => ({ productId: i.productId, quantity: i.quantity, price: i.price, shopId: i.shopId })),
      createdAt: order.createdAt,
    };
  }

  @Get()
  async findAll() {
    const orders = await this.orderRepository.findAll();
    return orders.map(this.formatOrder);
  }

  @Get('vendor/:shopId')
  async findByShop(@Param('shopId') shopId: string) {
    const orders = await this.orderRepository.findByShopId(shopId);
    return orders.map(this.formatOrder);
  }

  @Patch(':id/ship')
  async markShipped(@Param('id') id: string) {
    const order = await this.orderRepository.findById(id);
    if (!order) throw new NotFoundException('Order not found');
    if (order.status !== 'PAID') throw new BadRequestException('Order must be PAID before shipping');
    order.status = 'SHIPPED';
    await this.orderRepository.save(order);
    return { message: 'Order marked as shipped' };
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
