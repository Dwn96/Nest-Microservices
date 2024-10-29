import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { CheckAvailabilityDto } from './dto/check-availability.dto';
import { UpdateInventoryDto } from './dto/update-inventory.dto';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class InventoryService {
    constructor(@Inject('INVENTORY') private readonly inventoryClient: ClientProxy) { }
    async getProductAvailability(productId: string): Promise<any> {
        try {
            const productAvailability = await firstValueFrom(this.inventoryClient.send(
                'getProductAvailability',
                productId
            ))
            return productAvailability;
        }
        catch (error) {
            if (error.message === 'no elements in sequence') {
                throw new NotFoundException(`Product with ID ${productId} not found`);
            }
            // Re-throw any unexpected errors
            throw error;
        }
    }

    async checkBulkAvailability(checkAvailabilityDto: CheckAvailabilityDto): Promise<any> {
        const productAvailability = await firstValueFrom(this.inventoryClient.send(
            'checkBulkAvailability',
            { checkAvailabilityDto }
        ))
        return productAvailability;
    }

    async updateInventory(productId: string, updateInventoryDto: UpdateInventoryDto): Promise<any> {
        const inventory = await firstValueFrom(this.inventoryClient.send(
            'checkBulkAvailability',
            { productId, updateInventoryDto }
        ))
        return inventory;
    }
}
