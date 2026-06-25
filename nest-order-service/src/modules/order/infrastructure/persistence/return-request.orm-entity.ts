import { Entity, PrimaryColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('return_requests')
export class ReturnRequestOrmEntity {
  @PrimaryColumn('uuid')
  id: string;

  @Column('uuid')
  orderId: string;

  @Column()
  shopId: string;

  @Column('uuid')
  buyerId: string;

  @Column('text')
  reason: string;

  @Column({ default: 'pending' })
  status: string;

  @Column('decimal', { precision: 10, scale: 2, nullable: true })
  refundAmount: number;

  @Column({ nullable: true })
  rejectionReason: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
