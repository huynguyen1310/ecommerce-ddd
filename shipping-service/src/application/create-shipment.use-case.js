const crypto = require('crypto');
const { Shipment } = require('../domain/shipment.entity');

class CreateShipmentUseCase {
  constructor(shipmentRepository, publisher) {
    this.shipmentRepository = shipmentRepository;
    this.publisher = publisher;
  }

  async execute(orderId) {
    const existing = await this.shipmentRepository.findByOrderId(orderId);
    if (existing) {
      console.log('Shipment already exists for order:', orderId);
      return existing;
    }

    const trackingNumber = `TRK-${crypto.randomUUID().slice(0, 10).toUpperCase()}`;
    const shipment = new Shipment(null, orderId, trackingNumber, 'FedEx', 'SHIPPED', new Date(), new Date());
    await this.shipmentRepository.save(shipment);

    await this.publisher.publishOrderShipped(orderId, shipment.trackingNumber, shipment.carrier);
    console.log('Shipment created for order:', orderId, 'tracking:', trackingNumber);

    return shipment;
  }
}

module.exports = { CreateShipmentUseCase };
