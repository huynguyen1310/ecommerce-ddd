export class Review {
  constructor(
    public readonly id: string,
    public readonly productId: string,
    public readonly customerId: string,
    public rating: number,
    public text: string,
    public readonly createdAt: Date,
  ) {}

  static create(
    id: string,
    productId: string,
    customerId: string,
    rating: number,
    text: string,
  ): Review {
    return new Review(id, productId, customerId, rating, text, new Date());
  }
}
