import { Controller, Post, Body, Get, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan } from 'typeorm';
import { CouponOrmEntity } from '../infrastructure/persistence/coupon.orm-entity';

@Controller('coupons')
export class CouponController {
  constructor(
    @InjectRepository(CouponOrmEntity)
    private readonly repo: Repository<CouponOrmEntity>,
  ) {}

  @Post('validate')
  async validate(@Body() body: { code: string; orderTotal: number }) {
    const coupon = await this.repo.findOneBy({ code: body.code.toUpperCase() });
    if (!coupon) throw new NotFoundException('Coupon not found');
    if (!coupon.isActive) throw new BadRequestException('Coupon is inactive');
    if (coupon.expiresAt && new Date(coupon.expiresAt) < new Date()) throw new BadRequestException('Coupon has expired');
    if (coupon.maxUses > 0 && coupon.usedCount >= coupon.maxUses) throw new BadRequestException('Coupon usage limit reached');
    if (coupon.minOrderAmount && body.orderTotal < coupon.minOrderAmount) throw new BadRequestException(`Minimum order amount $${coupon.minOrderAmount} not met`);

    const discount = coupon.discountType === 'PERCENTAGE'
      ? Math.round(body.orderTotal * (coupon.discountValue / 100) * 100) / 100
      : Math.min(coupon.discountValue, body.orderTotal);

    return { code: coupon.code, discountType: coupon.discountType, discountValue: coupon.discountValue, discount, finalTotal: Math.round((body.orderTotal - discount) * 100) / 100 };
  }

  @Get()
  async findAll() {
    return this.repo.find({ order: { createdAt: 'DESC' } });
  }

  @Post()
  async create(@Body() body: { code: string; discountType: string; discountValue: number; minOrderAmount?: number; maxUses?: number; expiresAt?: string }) {
    const existing = await this.repo.findOneBy({ code: body.code.toUpperCase() });
    if (existing) throw new BadRequestException('Coupon code already exists');
    const coupon = this.repo.create({ ...body, code: body.code.toUpperCase() });
    return this.repo.save(coupon);
  }
}
