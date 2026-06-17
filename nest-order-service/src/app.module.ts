import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrderModule } from './modules/order/order.module';
import { OrderOrmEntity } from './modules/order/infrastructure/persistence/order.orm-entity';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT, 10) || 5432,
      username: process.env.DB_USER || 'user',
      password: process.env.DB_PASS || 'password',
      database: process.env.DB_NAME || 'order_service',
      entities: [OrderOrmEntity],
      synchronize: true, // Note: Use migrations in production
    }),
    OrderModule,
  ],
})
export class AppModule {}
