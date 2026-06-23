export interface ShippingAddress {
  name: string;
  street: string;
  city: string;
  state: string;
  zip: string;
  country: string;
}

export class Order {
  constructor(
    public readonly id: string,
    public readonly customerId: string,
    public readonly items: Array<{ productId: string; quantity: number; price: number }>,
    public status: 'PENDING' | 'PAID' | 'SHIPPED' | 'CANCELLED',
    public readonly total: number,
    public readonly createdAt: Date,
    public readonly shippingAddress?: ShippingAddress,
    public readonly couponCode?: string,
    public readonly discount?: number,
  ) {}

  static create(id: string, customerId: string, items: Array<{ productId: string; quantity: number; price: number }>, shippingAddress?: ShippingAddress, couponCode?: string, discount?: number): Order {
    const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const total = discount ? Math.round((subtotal - discount) * 100) / 100 : subtotal;
    return new Order(
      id,
      customerId,
      items,
      'PENDING',
      total,
      new Date(),
      shippingAddress,
      couponCode,
      discount,
    );
  }
}
