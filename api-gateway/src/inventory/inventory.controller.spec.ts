import { Test, TestingModule } from '@nestjs/testing';
import { InventoryController } from './inventory.controller';
import { InventoryService } from './inventory.service';
import { CheckAvailabilityDto } from './dto/check-availability.dto';
import { UpdateInventoryDto } from './dto/update-inventory.dto';
import { CreateInventoryDto } from './dto/create-inventory.dto';
import { HttpStatus, HttpException } from '@nestjs/common';

describe('InventoryController', () => {
    let inventoryController: InventoryController;
    let inventoryService: jest.Mocked<InventoryService>;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [InventoryController],
            providers: [
                {
                    provide: InventoryService,
                    useValue: {
                        getProductAvailability: jest.fn(),
                        checkBulkAvailability: jest.fn(),
                        updateInventory: jest.fn(),
                        createInventory: jest.fn(),
                    },
                },
            ],
        }).compile();

        inventoryController = module.get<InventoryController>(InventoryController);
        inventoryService = module.get(InventoryService);
    });

    describe('getProductAvailability', () => {
        it('should return product availability if status is OK', async () => {
            const productId = 'test-product';
            const response = { status: HttpStatus.OK, message: 'Product available' };
            inventoryService.getProductAvailability.mockResolvedValue(response);

            const result = await inventoryController.getProductAvailability(productId);
            expect(result).toEqual(response);
            expect(inventoryService.getProductAvailability).toHaveBeenCalledWith(productId);
        });

        it('should throw HttpException if status is not OK', async () => {
            const productId = 'test-product';
            const response = { status: HttpStatus.BAD_REQUEST, message: 'Product not found' };
            inventoryService.getProductAvailability.mockResolvedValue(response);

            await expect(inventoryController.getProductAvailability(productId)).rejects.toThrow(
                new HttpException({ message: response.message }, response.status)
            );
        });
    });

    describe('checkBulkAvailability', () => {
        it('should return bulk availability', async () => {
            const dto: CheckAvailabilityDto = { productIds: [12, 1, 2 ] };
            const response = { status: HttpStatus.OK, data: 'Available' };
            inventoryService.checkBulkAvailability.mockResolvedValue(response);

            const result = await inventoryController.checkBulkAvailability(dto);
            expect(result).toEqual(response);
            expect(inventoryService.checkBulkAvailability).toHaveBeenCalledWith(dto);
        });
    });

    describe('updateInventory', () => {
        it('should return updated inventory if status is OK', async () => {
            const productId = 'test-product';
            const dto: UpdateInventoryDto = { stockQuantity: 10 };
            const response = { status: HttpStatus.OK, message: 'Inventory updated' };
            inventoryService.updateInventory.mockResolvedValue(response);

            const result = await inventoryController.updateInventory(productId, dto);
            expect(result).toEqual(response);
            expect(inventoryService.updateInventory).toHaveBeenCalledWith(productId, dto);
        });

        it('should throw HttpException if status is not OK', async () => {
            const productId = 'test-product';
            const dto: UpdateInventoryDto = { stockQuantity: 10 };
            const response = { status: HttpStatus.BAD_REQUEST, message: 'Update failed' };
            inventoryService.updateInventory.mockResolvedValue(response);

            await expect(inventoryController.updateInventory(productId, dto)).rejects.toThrow(
                new HttpException({ message: response.message }, response.status)
            );
        });
    });

    describe('createInventory', () => {
        it('should return created inventory', async () => {
            const dto: CreateInventoryDto = { 
              name: "Test product", 
              description: "test description",
              price: 32,
              stockQuantity: 23,

            }
            const response = { status: HttpStatus.CREATED, data: 'Inventory created' };
            inventoryService.createInventory.mockResolvedValue(response);

            const result = await inventoryController.createInventory(dto);
            expect(result).toEqual(response);
            expect(inventoryService.createInventory).toHaveBeenCalledWith(dto);
        });
    });
});
