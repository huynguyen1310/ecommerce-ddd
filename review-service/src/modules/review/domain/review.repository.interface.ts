import { Review } from './review.entity';

export interface IReviewRepository {
  save(review: Review): Promise<void>;
  findById(id: string): Promise<Review | null>;
  findByProductId(productId: string): Promise<Review[]>;
  delete(id: string): Promise<void>;
}
