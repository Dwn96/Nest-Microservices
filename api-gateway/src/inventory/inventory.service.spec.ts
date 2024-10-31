import { Test, TestingModule } from '@nestjs/testing';
import { InventoryService } from './inventory.service';
import { ClientProxy } from '@nestjs/microservices';
import { NotFoundException } from '@nestjs/common';
import { of, throwError } from 'rxjs';
import { CheckAvailabilityDto } from './dto/check-availability.dto';
import { UpdateInventoryDto } from './dto/update-inventory.dto';
import { CreateInventoryDto } from './dto/create-inventory.dto';

describe('InventoryService', () => {
  let service: InventoryService;
  let inventoryClientMock: jest.Mocked<ClientProxy>;
  const requestMock = { headers: { 'x-trace-id': 'test-trace-id' } } as any;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        InventoryService,
        {
          provide: 'INVENTORY',
          useValue: { send: jest.fn() },
        },
        {
          provide: 'REQUEST',
          useValue: requestMock,
        },
      ],
    }).compile();

    service = await module.resolve<InventoryService>(InventoryService);
    service['MAX_RETRY_ATTEMPTS'] = 0
    service['RETRY_DELAY'] = 0
    inventoryClientMock = module.get<ClientProxy>('INVENTORY') as jest.Mocked<ClientProxy>;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getProductAvailability', () => {
    it('should return product availability if found', async () => {
      const productId = '123';
      const mockResponse = { status: 200, data: { available: true } };
      inventoryClientMock.send.mockReturnValueOnce(of(mockResponse));

      const result = await service.getProductAvailability(productId);
      expect(result).toEqual(mockResponse);
      expect(inventoryClientMock.send).toHaveBeenCalledWith(
        'getProductAvailability',
        { productId, traceId: 'test-trace-id' }
      );
    });

    it('should throw NotFoundException if product not found', async () => {
      const productId = '123';
      inventoryClientMock.send.mockReturnValueOnce(throwError(() => new Error('Not Found')));

      await expect(service.getProductAvailability(productId)).rejects.toThrow(NotFoundException);
      expect(inventoryClientMock.send).toHaveBeenCalledWith(
        'getProductAvailability',
        { productId, traceId: 'test-trace-id' }
      );
    });
  });

  describe('checkBulkAvailability', () => {
    it('should return bulk availability', async () => {
      const dto: CheckAvailabilityDto = { productIds: [23, 56] };
      const mockResponse = { status: 200, data: { available: true } };
      inventoryClientMock.send.mockReturnValueOnce(of(mockResponse));

      const result = await service.checkBulkAvailability(dto);
      expect(result).toEqual(mockResponse);
      expect(inventoryClientMock.send).toHaveBeenCalledWith(
        'checkBulkAvailability',
        { ...dto, traceId: 'test-trace-id' }
      );
    });

    it('should throw error if bulk availability check fails', async () => {
      const dto: CheckAvailabilityDto = { productIds: [123, 56] };
      inventoryClientMock.send.mockReturnValueOnce(throwError(() => new Error('Bulk check failed')));

      await expect(service.checkBulkAvailability(dto)).rejects.toThrow('Bulk check failed');
      expect(inventoryClientMock.send).toHaveBeenCalledWith(
        'checkBulkAvailability',
        { ...dto, traceId: 'test-trace-id' }
      );
    });
  });

  describe('updateInventory', () => {
    it('should update inventory successfully', async () => {
      const productId = '123';
      const dto: UpdateInventoryDto = { stockQuantity: 10 };
      const mockResponse = { status: 200, data: { updated: true } };
      inventoryClientMock.send.mockReturnValueOnce(of(mockResponse));

      const result = await service.updateInventory(productId, dto);
      expect(result).toEqual(mockResponse);
      expect(inventoryClientMock.send).toHaveBeenCalledWith(
        'updateInventory',
        { productId, ...dto, traceId: 'test-trace-id' }
      );
    });

    it('should throw error if inventory update fails', async () => {
      const productId = '123';
      const dto: UpdateInventoryDto = { stockQuantity: 10 };
      inventoryClientMock.send.mockReturnValueOnce(throwError(() => new Error('Update failed')));

      await expect(service.updateInventory(productId, dto)).rejects.toThrow('Update failed');
      expect(inventoryClientMock.send).toHaveBeenCalledWith(
        'updateInventory',
        { productId, ...dto, traceId: 'test-trace-id' }
      );
    });
  });

  describe('createInventory', () => {
    it('should create inventory successfully', async () => {
      const dto: CreateInventoryDto = {
        name: 'Product 1',
        description: 'Product description',
        price: 10.5,
        stockQuantity: 100,
      };
      const mockResponse = { status: 201, data: { id: 'new-id' } };
      inventoryClientMock.send.mockReturnValueOnce(of(mockResponse));

      const result = await service.createInventory(dto);
      expect(result).toEqual(mockResponse);
      expect(inventoryClientMock.send).toHaveBeenCalledWith(
        'createInventory',
        { ...dto, traceId: 'test-trace-id' }
      );
    });

    it('should throw error if inventory creation fails', async () => {
      const dto: CreateInventoryDto = {
        name: 'Product 1',
        description: 'Product description',
        price: 10.5,
        stockQuantity: 100,
      };
      inventoryClientMock.send.mockReturnValueOnce(throwError(() => new Error('Creation failed')));

      await expect(service.createInventory(dto)).rejects.toThrow('Creation failed');
      expect(inventoryClientMock.send).toHaveBeenCalledWith(
        'createInventory',
        { ...dto, traceId: 'test-trace-id' }
      );
    });
  });
});
