import { Entity, PrimaryColumn, Column, CreateDateColumn } from 'typeorm';

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

  @CreateDateColumn()
  createdAt: Date;
}
