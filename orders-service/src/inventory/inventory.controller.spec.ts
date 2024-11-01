import { Test, TestingModule } from '@nestjs/testing';
import { InventoryController } from './inventory.controller';
import { InventoryService } from './inventory.service';
import { CheckAvailabilityDto } from './dto/check-availability.dto';
import { UpdateInventoryDto } from './dto/update-inventory.dto';
import { HttpException, HttpStatus } from '@nestjs/common';

describe('InventoryController', () => {
  let inventoryController: InventoryController;
  let inventoryService: InventoryService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [InventoryController],
      providers: [
        {
          provide: InventoryService,
          useValue: {
            checkBulkAvailability: jest.fn(),
            updateInventory: jest.fn(),
          },
        },
      ],
    }).compile();

    inventoryController = module.get<InventoryController>(InventoryController);
    inventoryService = module.get<InventoryService>(InventoryService);
  });

  describe('checkBulkAvailability', () => {
    it('should return the result from InventoryService', async () => {
      const checkAvailabilityDto: CheckAvailabilityDto = {
        productIds: [1, 2],
      };
      const mockResponse = { product1: { stockQuantity: 10 }, product2: { stockQuantity: 5 } };
      
      jest.spyOn(inventoryService, 'checkBulkAvailability').mockResolvedValue(mockResponse);

      const result = await inventoryController.checkBulkAvailability(checkAvailabilityDto);
      expect(result).toEqual(mockResponse);
      expect(inventoryService.checkBulkAvailability).toHaveBeenCalledWith(checkAvailabilityDto);
    });
  });

  describe('updateInventory', () => {
    it('should return the response from InventoryService when status is OK', async () => {
      const productId = 'product1';
      const updateInventoryDto: UpdateInventoryDto = { stockQuantity: 20 };
      const mockResponse = { status: HttpStatus.OK, message: 'Inventory updated successfully' };

      jest.spyOn(inventoryService, 'updateInventory').mockResolvedValue(mockResponse);

      const result = await inventoryController.updateInventory(productId, updateInventoryDto);
      expect(result).toEqual(mockResponse);
      expect(inventoryService.updateInventory).toHaveBeenCalledWith(productId, updateInventoryDto);
    });

    it('should throw HttpException when InventoryService returns non-OK status', async () => {
      const productId = 'product1';
      const updateInventoryDto: UpdateInventoryDto = { stockQuantity: 0 };
      const mockResponse = { status: HttpStatus.BAD_REQUEST, message: 'Invalid stock quantity' };

      jest.spyOn(inventoryService, 'updateInventory').mockResolvedValue(mockResponse);

      await expect(inventoryController.updateInventory(productId, updateInventoryDto)).rejects.toThrow(
        new HttpException({ message: mockResponse.message }, mockResponse.status),
      );
    });
  });
});
