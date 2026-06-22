import { Inject, Injectable } from '@nestjs/common';
import { IReviewRepository } from '../domain/review.repository.interface';
import { ReviewDto } from './dtos/review.dto';

@Injectable()
export class GetProductReviewsUseCase {
  constructor(
    @Inject('IReviewRepository')
    private readonly reviewRepository: IReviewRepository,
  ) {}

  async execute(productId: string): Promise<ReviewDto[]> {
    const reviews = await this.reviewRepository.findByProductId(productId);
    return reviews.map(review => ({
      id: review.id,
      productId: review.productId,
      customerId: review.customerId,
      rating: review.rating,
      text: review.text,
      createdAt: review.createdAt,
    }));
  }
}
