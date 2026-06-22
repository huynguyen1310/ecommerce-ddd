import { Entity, PrimaryColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('reviews')
export class ReviewOrmEntity {
  @PrimaryColumn('uuid')
  id: string;

  @Column('uuid')
  productId: string;

  @Column('uuid')
  customerId: string;

  @Column('int')
  rating: number;

  @Column('text')
  text: string;

  @CreateDateColumn()
  createdAt: Date;
}
