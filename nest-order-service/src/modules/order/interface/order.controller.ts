import { Controller, Post, Body, Get, Param } from '@nestjs/common';
import { CreateOrderUseCase } from '../application/create-order.use-case';
import { FindOrderByIdUseCase } from '../application/find-order-by-id.use-case';
import { FindOrdersByCustomerUseCase } from '../application/find-orders-by-customer.use-case';
import { CreateOrderDto } from '../application/dtos/create-order.dto';

@Controller('orders')
export class OrderController {
  constructor(
    private readonly createOrderUseCase: CreateOrderUseCase,
    private readonly findOrderByIdUseCase: FindOrderByIdUseCase,
    private readonly findOrdersByCustomerUseCase: FindOrdersByCustomerUseCase,
  ) {}

  @Post()
  async create(@Body() body: CreateOrderDto) {
    console.log('[Order Controller] Received order request:', body);
    return await this.createOrderUseCase.execute(body);
  }

  @Get(':id')
  async findById(@Param('id') id: string) {
    return await this.findOrderByIdUseCase.execute(id);
  }

  @Get('customer/:customerId')
  async findByCustomer(@Param('customerId') customerId: string) {
    return await this.findOrdersByCustomerUseCase.execute(customerId);
  }
}
