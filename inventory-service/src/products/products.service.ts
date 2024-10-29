import { Injectable } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Product } from './entities/product.entity';
import { Repository } from 'typeorm';

@Injectable()
export class ProductsService {
  constructor(@InjectRepository(Product) private productRepository: Repository<Product>) {}
  
  async getProductAvailability(productId: string) {
    return await this.productRepository.findOne({where: {
      id: productId
    }})
  }

  async createProduct(product: CreateProductDto) {
    return await this.productRepository.save(product)
  }
}
