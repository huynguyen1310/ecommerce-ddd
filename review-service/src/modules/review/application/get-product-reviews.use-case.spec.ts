import { GetProductReviewsUseCase } from './get-product-reviews.use-case';
import { IReviewRepository } from '../domain/review.repository.interface';
import { Review } from '../domain/review.entity';

describe('GetProductReviewsUseCase', () => {
  let useCase: GetProductReviewsUseCase;
  let mockRepo: jest.Mocked<IReviewRepository>;

  beforeEach(() => {
    mockRepo = {
      save: jest.fn(),
      findById: jest.fn(),
      findByProductId: jest.fn(),
      delete: jest.fn(),
    };
    useCase = new GetProductReviewsUseCase(mockRepo);
  });

  it('returns reviews for product', async () => {
    const reviews = [
      new Review('r1', 'p1', 'c1', 5, 'Great', new Date()),
      new Review('r2', 'p1', 'c2', 4, 'Good', new Date()),
    ];
    mockRepo.findByProductId.mockResolvedValue(reviews);

    const result = await useCase.execute('p1');

    expect(result).toHaveLength(2);
    expect(result[0].productId).toBe('p1');
  });

  it('returns empty array when no reviews', async () => {
    mockRepo.findByProductId.mockResolvedValue([]);

    const result = await useCase.execute('p1');

    expect(result).toEqual([]);
  });

  it('calls repository with correct product id', async () => {
    mockRepo.findByProductId.mockResolvedValue([]);

    await useCase.execute('p-42');

    expect(mockRepo.findByProductId).toHaveBeenCalledWith('p-42');
  });
});
