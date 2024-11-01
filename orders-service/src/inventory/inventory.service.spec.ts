import { Test, TestingModule } from '@nestjs/testing';
import { InventoryService } from './inventory.service';
import { ClientProxy } from '@nestjs/microservices';
import { of, throwError } from 'rxjs';
import { CheckAvailabilityDto } from './dto/check-availability.dto';
import { UpdateInventoryDto } from './dto/update-inventory.dto';

describe('InventoryService', () => {
  let inventoryService: InventoryService;
  let clientProxyMock: jest.Mocked<ClientProxy>;

  beforeEach(async () => {
    clientProxyMock = {
      send: jest.fn(),
    } as unknown as jest.Mocked<ClientProxy>;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        InventoryService,
        { provide: 'INVENTORY', useValue: clientProxyMock },
      ],
    }).compile();

    inventoryService = module.get<InventoryService>(InventoryService);
    inventoryService['RETRY_DELAY'] = 0
    inventoryService['MAX_RETRY_ATTEMPTS']=0
  });

  describe('checkBulkAvailability', () => {
    it('should return result when checkBulkAvailability succeeds', async () => {
      const dto: CheckAvailabilityDto = { productIds: [1,2] };
      const mockResponse = { product1: { stockQuantity: 10 }, product2: { stockQuantity: 5 } };

      clientProxyMock.send.mockReturnValue(of(mockResponse));

      const result = await inventoryService.checkBulkAvailability(dto);
      expect(result).toEqual(mockResponse);
      expect(clientProxyMock.send).toHaveBeenCalledWith('checkBulkAvailability', dto);
    });

    it('should retry and throw an error if checkBulkAvailability fails', async () => {
      const dto: CheckAvailabilityDto = { productIds: [1,2] };
      const mockError = new Error('Failed to check availability');

      clientProxyMock.send.mockReturnValue(throwError(() => mockError));

      await expect(inventoryService.checkBulkAvailability(dto)).rejects.toThrow(mockError);
      expect(clientProxyMock.send).toHaveBeenCalledWith('checkBulkAvailability', dto);
    });
  });

  describe('updateInventory', () => {
    it('should return result when updateInventory succeeds', async () => {
      const productId = 'product1';
      const dto: UpdateInventoryDto = { stockQuantity: 15 };
      const mockResponse = { status: 'success', productId, updatedStock: 15 };

      clientProxyMock.send.mockReturnValue(of(mockResponse));

      const result = await inventoryService.updateInventory(productId, dto);
      expect(result).toEqual(mockResponse);
      expect(clientProxyMock.send).toHaveBeenCalledWith('updateInventory', { productId, ...dto });
    });

    it('should retry and throw an error if updateInventory fails', async () => {
      const productId = 'product1';
      const dto: UpdateInventoryDto = { stockQuantity: 0 };
      const mockError = new Error('Failed to update inventory');

      clientProxyMock.send.mockReturnValue(throwError(() => mockError));

      await expect(inventoryService.updateInventory(productId, dto)).rejects.toThrow(mockError);
      expect(clientProxyMock.send).toHaveBeenCalledWith('updateInventory', { productId, ...dto });
    });
  });

  describe('bulkUpdateInventory', () => {
    it('should return result when bulkUpdateInventory succeeds', async () => {
      const updateInventoryDto: UpdateInventoryDto[] = [
        { productId: 1, stockQuantity: 15 },
        { productId: 3, stockQuantity: 10 },
      ];
      const traceId = '12345';
      const mockResponse = { status: 'success', updatedItems: updateInventoryDto.length };

      clientProxyMock.send.mockReturnValue(of(mockResponse));

      const result = await inventoryService.bulkUpdateInventory(updateInventoryDto, traceId);
      expect(result).toEqual(mockResponse);
      expect(clientProxyMock.send).toHaveBeenCalledWith('bulkUpdateInventory', { updateInventoryDto, traceId });
    });

    it('should retry and throw an error if bulkUpdateInventory fails', async () => {
      const updateInventoryDto: UpdateInventoryDto[] = [
        { productId: 1, stockQuantity: 0 },
      ];
      const traceId = '12345';
      const mockError = new Error('Failed to bulk update inventory');

      clientProxyMock.send.mockReturnValue(throwError(() => mockError));

      await expect(inventoryService.bulkUpdateInventory(updateInventoryDto, traceId)).rejects.toThrow(mockError);
      expect(clientProxyMock.send).toHaveBeenCalledWith('bulkUpdateInventory', { updateInventoryDto, traceId });
    });
  });
});
