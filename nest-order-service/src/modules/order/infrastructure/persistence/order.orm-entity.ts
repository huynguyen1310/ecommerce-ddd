import { Entity, PrimaryColumn, Column, CreateDateColumn } from 'typeorm';
import { ShippingAddress } from '../../domain/order.entity';

@Entity('orders')
export class OrderOrmEntity {
  @PrimaryColumn('uuid')
  id: string;

  @Column('uuid')
  customerId: string;

  @Column('jsonb')
  items: Array<{ productId: string; quantity: number; price: number }>;

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
