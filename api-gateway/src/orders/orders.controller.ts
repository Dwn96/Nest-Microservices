import { Controller, Post, Get, Patch, Param, Body, Query } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';

@Controller('orders')
export class OrdersController {
    constructor(private readonly ordersService: OrdersService) {}

    @Post()
    async createOrder(@Body() createOrderDto: CreateOrderDto): Promise<any> {
        return await this.ordersService.createOrder(createOrderDto);
    }

    @Get(':id')
    async getOrderDetails(@Param('id') id: string): Promise<any> {
        return await this.ordersService.getOrderDetails(id);
    }

    @Get()
    async listOrders(@Query('page') page: number, @Query('limit') limit: number): Promise<any> {        
        return await this.ordersService.listOrders(page, limit);
    }

    @Patch(':id/status')
    async updateOrderStatus(@Param('id') id: string, @Body() updateOrderStatusDto: UpdateOrderStatusDto): Promise<any> {        
        return await this.ordersService.updateOrderStatus(id, updateOrderStatusDto)
    }
}
