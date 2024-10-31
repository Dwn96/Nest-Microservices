import { Injectable, Inject } from '@nestjs/common';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom, catchError, retry, delay, throwError } from 'rxjs';

@Injectable()
export class OrdersService {
  constructor(@Inject('ORDER') private readonly orderClient: ClientProxy) {}

  private readonly MAX_RETRY_ATTEMPTS = 3;
  private readonly RETRY_DELAY = 2000; // 2 seconds

  async createOrder(createOrderDto: CreateOrderDto): Promise<any> {
    return firstValueFrom(
      this.orderClient.send('createOrder', createOrderDto).pipe(
        retry({
          count: this.MAX_RETRY_ATTEMPTS,
          delay: this.RETRY_DELAY,
        }),
        catchError((error) => {
          console.error('Error creating order:', error);
          return throwError(() => error);
        })
      )
    );
  }

  async getOrderDetails(id: string): Promise<any> {
    return firstValueFrom(
      this.orderClient.send('getOrderDetails', id).pipe(
        retry({
          count: this.MAX_RETRY_ATTEMPTS,
          delay: this.RETRY_DELAY,
        }),
        catchError((error) => {
          console.error('Error fetching order details:', error);
          return throwError(() => error);
        })
      )
    );
  }

  async listOrders(page: number, limit: number): Promise<any> {
    return firstValueFrom(
      this.orderClient.send('listOrders', { page, limit }).pipe(
        retry({
          count: this.MAX_RETRY_ATTEMPTS,
          delay: this.RETRY_DELAY,
        }),
        catchError((error) => {
          console.error('Error listing orders:', error);
          return throwError(() => error);
        })
      )
    );
  }

  async updateOrderStatus(id: string, updateOrderStatusDto: UpdateOrderStatusDto): Promise<any> {
    return firstValueFrom(
      this.orderClient.send('updateOrderStatus', { id, ...updateOrderStatusDto }).pipe(
        retry({
          count: this.MAX_RETRY_ATTEMPTS,
          delay: this.RETRY_DELAY,
        }),
        catchError((error) => {
          console.error('Error updating order status:', error);
          return throwError(() => error);
        })
      )
    );
  }
}
