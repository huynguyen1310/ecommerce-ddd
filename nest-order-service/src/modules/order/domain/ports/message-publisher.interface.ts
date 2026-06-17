import { Order } from '../order.entity';

export interface IMessagePublisher {
  publishOrderCreated(order: Order): Promise<void>;
}
