import { Controller, Post, Body, Get, Param, Patch, NotFoundException, BadRequestException, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateOrderUseCase } from '../application/create-order.use-case';
import { IOrderRepository } from '../domain/order.repository.interface';
import { ShippingAddress, OrderItem } from '../domain/order.entity';
import { ReturnRequestOrmEntity } from '../infrastructure/persistence/return-request.orm-entity';
import { RabbitMqOrderPublisher } from '../infrastructure/messaging/rabbitmq-order-publisher';
import * as crypto from 'crypto';

@Controller('orders')
export class OrderController {
  constructor(
    private readonly createOrderUseCase: CreateOrderUseCase,
    @Inject('IOrderRepository')
    private readonly orderRepository: IOrderRepository,
    @InjectRepository(ReturnRequestOrmEntity)
    private readonly returnRepo: Repository<ReturnRequestOrmEntity>,
    private readonly publisher: RabbitMqOrderPublisher,
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

  @Get(':id/return')
  async getReturnRequest(@Param('id') id: string) {
    const rr = await this.returnRepo.findOne({ where: { orderId: id } });
    if (!rr) throw new NotFoundException('No return request for this order');
    return rr;
  }

  @Post(':id/return')
  async requestReturn(@Param('id') id: string, @Body() body: { reason: string; buyerId: string }) {
    const order = await this.orderRepository.findById(id);
    if (!order) throw new NotFoundException('Order not found');
    if (order.status !== 'PAID' && order.status !== 'SHIPPED') throw new BadRequestException('Can only return paid or shipped orders');
    const existing = await this.returnRepo.findOne({ where: { orderId: id } });
    if (existing) throw new BadRequestException('Return already requested for this order');

    const rr = this.returnRepo.create({
      id: crypto.randomUUID(),
      orderId: id,
      shopId: order.items[0]?.shopId || 'unknown',
      buyerId: body.buyerId,
      reason: body.reason,
      status: 'pending',
      refundAmount: order.total,
    });
    await this.returnRepo.save(rr);
    await this.publisher.publishRefundCreated(rr, order.customerId);
    return rr;
  }

  @Patch(':id/return/approve')
  async approveReturn(@Param('id') id: string) {
    const rr = await this.returnRepo.findOne({ where: { orderId: id } });
    if (!rr) throw new NotFoundException('No return request for this order');
    if (rr.status !== 'pending') throw new BadRequestException('Return is not pending');
    rr.status = 'approved';
    await this.returnRepo.save(rr);
    return rr;
  }

  @Patch(':id/return/reject')
  async rejectReturn(@Param('id') id: string, @Body() body: { reason: string }) {
    const rr = await this.returnRepo.findOne({ where: { orderId: id } });
    if (!rr) throw new NotFoundException('No return request for this order');
    if (rr.status !== 'pending') throw new BadRequestException('Return is not pending');
    rr.status = 'rejected';
    rr.rejectionReason = body.reason;
    await this.returnRepo.save(rr);
    return rr;
  }

  @Get('admin/returns')
  async adminListReturns() {
    return this.returnRepo.find({ order: { createdAt: 'DESC' } });
  }

  @Post('admin/returns/:id/force-refund')
  async adminForceRefund(@Param('id') id: string) {
    const rr = await this.returnRepo.findOne({ where: { id } });
    if (!rr) throw new NotFoundException('Return request not found');
    if (rr.status === 'refunded') throw new BadRequestException('Already refunded');
    rr.status = 'refunded';
    await this.returnRepo.save(rr);

    const order = await this.orderRepository.findById(rr.orderId);
    if (order) {
      order.status = 'REFUNDED';
      await this.orderRepository.save(order);
    }
    const items = order?.items.map(i => ({ product_id: i.productId, quantity: i.quantity })) || [];
    await this.publisher.publishRefundCompleted(rr.orderId, Number(rr.refundAmount), items);
    return rr;
  }
}
