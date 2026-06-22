const crypto = require('crypto');

class ProcessPaymentUseCase {
  constructor(paymentRepository, publisher) {
    this.paymentRepository = paymentRepository;
    this.publisher = publisher;
  }

  async execute(dto) {
    const payment = await this.paymentRepository.findByOrderId(dto.orderId);
    if (!payment) {
      const error = new Error('Order not ready for payment or not found');
      error.code = 'PAYMENT_NOT_FOUND';
      throw error;
    }

    if (payment.status !== 'PENDING') {
      const error = new Error('Payment already processed');
      error.code = 'PAYMENT_ALREADY_PROCESSED';
      throw error;
    }

    if (dto.status === 'SUCCESS') {
      const transactionId = `TXN-${crypto.randomUUID().slice(0, 8).toUpperCase()}`;
      payment.status = 'COMPLETED';
      payment.transactionId = transactionId;
      await this.paymentRepository.save(payment);
      this.publisher.publishCompleted(dto.orderId, transactionId);
    } else {
      payment.status = 'FAILED';
      await this.paymentRepository.save(payment);
      this.publisher.publishFailed(dto.orderId, payment.items);
    }

    return { message: `Payment ${dto.status} processed` };
  }
}

module.exports = { ProcessPaymentUseCase };
