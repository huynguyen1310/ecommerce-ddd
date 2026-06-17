import { Order } from '../../domain/order.entity';
import { OrderOrmEntity } from './order.orm-entity';

export class OrderMapper {
  static toDomain(orm: OrderOrmEntity): Order {
    return new Order(
      orm.id,
      orm.customerId,
      orm.items,
      orm.status as any,
      Number(orm.total),
      orm.createdAt,
    );
  }

  static toPersistence(domain: Order): OrderOrmEntity {
    const orm = new OrderOrmEntity();
    orm.id = domain.id;
    orm.customerId = domain.customerId;
    orm.items = domain.items;
    orm.status = domain.status;
    orm.total = domain.total;
    orm.createdAt = domain.createdAt;
    return orm;
  }
}
