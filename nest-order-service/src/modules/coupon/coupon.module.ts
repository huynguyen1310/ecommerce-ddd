import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CouponOrmEntity } from './infrastructure/persistence/coupon.orm-entity';
import { CouponController } from './interface/coupon.controller';

@Module({
  imports: [TypeOrmModule.forFeature([CouponOrmEntity])],
  controllers: [CouponController],
})
export class CouponModule {}
