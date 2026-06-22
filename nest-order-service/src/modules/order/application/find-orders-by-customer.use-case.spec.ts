import { FindOrdersByCustomerUseCase } from './find-orders-by-customer.use-case';
import { IOrderRepository } from '../domain/order.repository.interface';
import { Order } from '../domain/order.entity';

describe('FindOrdersByCustomerUseCase', () => {
  let useCase: FindOrdersByCustomerUseCase;
  let mockRepo: jest.Mocked<IOrderRepository>;

  beforeEach(() => {
    mockRepo = { save: jest.fn(), findById: jest.fn(), findByCustomerId: jest.fn() };
    useCase = new FindOrdersByCustomerUseCase(mockRepo);
  });

  it('returns orders for customer', async () => {
    const orders = [
      new Order('o1', 'cust-1', [{ productId: 'p1', quantity: 1, price: 10 }], 'PENDING', 10, new Date()),
      new Order('o2', 'cust-1', [{ productId: 'p2', quantity: 2, price: 20 }], 'SHIPPED', 40, new Date()),
    ];
    mockRepo.findByCustomerId.mockResolvedValue(orders);

    const result = await useCase.execute('cust-1');

    expect(result).toHaveLength(2);
    expect(result[0].id).toBe('o1');
    expect(result[1].id).toBe('o2');
  });

  it('returns empty array when no orders', async () => {
    mockRepo.findByCustomerId.mockResolvedValue([]);

    const result = await useCase.execute('nonexistent');

    expect(result).toEqual([]);
  });

  it('calls repository with correct customer id', async () => {
    mockRepo.findByCustomerId.mockResolvedValue([]);

    await useCase.execute('cust-42');

    expect(mockRepo.findByCustomerId).toHaveBeenCalledWith('cust-42');
  });
});
