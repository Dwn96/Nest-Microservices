import { Injectable, Inject, NotFoundException, Scope } from '@nestjs/common';
import { CheckAvailabilityDto } from './dto/check-availability.dto';
import { UpdateInventoryDto } from './dto/update-inventory.dto';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom, of, catchError, delay, retry, throwError } from 'rxjs';
import { CreateInventoryDto } from './dto/create-inventory.dto';
import { REQUEST } from '@nestjs/core';

@Injectable({ scope: Scope.REQUEST })
export class InventoryService {
  constructor(@Inject('INVENTORY') private readonly inventoryClient: ClientProxy,
    @Inject(REQUEST) private readonly request: Request) { }

  private MAX_RETRY_ATTEMPTS = 3;
  private RETRY_DELAY = 2000;

  private get traceId(): string {
    return this.request.headers['x-trace-id'] as string;
  }


  async getProductAvailability(productId: string): Promise<any> {
    return firstValueFrom(
      this.inventoryClient.send('getProductAvailability', {productId, traceId: this.traceId}).pipe(
        retry({
          count: this.MAX_RETRY_ATTEMPTS,
          delay: this.RETRY_DELAY,
        }),
        catchError((error) => {
          console.error('Error fetching product availability:', error);
          return throwError(() => new NotFoundException('Product not found'));
        })
      )
    );
  }

  async checkBulkAvailability(checkAvailabilityDto: CheckAvailabilityDto): Promise<any> {
    return firstValueFrom(
      this.inventoryClient.send('checkBulkAvailability', {...checkAvailabilityDto, traceId: this.traceId}).pipe(
        retry({
          count: this.MAX_RETRY_ATTEMPTS,
          delay: this.RETRY_DELAY,
        }),
        catchError((error) => {
          console.error('Error checking bulk availability:', error);
          return throwError(() => error);
        })
      )
    );
  }

  async updateInventory(productId: string, updateInventoryDto: UpdateInventoryDto): Promise<any> {
    return firstValueFrom(
      this.inventoryClient.send('updateInventory', { productId, ...updateInventoryDto, traceId: this.traceId }).pipe(
        retry({
          count: this.MAX_RETRY_ATTEMPTS,
          delay: this.RETRY_DELAY,
        }),
        catchError((error) => {
          console.error('Error updating inventory:', error);
          return throwError(() => error);
        })
      )
    );
  }

  async createInventory(product: CreateInventoryDto): Promise<any> {
    return firstValueFrom(
      this.inventoryClient.send('createInventory', {...product, traceId: this.traceId}).pipe(
        retry({
          count: this.MAX_RETRY_ATTEMPTS,
          delay: this.RETRY_DELAY,
        }),
        catchError((error) => {
          console.error('Error creating inventory:', error);
          return throwError(() => error);
        })
      )
    );
  }
}
