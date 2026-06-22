import { Controller, Post, Body, Get, Param, Delete, HttpCode, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { CreateReviewUseCase } from '../application/create-review.use-case';
import { GetProductReviewsUseCase } from '../application/get-product-reviews.use-case';
import { DeleteReviewUseCase } from '../application/delete-review.use-case';
import { CreateReviewDto } from '../application/dtos/create-review.dto';

@Controller()
export class ReviewController {
  constructor(
    private readonly createReviewUseCase: CreateReviewUseCase,
    private readonly getProductReviewsUseCase: GetProductReviewsUseCase,
    private readonly deleteReviewUseCase: DeleteReviewUseCase,
  ) {}

  @Post('reviews')
  async create(@Body() body: CreateReviewDto) {
    return await this.createReviewUseCase.execute(body);
  }

  @Get('products/:productId/reviews')
  async findByProduct(@Param('productId') productId: string) {
    return await this.getProductReviewsUseCase.execute(productId);
  }

  @Delete('reviews/:id')
  @HttpCode(204)
  @UseGuards(JwtAuthGuard)
  async delete(
    @Param('id') id: string,
    @CurrentUser() user: { id: string; role: string },
  ) {
    await this.deleteReviewUseCase.execute(id, user.id, user.role);
  }
}
