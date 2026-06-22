import { Inject, Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { IReviewRepository } from '../domain/review.repository.interface';

@Injectable()
export class DeleteReviewUseCase {
  constructor(
    @Inject('IReviewRepository')
    private readonly reviewRepository: IReviewRepository,
  ) {}

  async execute(id: string, requestingUserId: string, requestingUserRole: string): Promise<void> {
    const review = await this.reviewRepository.findById(id);
    if (!review) {
      throw new NotFoundException('Review not found');
    }

    if (requestingUserRole !== 'admin' && review.customerId !== requestingUserId) {
      throw new ForbiddenException('You can only delete your own reviews');
    }

    await this.reviewRepository.delete(id);
  }
}
