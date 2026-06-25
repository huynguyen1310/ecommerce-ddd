import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrderOrmEntity } from './infrastructure/persistence/order.orm-entity';
import { ReturnRequestOrmEntity } from './infrastructure/persistence/return-request.orm-entity';
import { CouponOrmEntity } from '../coupon/infrastructure/persistence/coupon.orm-entity';
import { TypeOrmOrderRepository } from './infrastructure/persistence/order.repository';
import { CreateOrderUseCase } from './application/create-order.use-case';
import { RabbitMqOrderPublisher } from './infrastructure/messaging/rabbitmq-order-publisher';
import { RabbitMqOrderConsumer } from './infrastructure/messaging/rabbitmq-order-consumer';
import { OrderController } from './interface/order.controller';

@Module({
  imports: [TypeOrmModule.forFeature([OrderOrmEntity, ReturnRequestOrmEntity, CouponOrmEntity])],
  controllers: [OrderController],
  providers: [
    RabbitMqOrderConsumer,
    CreateOrderUseCase,
    RabbitMqOrderPublisher,
    {
      provide: 'IOrderRepository',
      useClass: TypeOrmOrderRepository,
    },
  ],
  exports: [CreateOrderUseCase],
})
export class OrderModule {}
