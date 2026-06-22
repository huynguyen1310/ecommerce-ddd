const EmailTemplate = require('./email-template');

describe('EmailTemplate', () => {
  const orderData = {
    order_id: 'ord-123',
    total: 150.00,
    tracking_number: 'TRK-ABC123',
    carrier: 'FedEx',
  };

  describe('formatOrderConfirmation', () => {
    it('includes order id in output', () => {
      const html = EmailTemplate.formatOrderConfirmation(orderData, [], 'TRK-ABC123');
      expect(html).toContain('ord-123');
      expect(html).toContain('Order Confirmed!');
    });

    it('renders enriched items', () => {
      const items = [
        { name: 'DDD Book', product_id: 'p1', quantity: 2, price: 45.00 },
        { name: 'Hexagonal Course', product_id: 'p2', quantity: 1, price: 60.00 },
      ];
      const html = EmailTemplate.formatOrderConfirmation(orderData, items, 'TRK-ABC123');
      expect(html).toContain('DDD Book');
      expect(html).toContain('Hexagonal Course');
      expect(html).toContain('$45.00');
      expect(html).toContain('$60.00');
      expect(html).toContain('ID: p1');
      expect(html).toContain('ID: p2');
    });

    it('shows total price', () => {
      const html = EmailTemplate.formatOrderConfirmation(orderData, [], 'TRK-ABC123');
      expect(html).toContain('$150.00');
    });

    it('includes tracking number', () => {
      const html = EmailTemplate.formatOrderConfirmation(orderData, [], 'TRK-SPECIAL');
      expect(html).toContain('TRK-SPECIAL');
    });

    it('handles empty items gracefully', () => {
      const html = EmailTemplate.formatOrderConfirmation(orderData, [], 'TRK-123');
      expect(html).toContain('Order Confirmed!');
      expect(html).toContain('$150.00');
    });

    it('formats price with two decimals', () => {
      const items = [{ name: 'Item', product_id: 'p1', quantity: 1, price: 9.5 }];
      const html = EmailTemplate.formatOrderConfirmation(orderData, items, 'TRK');
      expect(html).toContain('$9.50');
    });
  });

  describe('formatOrderShipped', () => {
    it('includes order id', () => {
      const html = EmailTemplate.formatOrderShipped(orderData, 'TRK-ABC', 'FedEx');
      expect(html).toContain('ord-123');
      expect(html).toContain('Your Order Has Shipped!');
    });

    it('includes carrier and tracking', () => {
      const html = EmailTemplate.formatOrderShipped(orderData, 'TRK-XYZ', 'UPS');
      expect(html).toContain('TRK-XYZ');
      expect(html).toContain('UPS');
    });

    it('defaults carrier to FedEx when empty', () => {
      const html = EmailTemplate.formatOrderShipped(orderData, 'TRK-1', '');
      expect(html).toContain('FedEx');
    });

    it('uses carrier from orderData when provided', () => {
      const html = EmailTemplate.formatOrderShipped(orderData, 'TRK-1', 'DHL');
      expect(html).toContain('DHL');
    });
  });
});
