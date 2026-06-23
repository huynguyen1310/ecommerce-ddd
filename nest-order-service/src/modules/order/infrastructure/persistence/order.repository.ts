import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IOrderRepository } from '../../domain/order.repository.interface';
import { Order } from '../../domain/order.entity';
import { OrderOrmEntity } from './order.orm-entity';

@Injectable()
export class TypeOrmOrderRepository implements IOrderRepository {
  constructor(
    @InjectRepository(OrderOrmEntity)
    private readonly repository: Repository<OrderOrmEntity>,
  ) {}

  async save(order: Order): Promise<void> {
    const orm = this.repository.create({ ...order });
    await this.repository.save(orm);
  }

  private mapOrder(orm: OrderOrmEntity): Order {
    return new Order(orm.id, orm.customerId, orm.items, orm.status as any, Number(orm.total), orm.createdAt, orm.shippingAddress);
  }

  async findById(id: string): Promise<Order | null> {
    const orm = await this.repository.findOne({ where: { id } });
    if (!orm) return null;
    return this.mapOrder(orm);
  }

  async findAll(): Promise<Order[]> {
    const orms = await this.repository.find({ order: { createdAt: 'DESC' } });
    return orms.map(orm => this.mapOrder(orm));
  }

  async findByCustomerId(customerId: string): Promise<Order[]> {
    const orms = await this.repository.find({
      where: { customerId },
      order: { createdAt: 'DESC' },
    });
    return orms.map(orm => this.mapOrder(orm));
  }
}
