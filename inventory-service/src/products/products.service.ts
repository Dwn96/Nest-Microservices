import { Injectable } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Product } from './entities/product.entity';
import { In, Repository } from 'typeorm';
import { BulkCheckProductAvailabilities } from './dto/bulk-check-availability.dto';

@Injectable()
export class ProductsService {
  constructor(@InjectRepository(Product) private productRepository: Repository<Product>) { }

  async getProductAvailability(productId: number) {
    return await this.productRepository.findOne({
      where: {
        id: productId
      }
    })
  }

  async createProduct(product: CreateProductDto) {
    return await this.productRepository.save(product)
  }

  async checkBulkAvailability(bulkCheckProductAvailabilities: BulkCheckProductAvailabilities) {
    const {productIds, flatten} = bulkCheckProductAvailabilities
    const products = await this.productRepository.find({
      where: {
        id: In(productIds)
      },
      select: ['id', 'stockQuantity', 'price']
    })
    if (flatten) {
      // Transform the result into a map with product IDs as keys and quantities as values
      console.log('product', products)
      return products.reduce((acc, product) => {
        acc[product.id] = {
          stockQuantity: product.stockQuantity,
          price: Number(product.price)
        }
        return acc;
      }, {} as Record<string, {}>);
    }
    return products;
  }

  async updateInventory(productId: number, updateInventoryDto: UpdateProductDto) {
    await this.productRepository.update({ id: productId }, updateInventoryDto)
    return await this.getProductAvailability(productId)
  }

  async bulkUpdateInventory(updates: UpdateProductDto[]) {
    const queryBuilder = this.productRepository.createQueryBuilder();

    const ids = updates.map(update => update.productId);
    const quantities = updates.map(update => update.stockQuantity);
    await queryBuilder
        .update(Product)
        .set({
            stockQuantity: () => {
                return `CASE id ${ids.map((id, index) => `WHEN '${id}' THEN ${quantities[index]}`).join(' ')} END`;
            },
        })
        .where("id IN (:...ids)", { ids })
        .execute();
    return {success: true}    
  }
}
