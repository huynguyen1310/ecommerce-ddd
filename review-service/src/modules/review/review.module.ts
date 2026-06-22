import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReviewOrmEntity } from './infrastructure/persistence/review.orm-entity';
import { TypeOrmReviewRepository } from './infrastructure/persistence/review.repository';
import { CreateReviewUseCase } from './application/create-review.use-case';
import { GetProductReviewsUseCase } from './application/get-product-reviews.use-case';
import { DeleteReviewUseCase } from './application/delete-review.use-case';
import { ReviewController } from './interface/review.controller';

@Module({
  imports: [TypeOrmModule.forFeature([ReviewOrmEntity])],
  controllers: [ReviewController],
  providers: [
    CreateReviewUseCase,
    GetProductReviewsUseCase,
    DeleteReviewUseCase,
    {
      provide: 'IReviewRepository',
      useClass: TypeOrmReviewRepository,
    },
  ],
})
export class ReviewModule {}
