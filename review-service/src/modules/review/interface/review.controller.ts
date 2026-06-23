import { Controller, Post, Body, Get, Param, Delete, HttpCode, UseGuards, NotFoundException, ForbiddenException } from '@nestjs/common';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { CreateReviewUseCase } from '../application/create-review.use-case';
import { ReviewOrmEntity } from '../infrastructure/persistence/review.orm-entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Controller()
export class ReviewController {
  constructor(
    private readonly createReviewUseCase: CreateReviewUseCase,
    @InjectRepository(ReviewOrmEntity)
    private readonly reviewRepo: Repository<ReviewOrmEntity>,
  ) {}

  @Post('reviews')
  async create(@Body() body: { productId: string; customerId: string; rating: number; text: string }) {
    return await this.createReviewUseCase.execute(body);
  }

  @Get('products/:productId/reviews')
  async findByProduct(@Param('productId') productId: string) {
    const reviews = await this.reviewRepo.find({
      where: { productId },
      order: { createdAt: 'DESC' },
    });
    return reviews.map(r => ({
      id: r.id, productId: r.productId, customerId: r.customerId,
      rating: r.rating, text: r.text, createdAt: r.createdAt,
    }));
  }

  @Delete('reviews/:id')
  @HttpCode(204)
  @UseGuards(JwtAuthGuard)
  async delete(
    @Param('id') id: string,
    @CurrentUser() user: { id: string; role: string },
  ) {
    const review = await this.reviewRepo.findOne({ where: { id } });
    if (!review) throw new NotFoundException('Review not found');
    if (user.role !== 'admin' && review.customerId !== user.id) {
      throw new ForbiddenException('You can only delete your own reviews');
    }
    await this.reviewRepo.delete(id);
  }
}
