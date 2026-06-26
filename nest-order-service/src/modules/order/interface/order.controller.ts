import { Controller, Post, Body, Get, Param, Patch, NotFoundException, BadRequestException, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateOrderUseCase } from '../application/create-order.use-case';
import { IOrderRepository } from '../domain/order.repository.interface';
import { Order, ShippingAddress, OrderItem, canTransition } from '../domain/order.entity';
import { ReturnRequestOrmEntity } from '../infrastructure/persistence/return-request.orm-entity';
import { SubOrderOrmEntity } from '../infrastructure/persistence/sub-order.orm-entity';
import { RabbitMqOrderPublisher } from '../infrastructure/messaging/rabbitmq-order-publisher';
import { OrderScheduler } from '../infrastructure/order-scheduler';
import * as crypto from 'crypto';

@Controller('orders')
export class OrderController {
  constructor(
    private readonly createOrderUseCase: CreateOrderUseCase,
    @Inject('IOrderRepository')
    private readonly orderRepository: IOrderRepository,
    @InjectRepository(ReturnRequestOrmEntity)
    private readonly returnRepo: Repository<ReturnRequestOrmEntity>,
    @InjectRepository(SubOrderOrmEntity)
    private readonly subOrderRepo: Repository<SubOrderOrmEntity>,
    private readonly publisher: RabbitMqOrderPublisher,
    private readonly scheduler: OrderScheduler,
  ) {}

  @Post()
  async create(@Body() body: { customerId: string; customerEmail?: string; items: OrderItem[]; shippingAddress?: ShippingAddress; couponCode?: string }) {
    return await this.createOrderUseCase.execute(body);
  }

  private async formatOrder(order: Order) {
    const subOrders = await this.subOrderRepo.find({ where: { orderId: order.id } });
    const parentStatus = order.status;
    return {
      id: order.id, customerId: order.customerId, total: order.total,
      status: parentStatus,
      shippingAddress: order.shippingAddress,
      couponCode: order.couponCode,
      discount: order.discount ? Number(order.discount) : undefined,
      items: order.items.map(i => ({ productId: i.productId, quantity: i.quantity, price: i.price, shopId: i.shopId })),
      subOrders: subOrders.map(s => ({
        id: s.id, shopId: s.shopId, status: s.status, total: Number(s.total),
        items: s.items, trackingNumber: s.trackingNumber, carrier: s.carrier,
        shippedAt: s.shippedAt, deliveredAt: s.deliveredAt,
      })),
      createdAt: order.createdAt,
    };
  }

  @Get()
  async findAll() {
    const orders = await this.orderRepository.findAll();
    return Promise.all(orders.map(o => this.formatOrder(o)));
  }

  @Get('vendor/:shopId')
  async findByShop(@Param('shopId') shopId: string) {
    const subOrders = await this.subOrderRepo.find({
      where: { shopId },
      order: { createdAt: 'DESC' },
    });
    return Promise.all(subOrders.map(async s => {
      const order = await this.orderRepository.findById(s.orderId);
      return { ...s, customerEmail: order?.customerId };
    }));
  }

  @Get('vendor/:shopId/sub-orders')
  async vendorSubOrders(@Param('shopId') shopId: string) {
    return this.subOrderRepo.find({
      where: { shopId },
      order: { createdAt: 'DESC' },
    });
  }

  @Patch(':id/sub-orders/:subId/ship')
  async shipSubOrder(@Param('id') id: string, @Param('subId') subId: string, @Body() body: { trackingNumber?: string; carrier?: string }) {
    const sub = await this.subOrderRepo.findOne({ where: { id: subId, orderId: id } });
    if (!sub) throw new NotFoundException('Sub-order not found');
    if (sub.status !== 'PROCESSING' && sub.status !== 'CONFIRMED') throw new BadRequestException('Sub-order must be confirmed/processing before shipping');
    sub.status = 'SHIPPED';
    sub.trackingNumber = body.trackingNumber;
    sub.carrier = body.carrier;
    sub.shippedAt = new Date();
    await this.subOrderRepo.save(sub);
    return sub;
  }

  @Patch(':id/status')
  async transitionStatus(@Param('id') id: string, @Body() body: { status: string }) {
    const order = await this.orderRepository.findById(id);
    if (!order) throw new NotFoundException('Order not found');
    if (!canTransition(order.status, body.status as any)) {
      throw new BadRequestException(`Cannot transition from ${order.status} to ${body.status}`);
    }
    order.status = body.status as any;
    await this.orderRepository.save(order);
    await this.publisher.publishStatusChanged(id, order.status, body.status);
    return this.formatOrder(order);
  }

  @Patch(':id/confirm-delivery')
  async confirmDelivery(@Param('id') id: string) {
    const order = await this.orderRepository.findById(id);
    if (!order) throw new NotFoundException('Order not found');

    const subs = await this.subOrderRepo.find({ where: { orderId: id } });
    const hasShipped = subs.some(s => s.status === 'SHIPPED');
    if (!hasShipped) throw new BadRequestException('No shipped sub-orders to confirm');

    if (canTransition(order.status, 'DELIVERED')) {
      order.status = 'DELIVERED';
      await this.orderRepository.save(order);
    }

    for (const sub of subs) {
      if (sub.status === 'SHIPPED') {
        sub.status = 'DELIVERED';
        sub.deliveredAt = new Date();
        await this.subOrderRepo.save(sub);
      }
    }
    return this.formatOrder(order);
  }

  @Patch(':id/ship')
  async markShipped(@Param('id') id: string) {
    const order = await this.orderRepository.findById(id);
    if (!order) throw new NotFoundException('Order not found');
    if (order.status !== 'PROCESSING' && order.status !== 'CONFIRMED') throw new BadRequestException('Order must be CONFIRMED or PROCESSING before shipping');
    order.status = 'SHIPPED';
    await this.orderRepository.save(order);
    return this.formatOrder(order);
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
    return Promise.all(orders.map(o => this.formatOrder(o)));
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
    if (order.status !== 'SHIPPED' && order.status !== 'DELIVERED' && order.status !== 'CONFIRMED' && order.status !== 'PROCESSING') throw new BadRequestException('Order not eligible for return');
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

  @Post('admin/auto-deliver')
  async autoDeliver() {
    const affected = await this.scheduler.autoDeliver();
    return { affected, message: `Auto-delivered ${affected} sub-orders` };
  }

  @Post('admin/auto-complete')
  async autoComplete() {
    const affected = await this.scheduler.autoComplete();
    return { affected, message: `Auto-completed ${affected} sub-orders` };
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
