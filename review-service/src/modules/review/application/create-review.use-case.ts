import { Injectable } from '@nestjs/common';
import { Review } from '../domain/review.entity';
import { TypeOrmReviewRepository } from '../infrastructure/persistence/review.repository';
import * as crypto from 'crypto';

@Injectable()
export class CreateReviewUseCase {
  constructor(
    private readonly reviewRepository: TypeOrmReviewRepository,
  ) {}

  async execute(input: { productId: string; customerId: string; rating: number; text: string }) {
    const id = crypto.randomUUID();
    const review = Review.create(id, input.productId, input.customerId, input.rating, input.text);
    await this.reviewRepository.save(review);

    return {
      id: review.id,
      productId: review.productId,
      customerId: review.customerId,
      rating: review.rating,
      text: review.text,
      createdAt: review.createdAt,
    };
  }
}
