import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IOrderRepository } from '../../domain/order.repository.interface';
import { Order } from '../../domain/order.entity';
import { OrderOrmEntity } from './order.orm-entity';
import { OrderMapper } from './order.mapper';

@Injectable()
export class TypeOrmOrderRepository implements IOrderRepository {
  constructor(
    @InjectRepository(OrderOrmEntity)
    private readonly repository: Repository<OrderOrmEntity>,
  ) {}

  async save(order: Order): Promise<void> {
    const orm = OrderMapper.toPersistence(order);
    await this.repository.save(orm);
  }

  async findById(id: string): Promise<Order | null> {
    const orm = await this.repository.findOne({ where: { id } });
    return orm ? OrderMapper.toDomain(orm) : null;
  }

  async findByCustomerId(customerId: string): Promise<Order[]> {
    const orms = await this.repository.find({
      where: { customerId },
      order: { createdAt: 'DESC' },
    });
    return orms.map(orm => OrderMapper.toDomain(orm));
  }
}
