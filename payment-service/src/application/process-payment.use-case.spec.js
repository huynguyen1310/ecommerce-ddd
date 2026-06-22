const crypto = require('crypto');
const { ProcessPaymentUseCase } = require('./process-payment.use-case');

describe('ProcessPaymentUseCase', () => {
  let useCase;
  let mockRepo;
  let mockPublisher;

  beforeEach(() => {
    mockRepo = { findByOrderId: jest.fn(), save: jest.fn() };
    mockPublisher = { publishCompleted: jest.fn(), publishFailed: jest.fn() };
    useCase = new ProcessPaymentUseCase(mockRepo, mockPublisher);
  });

  it('processes successful payment', async () => {
    mockRepo.findByOrderId.mockResolvedValue({ orderId: 'o1', status: 'PENDING', items: [] });

    const result = await useCase.execute({ orderId: 'o1', status: 'SUCCESS' });

    expect(result).toEqual({ message: 'Payment SUCCESS processed' });
    expect(mockRepo.save).toHaveBeenCalledTimes(1);
    const saved = mockRepo.save.mock.calls[0][0];
    expect(saved.status).toBe('COMPLETED');
    expect(saved.transactionId).toMatch(/^TXN-/);
    expect(mockPublisher.publishCompleted).toHaveBeenCalledWith('o1', expect.any(String));
  });

  it('processes failed payment', async () => {
    mockRepo.findByOrderId.mockResolvedValue({ orderId: 'o1', status: 'PENDING', items: ['item1'] });

    const result = await useCase.execute({ orderId: 'o1', status: 'FAILURE' });

    expect(result).toEqual({ message: 'Payment FAILURE processed' });
    expect(mockRepo.save).toHaveBeenCalledTimes(1);
    const saved = mockRepo.save.mock.calls[0][0];
    expect(saved.status).toBe('FAILED');
    expect(mockPublisher.publishFailed).toHaveBeenCalledWith('o1', ['item1']);
    expect(mockPublisher.publishCompleted).not.toHaveBeenCalled();
  });

  it('throws PAYMENT_NOT_FOUND when payment missing', async () => {
    mockRepo.findByOrderId.mockResolvedValue(null);

    await expect(
      useCase.execute({ orderId: 'missing', status: 'SUCCESS' }),
    ).rejects.toMatchObject({ code: 'PAYMENT_NOT_FOUND' });
  });

  it('throws PAYMENT_ALREADY_PROCESSED when not PENDING', async () => {
    mockRepo.findByOrderId.mockResolvedValue({ orderId: 'o1', status: 'COMPLETED' });

    await expect(
      useCase.execute({ orderId: 'o1', status: 'SUCCESS' }),
    ).rejects.toMatchObject({ code: 'PAYMENT_ALREADY_PROCESSED' });

    expect(mockRepo.save).not.toHaveBeenCalled();
  });
});
