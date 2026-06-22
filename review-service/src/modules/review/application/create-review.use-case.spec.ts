import { CreateReviewUseCase } from './create-review.use-case';
import { IReviewRepository } from '../domain/review.repository.interface';

describe('CreateReviewUseCase', () => {
  let useCase: CreateReviewUseCase;
  let mockRepo: jest.Mocked<IReviewRepository>;

  beforeEach(() => {
    mockRepo = {
      save: jest.fn(),
      findById: jest.fn(),
      findByProductId: jest.fn(),
      delete: jest.fn(),
    };
    useCase = new CreateReviewUseCase(mockRepo);
  });

  it('creates and saves review', async () => {
    const input = { productId: 'p1', customerId: 'c1', rating: 5, text: 'Amazing!' };

    const result = await useCase.execute(input);

    expect(result.productId).toBe('p1');
    expect(result.customerId).toBe('c1');
    expect(result.rating).toBe(5);
    expect(result.text).toBe('Amazing!');
    expect(result.id).toBeDefined();
    expect(result.createdAt).toBeInstanceOf(Date);
    expect(mockRepo.save).toHaveBeenCalledTimes(1);
  });

  it('generates unique ids', async () => {
    const input = { productId: 'p1', customerId: 'c1', rating: 3, text: 'OK' };

    const r1 = await useCase.execute(input);
    const r2 = await useCase.execute(input);

    expect(r1.id).not.toBe(r2.id);
  });
});
