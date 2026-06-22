import { NotFoundException, ForbiddenException } from '@nestjs/common';
import { DeleteReviewUseCase } from './delete-review.use-case';
import { IReviewRepository } from '../domain/review.repository.interface';
import { Review } from '../domain/review.entity';

describe('DeleteReviewUseCase', () => {
  let useCase: DeleteReviewUseCase;
  let mockRepo: jest.Mocked<IReviewRepository>;

  beforeEach(() => {
    mockRepo = {
      save: jest.fn(),
      findById: jest.fn(),
      findByProductId: jest.fn(),
      delete: jest.fn(),
    };
    useCase = new DeleteReviewUseCase(mockRepo);
  });

  it('deletes own review', async () => {
    const review = new Review('r1', 'p1', 'c1', 5, 'Great', new Date());
    mockRepo.findById.mockResolvedValue(review);

    await useCase.execute('r1', 'c1', 'customer');

    expect(mockRepo.delete).toHaveBeenCalledWith('r1');
  });

  it('allows admin to delete any review', async () => {
    const review = new Review('r1', 'p1', 'c2', 3, 'Meh', new Date());
    mockRepo.findById.mockResolvedValue(review);

    await useCase.execute('r1', 'admin-1', 'admin');

    expect(mockRepo.delete).toHaveBeenCalledWith('r1');
  });

  it('throws ForbiddenException when non-owner deletes', async () => {
    const review = new Review('r1', 'p1', 'owner-1', 4, 'Nice', new Date());
    mockRepo.findById.mockResolvedValue(review);

    await expect(
      useCase.execute('r1', 'other-user', 'customer'),
    ).rejects.toThrow(ForbiddenException);

    expect(mockRepo.delete).not.toHaveBeenCalled();
  });

  it('throws NotFoundException when review missing', async () => {
    mockRepo.findById.mockResolvedValue(null);

    await expect(
      useCase.execute('nonexistent', 'u1', 'admin'),
    ).rejects.toThrow(NotFoundException);

    expect(mockRepo.delete).not.toHaveBeenCalled();
  });
});
