class PaymentController {
  constructor(processPaymentUseCase, paymentRepository) {
    this.processPaymentUseCase = processPaymentUseCase;
    this.paymentRepository = paymentRepository;
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
}

module.exports = { PaymentController };
