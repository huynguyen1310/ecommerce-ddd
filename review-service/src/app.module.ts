import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReviewModule } from './modules/review/review.module';
import { ReviewOrmEntity } from './modules/review/infrastructure/persistence/review.orm-entity';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT, 10) || 5432,
      username: process.env.DB_USER || 'user',
      password: process.env.DB_PASS || 'password',
      database: process.env.DB_NAME || 'review_service',
      entities: [ReviewOrmEntity],
      synchronize: true,
    }),
    ReviewModule,
  ],
})
export class AppModule {}
