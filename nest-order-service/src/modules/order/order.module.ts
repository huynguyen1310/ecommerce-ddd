import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrderOrmEntity } from './infrastructure/persistence/order.orm-entity';
import { TypeOrmOrderRepository } from './infrastructure/persistence/order.repository';
import { CreateOrderUseCase } from './application/create-order.use-case';
import { FindOrdersByCustomerUseCase } from './application/find-orders-by-customer.use-case';
import { RabbitMqOrderPublisher } from './infrastructure/messaging/rabbitmq-order-publisher';
import { RabbitMqOrderConsumer } from './infrastructure/messaging/rabbitmq-order-consumer';

import { OrderController } from './interface/order.controller';

@Module({
  imports: [TypeOrmModule.forFeature([OrderOrmEntity])],
  controllers: [OrderController],
  providers: [
    RabbitMqOrderConsumer,
    CreateOrderUseCase,
    FindOrdersByCustomerUseCase,
    {
      provide: 'IOrderRepository',
      useClass: TypeOrmOrderRepository,
    },
    {
      provide: 'IMessagePublisher',
      useClass: RabbitMqOrderPublisher,
    },
  ],
  exports: [CreateOrderUseCase],
})
export class OrderModule {}
