import { Entity, PrimaryColumn, Column, CreateDateColumn } from 'typeorm';
import { ShippingAddress, OrderItem } from '../../domain/order.entity';

@Entity('orders')
export class OrderOrmEntity {
  @PrimaryColumn('uuid')
  id: string;

  @Column('uuid')
  customerId: string;

  @Column('jsonb')
  items: OrderItem[];

  @Column()
  status: string;

  @Column('decimal', { precision: 10, scale: 2 })
  total: number;

  @Column('jsonb', { nullable: true })
  shippingAddress?: ShippingAddress;

  @Column({ nullable: true })
  couponCode?: string;

  @Column('decimal', { precision: 10, scale: 2, nullable: true })
  discount?: number;

  @CreateDateColumn()
  createdAt: Date;
}
