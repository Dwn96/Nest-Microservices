import { Injectable, Inject } from '@nestjs/common';
import { CheckAvailabilityDto } from './dto/check-availability.dto';
import { UpdateInventoryDto } from './dto/update-inventory.dto';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom, retry, catchError, delay, throwError } from 'rxjs';

@Injectable()
export class InventoryService {
  constructor(@Inject('INVENTORY') private readonly inventoryClient: ClientProxy) {}

  private MAX_RETRY_ATTEMPTS = 3;
  private RETRY_DELAY = 2000; // 2 seconds

  async checkBulkAvailability(checkAvailabilityDto: CheckAvailabilityDto & {traceId?: string }): Promise<any> {
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

  async updateInventory(productId: string, updateInventoryDto: UpdateInventoryDto & {traceId?: string }): Promise<any> {
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

  async bulkUpdateInventory(updateInventoryDto: UpdateInventoryDto[], traceId: string ): Promise<any> {
    return firstValueFrom(
      this.inventoryClient.send('bulkUpdateInventory', {updateInventoryDto, traceId }).pipe(
        retry({
          count: this.MAX_RETRY_ATTEMPTS,
          delay: this.RETRY_DELAY,
        }),
        catchError((error) => {
          console.error('Error in bulk updating inventory:', error);
          return throwError(() => error);
        })
      )
    );
  }
}
