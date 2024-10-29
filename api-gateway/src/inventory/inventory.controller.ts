import { Controller, Get, Post, Patch, Param, Body, NotFoundException } from '@nestjs/common';
import { InventoryService } from './inventory.service';
import { CheckAvailabilityDto } from './dto/check-availability.dto';
import { UpdateInventoryDto } from './dto/update-inventory.dto';

@Controller('inventory')
export class InventoryController {
    constructor(private readonly inventoryService: InventoryService) { }

    @Get(':productId')
    async getProductAvailability(@Param('productId') productId: string) {
        const product = await this.inventoryService.getProductAvailability(productId);
        return product
    }

    @Post('check')
    async checkBulkAvailability(@Body() checkAvailabilityDto: CheckAvailabilityDto) {
        return await this.inventoryService.checkBulkAvailability(checkAvailabilityDto);
    }

    @Patch(':productId')
    async updateInventory(
        @Param('productId') productId: string,
        @Body() updateInventoryDto: UpdateInventoryDto,
    ) {
        return await this.inventoryService.updateInventory(productId, updateInventoryDto);
    }
}
