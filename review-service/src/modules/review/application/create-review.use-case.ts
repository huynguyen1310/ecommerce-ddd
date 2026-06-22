import { Inject, Injectable } from '@nestjs/common';
import { IReviewRepository } from '../domain/review.repository.interface';
import { Review } from '../domain/review.entity';
import { CreateReviewDto } from './dtos/create-review.dto';
import { ReviewDto } from './dtos/review.dto';
import * as crypto from 'crypto';

@Injectable()
export class CreateReviewUseCase {
  constructor(
    @Inject('IReviewRepository')
    private readonly reviewRepository: IReviewRepository,
  ) {}

  async execute(input: CreateReviewDto): Promise<ReviewDto> {
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
