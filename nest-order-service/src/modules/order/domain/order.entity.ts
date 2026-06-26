export interface ShippingAddress {
  name: string;
  street: string;
  city: string;
  state: string;
  zip: string;
  country: string;
}

export type OrderItem = { productId: string; quantity: number; price: number; shopId?: string };

export type OrderStatus = 'PENDING' | 'CONFIRMED' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'COMPLETED' | 'CANCELLED' | 'REFUNDED';

export const VALID_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  PENDING: ['CONFIRMED', 'CANCELLED'],
  CONFIRMED: ['PROCESSING', 'CANCELLED', 'REFUNDED'],
  PROCESSING: ['SHIPPED', 'CANCELLED'],
  SHIPPED: ['DELIVERED', 'REFUNDED'],
  DELIVERED: ['COMPLETED', 'REFUNDED'],
  COMPLETED: ['REFUNDED'],
  CANCELLED: [],
  REFUNDED: [],
};

export function canTransition(from: OrderStatus, to: OrderStatus): boolean {
  return VALID_TRANSITIONS[from]?.includes(to) ?? false;
}

export class Order {
  constructor(
    public readonly id: string,
    public readonly customerId: string,
    public readonly items: OrderItem[],
    public status: OrderStatus,
    public readonly total: number,
    public readonly createdAt: Date,
    public readonly shippingAddress?: ShippingAddress,
    public readonly couponCode?: string,
    public readonly discount?: number,
  ) {}

  static create(id: string, customerId: string, items: OrderItem[], shippingAddress?: ShippingAddress, couponCode?: string, discount?: number): Order {
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
