import { Controller, Post, Get, Patch, Param, Body, Query, HttpStatus, HttpException } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';

@Controller('orders')
export class OrdersController {
    constructor(private readonly ordersService: OrdersService) {}

    @Post()
    async createOrder(@Body() createOrderDto: CreateOrderDto): Promise<any> {
        const response = await this.ordersService.createOrder(createOrderDto);
        
        if(response.status !== HttpStatus.CREATED) {
            throw new HttpException({
                message: response.message
            }, response.status)
        }
        return response.data
    }

    @Get(':id')
    async getOrderDetails(@Param('id') id: string): Promise<any> {         
        const response = await this.ordersService.getOrderDetails(id);
        if(response.status !== HttpStatus.OK) {
            throw new HttpException({
                message: response.message
            }, response.status)
        }
        return response.data
    }

    @Get()
    async listOrders(@Query('page') page: number, @Query('limit') limit: number): Promise<any> {        
        return await this.ordersService.listOrders(page ?? 1, limit ?? 10);
    }

    @Patch(':id/status')
    async updateOrderStatus(@Param('id') id: string, @Body() updateOrderStatusDto: UpdateOrderStatusDto): Promise<any> {        
        const response =  await this.ordersService.updateOrderStatus(id, updateOrderStatusDto)
        if(response.status !== HttpStatus.OK) {
            throw new HttpException({
                message: response.message,
            }, response.status)
        }
        return response.data
    }
}
