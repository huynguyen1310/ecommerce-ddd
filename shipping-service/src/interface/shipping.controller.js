class ShippingController {
  constructor(shipmentRepository) {
    this.shipmentRepository = shipmentRepository;
  }

  async getByOrder(req, res) {
    const shipment = await this.shipmentRepository.findByOrderId(req.params.orderId);
    if (!shipment) {
      return res.status(404).json({ error: 'Shipment not found' });
    }
    res.json({
      id: shipment.id,
      order_id: shipment.orderId,
      tracking_number: shipment.trackingNumber,
      carrier: shipment.carrier,
      status: shipment.status,
      created_at: shipment.createdAt,
      updated_at: shipment.updatedAt,
    });
  }
}

module.exports = { ShippingController };
