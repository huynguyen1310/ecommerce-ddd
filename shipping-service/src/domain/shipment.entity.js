class Shipment {
  constructor(id, orderId, trackingNumber, carrier, status, createdAt, updatedAt) {
    this.id = id;
    this.orderId = orderId;
    this.trackingNumber = trackingNumber;
    this.carrier = carrier; // e.g. 'FedEx'
    this.status = status; // SHIPPED | DELIVERED
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }
}

module.exports = { Shipment };
