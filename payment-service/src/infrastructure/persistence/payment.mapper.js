const { Payment } = require('../../domain/payment.entity');

class PaymentMapper {
  static toDomain(row) {
    if (!row) return null;
    return new Payment(
      row.id,
      row.order_id,
      row.status,
      row.transaction_id,
      parseFloat(row.amount),
      row.items,
      row.created_at,
      row.updated_at
    );
  }

  static toPersistence(payment) {
    return {
      id: payment.id,
      order_id: payment.orderId,
      status: payment.status,
      transaction_id: payment.transactionId,
      amount: payment.amount,
      items: JSON.stringify(payment.items),
    };
  }
}

module.exports = { PaymentMapper };
