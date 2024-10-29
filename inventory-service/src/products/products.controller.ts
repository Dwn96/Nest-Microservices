import { Controller, HttpStatus, NotFoundException } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { EntityNotFoundError } from 'typeorm';

@Controller()
export class ProductsController {
  constructor(private readonly productsService: ProductsService) { }

  @MessagePattern('getProductAvailability')
  async getProductAvailability(@Payload() productId: string) {
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
  async checkBulkAvailability(@Payload() productIds: string[]) {
    return await this.productsService.checkBulkAvailability(productIds);
  }

  @MessagePattern('updateInventory')
  async updateInventory(@Payload() updateInventoryData: UpdateProductDto ) {
    console.log(updateInventoryData)
    const {productId, ...rest } = updateInventoryData
    console.log(rest)
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
}
