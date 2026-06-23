import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Review } from '../../domain/review.entity';
import { ReviewOrmEntity } from './review.orm-entity';

@Injectable()
export class TypeOrmReviewRepository {
  constructor(
    @InjectRepository(ReviewOrmEntity)
    private readonly repository: Repository<ReviewOrmEntity>,
  ) {}

  async save(review: Review): Promise<void> {
    const orm = this.repository.create({ ...review });
    await this.repository.save(orm);
  }

  async findById(id: string): Promise<Review | null> {
    const orm = await this.repository.findOne({ where: { id } });
    if (!orm) return null;
    return new Review(orm.id, orm.productId, orm.customerId, orm.rating, orm.text, orm.createdAt);
  }

  async findByProductId(productId: string): Promise<Review[]> {
    const orms = await this.repository.find({
      where: { productId },
      order: { createdAt: 'DESC' },
    });
    return orms.map(orm => new Review(orm.id, orm.productId, orm.customerId, orm.rating, orm.text, orm.createdAt));
  }

  async delete(id: string): Promise<void> {
    await this.repository.delete(id);
  }
}
