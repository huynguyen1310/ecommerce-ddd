import { Review } from '../../domain/review.entity';
import { ReviewOrmEntity } from './review.orm-entity';

export class ReviewMapper {
  static toDomain(orm: ReviewOrmEntity): Review {
    return new Review(
      orm.id,
      orm.productId,
      orm.customerId,
      orm.rating,
      orm.text,
      orm.createdAt,
    );
  }

  static toPersistence(domain: Review): ReviewOrmEntity {
    const orm = new ReviewOrmEntity();
    orm.id = domain.id;
    orm.productId = domain.productId;
    orm.customerId = domain.customerId;
    orm.rating = domain.rating;
    orm.text = domain.text;
    orm.createdAt = domain.createdAt;
    return orm;
  }
}
