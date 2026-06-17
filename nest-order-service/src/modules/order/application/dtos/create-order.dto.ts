export class OrderItemDto {
  productId: string;
  quantity: number;
  price: number;
}

export class CreateOrderDto {
  customerId: string;
  items: OrderItemDto[];
}
