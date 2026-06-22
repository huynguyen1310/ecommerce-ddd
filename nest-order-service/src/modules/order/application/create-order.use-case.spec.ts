import { CreateOrderUseCase } from './create-order.use-case';
import { IOrderRepository } from '../domain/order.repository.interface';
import { IMessagePublisher } from '../domain/ports/message-publisher.interface';

describe('CreateOrderUseCase', () => {
  let useCase: CreateOrderUseCase;
  let mockRepo: jest.Mocked<IOrderRepository>;
  let mockPublisher: jest.Mocked<IMessagePublisher>;

  beforeEach(() => {
    mockRepo = { save: jest.fn(), findById: jest.fn(), findByCustomerId: jest.fn() };
    mockPublisher = { publishOrderCreated: jest.fn() };
    useCase = new CreateOrderUseCase(mockRepo, mockPublisher);
  });

  it('creates order with valid input', async () => {
    const input = {
      customerId: 'cust-1',
      items: [{ productId: 'p1', quantity: 2, price: 10 }],
    };

    const result = await useCase.execute(input);

    expect(result.customerId).toBe('cust-1');
    expect(result.status).toBe('PENDING');
    expect(result.total).toBe(20);
    expect(result.items).toHaveLength(1);
    expect(result.id).toBeDefined();
    expect(result.createdAt).toBeInstanceOf(Date);
  });

  it('saves order to repository', async () => {
    const input = {
      customerId: 'cust-1',
      items: [{ productId: 'p1', quantity: 1, price: 50 }],
    };

    await useCase.execute(input);

    expect(mockRepo.save).toHaveBeenCalledTimes(1);
    const saved = mockRepo.save.mock.calls[0][0];
    expect(saved.customerId).toBe('cust-1');
    expect(saved.status).toBe('PENDING');
  });

  it('publishes order created event', async () => {
    const input = {
      customerId: 'cust-1',
      items: [{ productId: 'p1', quantity: 1, price: 50 }],
    };

    await useCase.execute(input);

    expect(mockPublisher.publishOrderCreated).toHaveBeenCalledTimes(1);
    const published = mockPublisher.publishOrderCreated.mock.calls[0][0];
    expect(published.customerId).toBe('cust-1');
  });

  it('generates unique id per call', async () => {
    const input = {
      customerId: 'cust-1',
      items: [{ productId: 'p1', quantity: 1, price: 10 }],
    };

    const r1 = await useCase.execute(input);
    const r2 = await useCase.execute(input);

    expect(r1.id).not.toBe(r2.id);
  });

  it('throws when repo save fails', async () => {
    mockRepo.save.mockRejectedValue(new Error('DB error'));

    const input = {
      customerId: 'cust-1',
      items: [{ productId: 'p1', quantity: 1, price: 10 }],
    };

    await expect(useCase.execute(input)).rejects.toThrow('DB error');
    expect(mockPublisher.publishOrderCreated).not.toHaveBeenCalled();
  });
});
