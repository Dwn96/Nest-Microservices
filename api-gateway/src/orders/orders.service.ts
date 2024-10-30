import { Injectable, Inject } from '@nestjs/common';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class OrdersService {
    constructor(@Inject('ORDER') private readonly orderClient: ClientProxy){}
    async createOrder(createOrderDto: CreateOrderDto): Promise<any> {
        const order = await firstValueFrom(this.orderClient.send(
            'createOrder',
            createOrderDto
        ))
        return order;
    }

    async getOrderDetails(id: string): Promise<any> {
        const order = await firstValueFrom(this.orderClient.send(
            'getOrderDetails',
            id
        ))
        return order;
    }

    async listOrders(page: number, limit: number): Promise<any> {
        const orders = await firstValueFrom(this.orderClient.send(
            'listOrders',
            {page, limit}
        ))
        return orders;
    }

    async updateOrderStatus(id: string, updateOrderStatusDto: UpdateOrderStatusDto): Promise<any> {
        const order = await firstValueFrom(this.orderClient.send(
            'updateOrderStatus',
            {id, ...updateOrderStatusDto}
        ))
        return order;
    }
}
