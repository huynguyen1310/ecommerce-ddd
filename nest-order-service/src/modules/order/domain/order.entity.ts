export class Order {
  constructor(
    public readonly id: string,
    public readonly customerId: string,
    public readonly items: Array<{ productId: string; quantity: number; price: number }>,
    public status: 'PENDING' | 'PAID' | 'SHIPPED' | 'CANCELLED',
    public readonly total: number,
    public readonly createdAt: Date,
  ) {}

  static create(id: string, customerId: string, items: Array<{ productId: string; quantity: number; price: number }>): Order {
    const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    return new Order(
      id,
      customerId,
      items,
      'PENDING',
      total,
      new Date(),
    );
  }
}
