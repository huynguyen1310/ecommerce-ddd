class ProcessPaymentDto {
  constructor(orderId, status) {
    this.orderId = orderId;
    this.status = status; // 'SUCCESS' | 'FAILURE'
  }
}

module.exports = { ProcessPaymentDto };
