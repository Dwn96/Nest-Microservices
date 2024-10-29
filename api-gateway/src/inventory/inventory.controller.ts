import { Controller, Get, Post, Patch, Param, Body } from '@nestjs/common';
import { InventoryService } from './inventory.service';
import { CheckAvailabilityDto } from './dto/check-availability.dto';
import { UpdateInventoryDto } from './dto/update-inventory.dto';

@Controller('api/inventory')
export class InventoryController {
    constructor(private readonly inventoryService: InventoryService) {}

    @Get(':productId')
    async getProductAvailability(@Param('productId') productId: string) {
        return await this.inventoryService.getProductAvailability(productId);
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
