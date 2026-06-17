export class OrderItemDto {
  productId: string;
  quantity: number;
  price: number;
}

export class OrderDto {
  id: string;
  customerId: string;
  total: number;
  status: string;
  items: OrderItemDto[];
  createdAt: Date;
}
