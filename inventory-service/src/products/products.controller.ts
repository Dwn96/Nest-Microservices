import { Controller, HttpStatus, Logger } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { EntityNotFoundError } from 'typeorm';
import { BulkCheckProductAvailabilities } from './dto/bulk-check-availability.dto';

@Controller()
export class ProductsController {
  constructor(private readonly productsService: ProductsService) { }

  private readonly logger = new Logger(ProductsController.name);

  @MessagePattern('getProductAvailability')
  async getProductAvailability(@Payload() payload:{productId: number} & {traceId: string}) {
    const { productId, traceId } = payload
    this.logger.log(`[Trace ID: ${traceId}] Received getProductAvailability request`, payload);    
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
  async checkBulkAvailability(@Payload() bulkCheckProductAvailabilities: BulkCheckProductAvailabilities & {traceId:string}) {  
    this.logger.log(`[Trace ID: ${bulkCheckProductAvailabilities.traceId}] Received checkBulkAvailability request`, bulkCheckProductAvailabilities);       
    return await this.productsService.checkBulkAvailability(bulkCheckProductAvailabilities);
  }

  @MessagePattern('updateInventory')
  async updateInventory(@Payload() updateInventoryData: UpdateProductDto & {traceId:string}) {
    const {productId, traceId, ...rest } = updateInventoryData
    this.logger.log(`[Trace ID: ${traceId}] Received updateInventory request`, updateInventoryData);    
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
  async createInventory(@Payload() product: CreateProductDto & {traceId:string}) {
    this.logger.log(`[Trace ID: ${product.traceId}] Received createInventory request`, product);    
    return await this.productsService.createProduct(product);
  }

  @MessagePattern('bulkUpdateInventory')
  async bulkUpdateInventory(@Payload() data: {updateInventoryDto: UpdateProductDto[]} & {traceId:string}) {
    this.logger.log(`[Trace ID: ${data.traceId}] Received bulkUpdateInventory request`, data);    
    return await this.productsService.bulkUpdateInventory(data.updateInventoryDto)
  }
}
