import { NotFoundException } from '@nestjs/common';
import { FindOrderByIdUseCase } from './find-order-by-id.use-case';
import { IOrderRepository } from '../domain/order.repository.interface';
import { Order } from '../domain/order.entity';

describe('FindOrderByIdUseCase', () => {
  let useCase: FindOrderByIdUseCase;
  let mockRepo: jest.Mocked<IOrderRepository>;

  beforeEach(() => {
    mockRepo = { save: jest.fn(), findById: jest.fn(), findByCustomerId: jest.fn() };
    useCase = new FindOrderByIdUseCase(mockRepo);
  });

  it('returns order dto when found', async () => {
    const order = new Order(
      'order-1', 'cust-1',
      [{ productId: 'p1', quantity: 2, price: 10 }],
      'PAID', 20, new Date('2026-01-01'),
    );
    mockRepo.findById.mockResolvedValue(order);

    const result = await useCase.execute('order-1');

    expect(result.id).toBe('order-1');
    expect(result.customerId).toBe('cust-1');
    expect(result.total).toBe(20);
    expect(result.status).toBe('PAID');
    expect(result.items).toHaveLength(1);
  });

  it('throws NotFoundException when order missing', async () => {
    mockRepo.findById.mockResolvedValue(null);

    await expect(useCase.execute('missing-id')).rejects.toThrow(NotFoundException);
  });

  it('calls repository with correct id', async () => {
    mockRepo.findById.mockResolvedValue(
      new Order('o1', 'c1', [], 'PENDING', 0, new Date()),
    );

    await useCase.execute('o1');

    expect(mockRepo.findById).toHaveBeenCalledWith('o1');
  });
});
