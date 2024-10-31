import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { CheckAvailabilityDto } from './dto/check-availability.dto';
import { UpdateInventoryDto } from './dto/update-inventory.dto';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom, of, catchError, delay, retry, throwError } from 'rxjs';
import { CreateInventoryDto } from './dto/create-inventory.dto';

@Injectable()
export class InventoryService {
  constructor(@Inject('INVENTORY') private readonly inventoryClient: ClientProxy) {}

  private readonly MAX_RETRY_ATTEMPTS = 3;
  private readonly RETRY_DELAY = 2000;

  async getProductAvailability(productId: string): Promise<any> {
    return firstValueFrom(
      this.inventoryClient.send('getProductAvailability', productId).pipe(
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
      this.inventoryClient.send('checkBulkAvailability', checkAvailabilityDto).pipe(
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
      this.inventoryClient.send('updateInventory', { productId, ...updateInventoryDto }).pipe(
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
      this.inventoryClient.send('createInventory', product).pipe(
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
