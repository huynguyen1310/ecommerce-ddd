import { Entity, PrimaryColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('sub_orders')
export class SubOrderOrmEntity {
  @PrimaryColumn('uuid')
  id: string;

  @Column('uuid')
  orderId: string;

  @Column()
  shopId: string;

  @Column({ default: 'PENDING' })
  status: string;

  @Column('decimal', { precision: 10, scale: 2 })
  total: number;

  @Column('jsonb')
  items: Array<{ productId: string; quantity: number; price: number }>;

  @Column({ nullable: true })
  trackingNumber?: string;

  @Column({ nullable: true })
  carrier?: string;

  @Column({ nullable: true })
  shippedAt?: Date;

  @Column({ nullable: true })
  deliveredAt?: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
