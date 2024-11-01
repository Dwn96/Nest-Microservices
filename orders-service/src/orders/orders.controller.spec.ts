import { Test, TestingModule } from '@nestjs/testing';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';
import { InventoryService } from '../inventory/inventory.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { FetchOrdersDTO } from './dto/fetch-orders.dto';
import { HttpStatus } from '@nestjs/common';
import { OrderStatus } from './entities/order.entity';

describe('OrdersController', () => {
  let controller: OrdersController;
  let ordersService: OrdersService;
  let inventoryService: InventoryService;

  const mockOrdersService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
  };

  const mockInventoryService = {
    checkBulkAvailability: jest.fn(),
    bulkUpdateInventory: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [OrdersController],
      providers: [
        { provide: OrdersService, useValue: mockOrdersService },
        { provide: InventoryService, useValue: mockInventoryService },
      ],
    }).compile();

    controller = module.get<OrdersController>(OrdersController);
    ordersService = module.get<OrdersService>(OrdersService);
    inventoryService = module.get<InventoryService>(InventoryService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create an order successfully', async () => {
      const traceId = '12345'
      const createOrderDto: CreateOrderDto & { traceId: string } = {
        traceId,
        items: [{ productId: 1, quantity: 2 }],
        customer: {
          name: 'Test name',
          email: 'test@mail.com',
          shippingAddress: 'West 3'
        }
      };

      const stockAvailability = {
        '1': { stockQuantity: 10, price: 25.0 },
      };

      const createdOrder = { id: 1, ...createOrderDto, totalAmount: 50.0 };

      mockInventoryService.checkBulkAvailability.mockResolvedValue(stockAvailability);
      mockOrdersService.create.mockResolvedValue(createdOrder);
      mockInventoryService.bulkUpdateInventory.mockResolvedValue(undefined);

      const result = await controller.create(createOrderDto);
      expect(result).toEqual({
        status: HttpStatus.CREATED,
        data: createdOrder,
      });
      expect(mockInventoryService.checkBulkAvailability).toHaveBeenCalledWith({
        productIds: [1],
        flatten: true,
        traceId,
      });
      expect(mockOrdersService.create).toHaveBeenCalledWith({
        ...createOrderDto,
        totalAmount: 50.0,
      });
    });

    it('should return CONFLICT if insufficient stock', async () => {
      const createOrderDto: CreateOrderDto & { traceId: string } = {
        traceId: '12345',
        items: [{ productId: 1, quantity: 15 }],
        customer: {
          name: 'Test name',
          email: 'test@mail.com',
          shippingAddress: 'West 3'
        }
      };

      const stockAvailability = {
        '1': { stockQuantity: 10, price: 25.0 },
      };

      mockInventoryService.checkBulkAvailability.mockResolvedValue(stockAvailability);

      const result = await controller.create(createOrderDto);
      expect(result).toEqual({
        status: HttpStatus.CONFLICT,
        data: null,
        message: 'Could not process your order for product ID 1. Insufficient stock available',
      });
    });
  });

  describe('findAll', () => {
    it('should return a paginated list of orders', async () => {
      const fetchOrdersDto: FetchOrdersDTO & { traceId: string } = {
        traceId: '12345',
        page: 1,
        limit: 10,
      };

      const orders = [{ id: 1 }, { id: 2 }];
      mockOrdersService.findAll.mockResolvedValue(orders);

      const result = await controller.findAll(fetchOrdersDto);
      expect(result).toEqual(orders);
      expect(mockOrdersService.findAll).toHaveBeenCalledWith(fetchOrdersDto.page, fetchOrdersDto.limit);
    });
  });

  describe('findOne', () => {
    it('should return an order by id', async () => {
      const orderId = 1;
      const traceId = '12345';
      const order = { id: orderId };

      mockOrdersService.findOne.mockResolvedValue(order);

      const result = await controller.findOne({ id: orderId, traceId });
      expect(result).toEqual({
        status: HttpStatus.OK,
        data: order,
      });
      expect(mockOrdersService.findOne).toHaveBeenCalledWith(orderId);
    });

    it('should return NOT_FOUND if order does not exist', async () => {
      const orderId = 999;
      const traceId = '12345';

      mockOrdersService.findOne.mockResolvedValue(null);

      const result = await controller.findOne({ id: orderId, traceId });
      expect(result).toEqual({
        status: HttpStatus.NOT_FOUND,
        message: `Order ID ${orderId} does not exist`,
        data: null,
      });
    });
  });

  describe('update', () => {
    it('should update the order status and return the updated order', async () => {
      const updateOrderDto: UpdateOrderDto & { traceId: string } = {
        id: 1,
        status: OrderStatus.DELIVERED,
        traceId: '12345',
      };
      const updatedOrder = { id: updateOrderDto.id, status: 'DELIVERED' };

      mockOrdersService.update.mockResolvedValue(updatedOrder);

      const result = await controller.update(updateOrderDto);
      expect(result).toEqual({
        status: HttpStatus.OK,
        data: updatedOrder,
      });
      expect(mockOrdersService.update).toHaveBeenCalledWith(updateOrderDto.id, updateOrderDto);
    });

    it('should return NOT_FOUND if order does not exist when updating', async () => {
      const updateOrderDto: UpdateOrderDto & { traceId: string } = {
        id: 999,
        status: OrderStatus.DELIVERED,
        traceId: '12345',
      };

      mockOrdersService.update.mockResolvedValue(null);

      const result = await controller.update(updateOrderDto);
      expect(result).toEqual({
        status: HttpStatus.NOT_FOUND,
        message: `Order ID ${updateOrderDto.id} does not exist`,
        data: null,
      });
    });
  });
});
