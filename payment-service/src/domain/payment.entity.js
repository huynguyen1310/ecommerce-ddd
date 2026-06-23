class Payment {
  constructor(id, orderId, status, transactionId, amount, items, createdAt, updatedAt, customerEmail, shippingAddress) {
    this.id = id;
    this.orderId = orderId;
    this.status = status; // PENDING | COMPLETED | FAILED
    this.transactionId = transactionId;
    this.amount = amount;
    this.items = items; // [{ productId, quantity }]
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
    this.customerEmail = customerEmail;
    this.shippingAddress = shippingAddress;
  }
}

module.exports = { Payment };
