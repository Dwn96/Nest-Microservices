import { Injectable, Inject, NotFoundException, flatten } from '@nestjs/common';
import { CheckAvailabilityDto } from './dto/check-availability.dto';
import { UpdateInventoryDto } from './dto/update-inventory.dto';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { CreateInventoryDto } from './dto/create-inventory.dto';

@Injectable()
export class InventoryService {
    constructor(@Inject('INVENTORY') private readonly inventoryClient: ClientProxy) { }
    
    async checkBulkAvailability(checkAvailabilityDto: CheckAvailabilityDto): Promise<any> {
        const productAvailability = await firstValueFrom(this.inventoryClient.send(
            'checkBulkAvailability',
            checkAvailabilityDto
        ))
        return productAvailability;
    }

    async updateInventory(productId: string, updateInventoryDto: UpdateInventoryDto): Promise<any> {
        const inventory = await firstValueFrom(this.inventoryClient.send(
            'updateInventory',
            { productId, ...updateInventoryDto }
        ))
        return inventory;
    }

    async bulkUpdateInventory(updateInventoryDto: UpdateInventoryDto[]): Promise<any> {
        const inventory = await firstValueFrom(this.inventoryClient.send(
            'bulkUpdateInventory',
            updateInventoryDto
        ))
        return inventory;
    }
    
}
