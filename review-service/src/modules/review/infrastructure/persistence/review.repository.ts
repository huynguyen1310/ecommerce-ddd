import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IReviewRepository } from '../../domain/review.repository.interface';
import { Review } from '../../domain/review.entity';
import { ReviewOrmEntity } from './review.orm-entity';
import { ReviewMapper } from './review.mapper';

@Injectable()
export class TypeOrmReviewRepository implements IReviewRepository {
  constructor(
    @InjectRepository(ReviewOrmEntity)
    private readonly repository: Repository<ReviewOrmEntity>,
  ) {}

  async save(review: Review): Promise<void> {
    const orm = ReviewMapper.toPersistence(review);
    await this.repository.save(orm);
  }

  async findById(id: string): Promise<Review | null> {
    const orm = await this.repository.findOne({ where: { id } });
    return orm ? ReviewMapper.toDomain(orm) : null;
  }

  async findByProductId(productId: string): Promise<Review[]> {
    const orms = await this.repository.find({
      where: { productId },
      order: { createdAt: 'DESC' },
    });
    return orms.map(orm => ReviewMapper.toDomain(orm));
  }

  async delete(id: string): Promise<void> {
    await this.repository.delete(id);
  }
}
