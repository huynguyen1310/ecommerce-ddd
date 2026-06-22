import { Review } from './review.entity';

describe('Review', () => {
  it('creates review with given fields', () => {
    const review = Review.create('r1', 'p1', 'c1', 5, 'Great!');

    expect(review.id).toBe('r1');
    expect(review.productId).toBe('p1');
    expect(review.customerId).toBe('c1');
    expect(review.rating).toBe(5);
    expect(review.text).toBe('Great!');
    expect(review.createdAt).toBeInstanceOf(Date);
  });

  it('allows modifying rating and text', () => {
    const review = Review.create('r1', 'p1', 'c1', 3, 'OK');
    review.rating = 4;
    review.text = 'Better after update';

    expect(review.rating).toBe(4);
    expect(review.text).toBe('Better after update');
  });
});
