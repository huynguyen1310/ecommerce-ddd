class PaymentRepository {
  async save(payment) { throw new Error('Not implemented'); }
  async findByOrderId(orderId) { throw new Error('Not implemented'); }
  async findByOrderIdOrFail(orderId) { throw new Error('Not implemented'); }
}

module.exports = { PaymentRepository };
