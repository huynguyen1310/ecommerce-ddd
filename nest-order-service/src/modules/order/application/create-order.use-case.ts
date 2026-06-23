import { Inject, Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IOrderRepository } from '../domain/order.repository.interface';
import { Order, ShippingAddress } from '../domain/order.entity';
import { RabbitMqOrderPublisher } from '../infrastructure/messaging/rabbitmq-order-publisher';
import { CouponOrmEntity } from '../../coupon/infrastructure/persistence/coupon.orm-entity';
import * as crypto from 'crypto';

@Injectable()
export class CreateOrderUseCase {
  constructor(
    @Inject('IOrderRepository')
    private readonly orderRepository: IOrderRepository,
    private readonly messagePublisher: RabbitMqOrderPublisher,
    @InjectRepository(CouponOrmEntity)
    private readonly couponRepo: Repository<CouponOrmEntity>,
  ) {}

  async execute(input: { customerId: string; customerEmail?: string; items: Array<{ productId: string; quantity: number; price: number }>; shippingAddress?: ShippingAddress; couponCode?: string }) {
    const id = crypto.randomUUID();
    let discount: number | undefined;
    let couponCode: string | undefined;

    if (input.couponCode) {
      const subtotal = input.items.reduce((sum, i) => sum + i.price * i.quantity, 0);
      const result = await this.applyCoupon(input.couponCode, subtotal);
      discount = result.discount;
      couponCode = result.code;
    }

    const order = Order.create(id, input.customerId, input.items, input.shippingAddress, couponCode, discount);
    await this.orderRepository.save(order);

    await this.messagePublisher.publishOrderCreated(order, input.customerEmail);

    return {
      id: order.id,
      customerId: order.customerId,
      total: order.total,
      status: order.status,
      shippingAddress: order.shippingAddress,
      couponCode: order.couponCode,
      discount: order.discount,
      items: order.items.map(item => ({
        productId: item.productId,
        quantity: item.quantity,
        price: item.price,
      })),
      createdAt: order.createdAt,
    };
  }

  private async applyCoupon(code: string, subtotal: number): Promise<{ code: string; discount: number }> {
    const coupon = await this.couponRepo.findOneBy({ code: code.toUpperCase() });
    if (!coupon) throw new NotFoundException('Coupon not found');
    if (!coupon.isActive) throw new BadRequestException('Coupon is inactive');
    if (coupon.expiresAt && new Date(coupon.expiresAt) < new Date()) throw new BadRequestException('Coupon has expired');
    if (coupon.maxUses > 0 && coupon.usedCount >= coupon.maxUses) throw new BadRequestException('Coupon usage limit reached');
    if (coupon.minOrderAmount && subtotal < coupon.minOrderAmount) throw new BadRequestException(`Minimum order amount $${coupon.minOrderAmount} not met`);

    const discount = coupon.discountType === 'PERCENTAGE'
      ? Math.round(subtotal * (coupon.discountValue / 100) * 100) / 100
      : Math.min(coupon.discountValue, subtotal);

    await this.couponRepo.update(coupon.id, { usedCount: coupon.usedCount + 1 });

    return { code: coupon.code, discount };
  }
}
