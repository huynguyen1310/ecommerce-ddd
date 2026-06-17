import { Controller, Post, Body, Get, Param } from '@nestjs/common';
import { CreateOrderUseCase } from '../application/create-order.use-case';
import { FindOrdersByCustomerUseCase } from '../application/find-orders-by-customer.use-case';
import { CreateOrderDto } from '../application/dtos/create-order.dto';

@Controller('orders')
export class OrderController {
  constructor(
    private readonly createOrderUseCase: CreateOrderUseCase,
    private readonly findOrdersByCustomerUseCase: FindOrdersByCustomerUseCase,
  ) {}

  @Post()
  async create(@Body() body: CreateOrderDto) {
    console.log('[Order Controller] Received order request:', body);
    return await this.createOrderUseCase.execute(body);
  }

  @Get('customer/:customerId')
  async findByCustomer(@Param('customerId') customerId: string) {
    return await this.findOrdersByCustomerUseCase.execute(customerId);
  }
}
