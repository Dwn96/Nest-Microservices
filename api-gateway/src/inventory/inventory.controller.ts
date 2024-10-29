import { Controller, Get, Post, Patch, Param, Body, NotFoundException, HttpStatus, HttpException } from '@nestjs/common';
import { InventoryService } from './inventory.service';
import { CheckAvailabilityDto } from './dto/check-availability.dto';
import { UpdateInventoryDto } from './dto/update-inventory.dto';
import { CreateInventoryDto } from './dto/create-inventory.dto';

@Controller('inventory')
export class InventoryController {
    constructor(private readonly inventoryService: InventoryService) { }

    @Get(':productId')
    async getProductAvailability(@Param('productId') productId: string) {
        const response = await this.inventoryService.getProductAvailability(productId);
        if(response.status !== HttpStatus.OK) {
            throw new HttpException({
                message: response.message,
            }, response.status)
        }
        return response
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

    @Post()
    async createInventory(@Body() product: CreateInventoryDto ) {
        return await this.inventoryService.createInventory(product);
    }
}
