import { Order } from './order.entity';

describe('Order', () => {
  it('creates order with PENDING status', () => {
    const order = Order.create('id-1', 'cust-1', [
      { productId: 'p1', quantity: 2, price: 10 },
      { productId: 'p2', quantity: 1, price: 25 },
    ]);

    expect(order.id).toBe('id-1');
    expect(order.customerId).toBe('cust-1');
    expect(order.status).toBe('PENDING');
    expect(order.items).toHaveLength(2);
    expect(order.createdAt).toBeInstanceOf(Date);
  });

  it('calculates total as sum of price * quantity', () => {
    const order = Order.create('id-1', 'cust-1', [
      { productId: 'p1', quantity: 3, price: 15 },
      { productId: 'p2', quantity: 2, price: 7.5 },
    ]);

    expect(order.total).toBe(3 * 15 + 2 * 7.5);
  });

  it('creates order with zero total for empty items', () => {
    const order = Order.create('id-1', 'cust-1', []);
    expect(order.total).toBe(0);
    expect(order.items).toHaveLength(0);
  });

  it('preserves all item properties', () => {
    const items = [
      { productId: 'p1', quantity: 2, price: 10 },
      { productId: 'p2', quantity: 1, price: 25 },
    ];
    const order = Order.create('id-1', 'cust-1', items);

    expect(order.items[0].productId).toBe('p1');
    expect(order.items[0].quantity).toBe(2);
    expect(order.items[0].price).toBe(10);
  });
});
