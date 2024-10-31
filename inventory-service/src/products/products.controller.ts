import { Controller, HttpStatus, NotFoundException } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { EntityNotFoundError } from 'typeorm';
import { BulkCheckProductAvailabilities } from './dto/bulk-check-availability.dto';

@Controller()
export class ProductsController {
  constructor(private readonly productsService: ProductsService) { }

  @MessagePattern('getProductAvailability')
  async getProductAvailability(@Payload() productId: number) {
    const product = await this.productsService.getProductAvailability(productId);
    if (product) {
      const { id, stockQuantity } = product
      return {
        id, 
        stockQuantity,
        status: HttpStatus.OK
      }
    }
    return {
      status: HttpStatus.NOT_FOUND,
      message: `Product ID ${productId} does not exist`
    }
  }

  @MessagePattern('checkBulkAvailability')
  async checkBulkAvailability(@Payload() bulkCheckProductAvailabilities: BulkCheckProductAvailabilities) {     
    return await this.productsService.checkBulkAvailability(bulkCheckProductAvailabilities);
  }

  @MessagePattern('updateInventory')
  async updateInventory(@Payload() updateInventoryData: UpdateProductDto ) {
    const {productId, ...rest } = updateInventoryData
    const updatedProduct =  await this.productsService.updateInventory(productId, rest);
    if (updatedProduct) {
      return {
        ...updatedProduct,
        status: HttpStatus.OK
      }
    }
    return {
      status: HttpStatus.NOT_FOUND,
      message: `Product ID ${productId} does not exist`
    }
  }

  @MessagePattern('createInventory')
  async createInventory(@Payload() product: CreateProductDto) {
    return await this.productsService.createProduct(product);
  }

  @MessagePattern('bulkUpdateInventory')
  async bulkUpdateInventory(@Payload() update: UpdateProductDto[]) {
    return await this.productsService.bulkUpdateInventory(update)
  }
}
