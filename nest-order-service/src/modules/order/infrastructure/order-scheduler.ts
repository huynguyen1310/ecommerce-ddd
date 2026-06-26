import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan } from 'typeorm';
import { SubOrderOrmEntity } from './persistence/sub-order.orm-entity';

@Injectable()
export class OrderScheduler {
  constructor(
    @InjectRepository(SubOrderOrmEntity)
    private readonly subOrderRepo: Repository<SubOrderOrmEntity>,
  ) {}

  async autoDeliver(): Promise<number> {
    const cutoff = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000);
    const result = await this.subOrderRepo.update(
      { status: 'SHIPPED', shippedAt: LessThan(cutoff) },
      { status: 'DELIVERED', deliveredAt: new Date() },
    );
    return result.affected || 0;
  }

  async autoComplete(): Promise<number> {
    const cutoff = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const result = await this.subOrderRepo.update(
      { status: 'DELIVERED', deliveredAt: LessThan(cutoff) },
      { status: 'COMPLETED' },
    );
    return result.affected || 0;
  }
}
