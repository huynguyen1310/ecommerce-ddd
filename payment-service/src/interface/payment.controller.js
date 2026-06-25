class PaymentController {
  constructor(processPaymentUseCase, paymentRepository, publisher) {
    this.processPaymentUseCase = processPaymentUseCase;
    this.paymentRepository = paymentRepository;
    this.publisher = publisher;
  }

  async process(req, res) {
    const dto = { orderId: req.params.orderId, status: req.body.status };
    try {
      const result = await this.processPaymentUseCase.execute(dto);
      res.json(result);
    } catch (err) {
      if (err.code === 'PAYMENT_NOT_FOUND') {
        return res.status(404).json({ error: err.message });
      }
      if (err.code === 'PAYMENT_ALREADY_PROCESSED') {
        return res.status(409).json({ error: err.message });
      }
      console.error('Process payment error:', err.message);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async getByOrder(req, res) {
    const payment = await this.paymentRepository.findByOrderId(req.params.orderId);
    if (!payment) {
      return res.status(404).json({ error: 'Order not found' });
    }
    res.json({
      id: payment.id,
      order_id: payment.orderId,
      status: payment.status,
      transaction_id: payment.transactionId,
      amount: payment.amount,
      items: payment.items,
      created_at: payment.createdAt,
      updated_at: payment.updatedAt,
    });
  }

  async refund(req, res) {
    const payment = await this.paymentRepository.findByOrderId(req.params.orderId);
    if (!payment) {
      return res.status(404).json({ error: 'Payment not found' });
    }
    if (payment.status === 'REFUNDED') {
      return res.status(409).json({ error: 'Already refunded' });
    }
    payment.status = 'REFUNDED';
    payment.transactionId = 'refund_' + require('crypto').randomUUID();
    await this.paymentRepository.save(payment);

    if (this.publisher && this.publisher.channel) {
      await this.publisher.publish('refund.completed', {
        event_id: require('crypto').randomUUID(),
        occurred_at: new Date().toISOString(),
        data: { order_id: payment.orderId, amount: payment.amount },
      });
    }
    res.json({ message: 'Refund processed', payment });
  }
}

module.exports = { PaymentController };
