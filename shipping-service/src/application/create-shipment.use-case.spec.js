const { CreateShipmentUseCase } = require('./create-shipment.use-case');

describe('CreateShipmentUseCase', () => {
  let useCase;
  let mockRepo;
  let mockPublisher;

  beforeEach(() => {
    mockRepo = { findByOrderId: jest.fn(), save: jest.fn() };
    mockPublisher = { publishOrderShipped: jest.fn() };
    useCase = new CreateShipmentUseCase(mockRepo, mockPublisher);
  });

  it('creates shipment for new order', async () => {
    mockRepo.findByOrderId.mockResolvedValue(null);

    const result = await useCase.execute('o1');

    expect(result.orderId).toBe('o1');
    expect(result.carrier).toBe('FedEx');
    expect(result.status).toBe('SHIPPED');
    expect(result.trackingNumber).toMatch(/^TRK-/);
    expect(mockRepo.save).toHaveBeenCalledTimes(1);
    expect(mockPublisher.publishOrderShipped).toHaveBeenCalledWith('o1', result.trackingNumber, 'FedEx');
  });

  it('returns existing shipment if already created', async () => {
    const existing = { id: 's1', orderId: 'o1', trackingNumber: 'TRK-EXISTING' };
    mockRepo.findByOrderId.mockResolvedValue(existing);

    const result = await useCase.execute('o1');

    expect(result).toBe(existing);
    expect(mockRepo.save).not.toHaveBeenCalled();
    expect(mockPublisher.publishOrderShipped).not.toHaveBeenCalled();
  });

  it('calls findByOrderId with correct order id', async () => {
    mockRepo.findByOrderId.mockResolvedValue(null);

    await useCase.execute('order-42');

    expect(mockRepo.findByOrderId).toHaveBeenCalledWith('order-42');
  });
});
