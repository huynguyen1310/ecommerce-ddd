const { Shipment } = require('../../domain/shipment.entity');

class ShipmentMapper {
  static toDomain(row) {
    if (!row) return null;
    return new Shipment(
      row.id,
      row.order_id,
      row.tracking_number,
      row.carrier,
      row.status,
      row.created_at,
      row.updated_at
    );
  }

  static toPersistence(shipment) {
    return {
      id: shipment.id,
      order_id: shipment.orderId,
      tracking_number: shipment.trackingNumber,
      carrier: shipment.carrier,
      status: shipment.status,
    };
  }
}

module.exports = { ShipmentMapper };
