import { Test, TestingModule } from '@nestjs/testing';
import { ProductsController } from './products.controller';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { BulkCheckProductAvailabilities } from './dto/bulk-check-availability.dto';
import { HttpStatus } from '@nestjs/common';

describe('ProductsController', () => {
  let productsController: ProductsController;
  let productsService: ProductsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProductsController],
      providers: [
        {
          provide: ProductsService,
          useValue: {
            getProductAvailability: jest.fn(),
            checkBulkAvailability: jest.fn(),
            updateInventory: jest.fn(),
            createProduct: jest.fn(),
            bulkUpdateInventory: jest.fn(),
          },
        },
      ],
    }).compile();

    productsController = module.get<ProductsController>(ProductsController);
    productsService = module.get<ProductsService>(ProductsService);
  });

  describe('getProductAvailability', () => {
    it('should return product availability', async () => {
      const payload = { productId: 1, traceId: '12345' };
      const product = { 
        id: 1, 
        stockQuantity: 10, 
        name: 'Product 1', 
        description: 'Desc',
        price: 23,
        imageUrl: 'img.com/ere2'
      };
      jest.spyOn(productsService, 'getProductAvailability').mockResolvedValue(product as any);

      const result = await productsController.getProductAvailability(payload);
      expect(result).toEqual({
        id: product.id,
        stockQuantity: product.stockQuantity,
        status: HttpStatus.OK,
      });
      expect(productsService.getProductAvailability).toHaveBeenCalledWith(payload.productId);
    });

    it('should return NOT_FOUND if product does not exist', async () => {
      const payload = { productId: 1, traceId: '12345' };
      jest.spyOn(productsService, 'getProductAvailability').mockResolvedValue(null);

      const result = await productsController.getProductAvailability(payload);
      expect(result).toEqual({
        status: HttpStatus.NOT_FOUND,
        message: `Product ID ${payload.productId} does not exist`,
      });
      expect(productsService.getProductAvailability).toHaveBeenCalledWith(payload.productId);
    });
  });

  describe('checkBulkAvailability', () => {
    it('should check bulk availability and return result', async () => {
      const bulkCheckProductAvailabilities: BulkCheckProductAvailabilities = {
        productIds: [1, 2, 3],
      };
      const availabilityResult = { productId: 1, stockQuantity: 3 };
      jest.spyOn(productsService, 'checkBulkAvailability').mockResolvedValue(availabilityResult);

      const result = await productsController.checkBulkAvailability({...bulkCheckProductAvailabilities, traceId: 'test'});
      expect(result).toEqual(availabilityResult);
      expect(productsService.checkBulkAvailability).toHaveBeenCalledWith({...bulkCheckProductAvailabilities, traceId: 'test'});
    });
  });

  describe('updateInventory', () => {
    it('should update inventory and return updated product', async () => {
      const updateInventoryData: UpdateProductDto = { stockQuantity: 20, };
      const updatedProduct = { id: 1, stockQuantity: 20 };
      jest.spyOn(productsService, 'updateInventory').mockResolvedValue(updatedProduct as any);

      const result = await productsController.updateInventory({...updateInventoryData, traceId: 'trace-id'});
      expect(result).toEqual({
        ...updatedProduct,
        status: HttpStatus.OK,
      });
      expect(productsService.updateInventory).toHaveBeenCalledWith(updateInventoryData.productId, {
        stockQuantity: updateInventoryData.stockQuantity,
      });
    });

    it('should return NOT_FOUND if updating inventory fails', async () => {
      const updateInventoryData: UpdateProductDto = { productId: 1, stockQuantity: 20 };
      jest.spyOn(productsService, 'updateInventory').mockResolvedValue(null);

      const result = await productsController.updateInventory({...updateInventoryData, traceId: 'trace-id'});
      expect(result).toEqual({
        status: HttpStatus.NOT_FOUND,
        message: `Product ID ${updateInventoryData.productId} does not exist`,
      });
      expect(productsService.updateInventory).toHaveBeenCalledWith(updateInventoryData.productId, {
        stockQuantity: updateInventoryData.stockQuantity,
      });
    });
  });

  describe('createInventory', () => {
    it('should create a product and return the created product', async () => {
      const product: CreateProductDto = { 
        name: 'Product A', 
        stockQuantity: 10, 
        description: 'Desc',
        price: 32
      };
      const createdProduct = { id: 1, ...product };
      jest.spyOn(productsService, 'createProduct').mockResolvedValue(createdProduct as any);

      const result = await productsController.createInventory({...product, traceId: 'trace-id'});
      expect(result).toEqual(createdProduct);
      expect(productsService.createProduct).toHaveBeenCalledWith({...product, traceId: 'trace-id'});
    });
  });

  describe('bulkUpdateInventory', () => {
    it('should bulk update inventory and return the result', async () => {
      const data = {
        updateInventoryDto: [{ productId: 1, stockQuantity: 10 }],
        traceId: '12345',
      };
      const bulkUpdateResult = [{ id: 1, stockQuantity: 10 }];
      jest.spyOn(productsService, 'bulkUpdateInventory').mockResolvedValue({success: true});

      const result = await productsController.bulkUpdateInventory(data);
      expect(result).toEqual({success:true});
      expect(productsService.bulkUpdateInventory).toHaveBeenCalledWith(data.updateInventoryDto);
    });
  });
});
