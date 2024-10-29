import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { CheckAvailabilityDto } from './dto/check-availability.dto';
import { UpdateInventoryDto } from './dto/update-inventory.dto';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { CreateInventoryDto } from './dto/create-inventory.dto';

@Injectable()
export class InventoryService {
    constructor(@Inject('INVENTORY') private readonly inventoryClient: ClientProxy) { }
    async getProductAvailability(productId: string): Promise<any> {
        const productAvailability = await firstValueFrom(this.inventoryClient.send(
            'getProductAvailability',
            productId
        ))
        return productAvailability;
    }

    async checkBulkAvailability(checkAvailabilityDto: CheckAvailabilityDto): Promise<any> {
        const productAvailability = await firstValueFrom(this.inventoryClient.send(
            'checkBulkAvailability',
            checkAvailabilityDto.productIds
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

    async createInventory(product: CreateInventoryDto): Promise<any> {
        const inventory = await firstValueFrom(this.inventoryClient.send(
            'createInventory',
            product
        ))
        return inventory;
    }
}
