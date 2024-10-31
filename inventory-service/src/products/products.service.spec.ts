import { Test, TestingModule } from '@nestjs/testing';
import { ProductsService } from './products.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Product } from './entities/product.entity';
import { Repository } from 'typeorm';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { BulkCheckProductAvailabilities } from './dto/bulk-check-availability.dto';

describe('ProductsService', () => {
  let productsService: ProductsService;
  let productRepository: Repository<Product>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductsService,
        {
          provide: getRepositoryToken(Product),
          useClass: Repository,
        },
      ],
    }).compile();

    productsService = module.get<ProductsService>(ProductsService);
    productRepository = module.get<Repository<Product>>(getRepositoryToken(Product));
  });

  describe('getProductAvailability', () => {
    it('should return a product if it exists', async () => {
      const productId = 1;
      const product = { id: productId, stockQuantity: 10 };
      jest.spyOn(productRepository, 'findOne').mockResolvedValue(product as any);

      const result = await productsService.getProductAvailability(productId);
      expect(result).toEqual(product);
      expect(productRepository.findOne).toHaveBeenCalledWith({
        where: { id: productId },
      });
    });

    it('should return null if the product does not exist', async () => {
      const productId = 1;
      jest.spyOn(productRepository, 'findOne').mockResolvedValue(null);

      const result = await productsService.getProductAvailability(productId);
      expect(result).toBeNull();
      expect(productRepository.findOne).toHaveBeenCalledWith({
        where: { id: productId },
      });
    });
  });

  describe('createProduct', () => {
    it('should create and return a product', async () => {
      const createProductDto: CreateProductDto = { name: 'Product A', stockQuantity: 20, price: 100, description: 'dec' };
      const savedProduct = { id: 1, ...createProductDto };
      jest.spyOn(productRepository, 'save').mockResolvedValue(savedProduct as any);

      const result = await productsService.createProduct(createProductDto);
      expect(result).toEqual(savedProduct);
      expect(productRepository.save).toHaveBeenCalledWith(createProductDto);
    });
  });

  describe('checkBulkAvailability', () => {
    it('should return available products in an array format', async () => {
      const bulkCheckProductAvailabilities: BulkCheckProductAvailabilities = {
        productIds: [1, 2],
        flatten: false,
      };
      const products = [
        { id: 1, stockQuantity: 10, price: 100 },
        { id: 2, stockQuantity: 5, price: 50 },
      ];
      jest.spyOn(productRepository, 'find').mockResolvedValue(products as any);

      const result = await productsService.checkBulkAvailability(bulkCheckProductAvailabilities);
      expect(result).toEqual(products);
    });

    it('should return available products in a flattened format', async () => {
      const bulkCheckProductAvailabilities: BulkCheckProductAvailabilities = {
        productIds: [1, 2],
        flatten: true,
      };
      const products = [
        { id: 1, stockQuantity: 10, price: 100 },
        { id: 2, stockQuantity: 5, price: 50 },
      ];
      jest.spyOn(productRepository, 'find').mockResolvedValue(products as any);

      const result = await productsService.checkBulkAvailability(bulkCheckProductAvailabilities);
      expect(result).toEqual({
        1: { stockQuantity: 10, price: 100 },
        2: { stockQuantity: 5, price: 50 },
      });
    });
  });

  describe('updateInventory', () => {
    it('should update the inventory and return the updated product', async () => {
      const productId = 1;
      const updateInventoryDto: UpdateProductDto = { stockQuantity: 30 };
      const updatedProduct = { id: productId, stockQuantity: 30 };
      jest.spyOn(productRepository, 'update').mockResolvedValue(undefined);
      jest.spyOn(productRepository, 'findOne').mockResolvedValue(updatedProduct as any);

      const result = await productsService.updateInventory(productId, updateInventoryDto);
      expect(result).toEqual(updatedProduct);
      expect(productRepository.update).toHaveBeenCalledWith({ id: productId }, updateInventoryDto);
      expect(productRepository.findOne).toHaveBeenCalledWith({ where: { id: productId } });
    });

    it('should return null if the product does not exist after updating', async () => {
      const productId = 1;
      const updateInventoryDto: UpdateProductDto = { stockQuantity: 30 };
      jest.spyOn(productRepository, 'update').mockResolvedValue(undefined);
      jest.spyOn(productRepository, 'findOne').mockResolvedValue(null);

      const result = await productsService.updateInventory(productId, updateInventoryDto);
      expect(result).toBeNull();
      expect(productRepository.update).toHaveBeenCalledWith({ id: productId }, updateInventoryDto);
      expect(productRepository.findOne).toHaveBeenCalledWith({ where: { id: productId } });
    });
  });

  describe('bulkUpdateInventory', () => {
    it('should update multiple products successfully', async () => {
      const updates: UpdateProductDto[] = [
        { productId: 1, stockQuantity: 10 },
        { productId: 2, stockQuantity: 5 },
      ];
  
      const queryBuilder = {
        update: jest.fn().mockReturnThis(),
        set: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        execute: jest.fn().mockResolvedValue(undefined),
      };
  
      
      jest.spyOn(productRepository, 'createQueryBuilder').mockReturnValue(queryBuilder as any);
  
      const result = await productsService.bulkUpdateInventory(updates);
      expect(result).toEqual({ success: true });
      expect(queryBuilder.update).toHaveBeenCalledWith(Product);
      expect(queryBuilder.set).toHaveBeenCalled();
      expect(queryBuilder.where).toHaveBeenCalled();
      expect(queryBuilder.execute).toHaveBeenCalled();
    });
  });
  
});
