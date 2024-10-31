import { Test, TestingModule } from '@nestjs/testing';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { OrderStatus, UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { HttpException } from '@nestjs/common';

describe('OrdersController', () => {
  let ordersController: OrdersController;
  let ordersService: OrdersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [OrdersController],
      providers: [
        {
          provide: OrdersService,
          useValue: {
            createOrder: jest.fn(),
            getOrderDetails: jest.fn(),
            listOrders: jest.fn(),
            updateOrderStatus: jest.fn(),
          },
        },
      ],
    }).compile();

    ordersController = module.get<OrdersController>(OrdersController);
    ordersService = module.get<OrdersService>(OrdersService);
  });

  describe('createOrder', () => {
    it('should create an order and return the order data', async () => {
      const createOrderDto: CreateOrderDto = {
        customer: {
          name: 'John Doe',
          email: 'john.doe@example.com',
          shippingAddress: '123 Main St',
        },
        items: [
          { productId: 1, quantity: 2 },
          { productId: 2, quantity: 1 },
        ],
        totalAmount: 49.99,
      };

      const response = { status: 201, data: createOrderDto };
      jest.spyOn(ordersService, 'createOrder').mockResolvedValue(response);

      const result = await ordersController.createOrder(createOrderDto);
      expect(result).toEqual(createOrderDto);
      expect(ordersService.createOrder).toHaveBeenCalledWith(createOrderDto);
    });

    it('should throw HttpException if the order creation fails', async () => {
      const createOrderDto: CreateOrderDto = {
        customer: {
          name: 'John Doe',
          email: 'john.doe@example.com',
          shippingAddress: '123 Main St',
        },
        items: [
          { productId: 1, quantity: 2 },
          { productId: 2, quantity: 1 },
        ],
        totalAmount: 49.99,
      };

      const response = { status: 400, message: 'Order creation failed' };
      jest.spyOn(ordersService, 'createOrder').mockResolvedValue(response);

      await expect(ordersController.createOrder(createOrderDto)).rejects.toThrow(HttpException);
      await expect(ordersController.createOrder(createOrderDto)).rejects.toThrow('Order creation failed');
      expect(ordersService.createOrder).toHaveBeenCalledWith(createOrderDto);
    });
  });

  describe('getOrderDetails', () => {
    it('should return order details', async () => {
      const orderId = '1';
      const response = { status: 200, data: { id: orderId } };
      jest.spyOn(ordersService, 'getOrderDetails').mockResolvedValue(response);

      const result = await ordersController.getOrderDetails(orderId);
      expect(result).toEqual({ id: orderId });
      expect(ordersService.getOrderDetails).toHaveBeenCalledWith(orderId);
    });

    it('should throw HttpException if fetching order details fails', async () => {
      const orderId = '1';
      const response = { status: 404, message: 'Order not found' };
      jest.spyOn(ordersService, 'getOrderDetails').mockResolvedValue(response);

      await expect(ordersController.getOrderDetails(orderId)).rejects.toThrow(HttpException);
      await expect(ordersController.getOrderDetails(orderId)).rejects.toThrow('Order not found');
      expect(ordersService.getOrderDetails).toHaveBeenCalledWith(orderId);
    });
  });

  describe('listOrders', () => {
    it('should return a list of orders', async () => {
      const response = { status: 200, data: [{ id: '1' }, { id: '2' }] };
      jest.spyOn(ordersService, 'listOrders').mockResolvedValue(response.data);

      const result = await ordersController.listOrders(1, 10);
      expect(result).toEqual(response.data);
      expect(ordersService.listOrders).toHaveBeenCalledWith(1, 10);
    });
  });

  describe('updateOrderStatus', () => {
    it('should update the order status and return the updated order data', async () => {
      const orderId = '1';
      const updateOrderStatusDto: UpdateOrderStatusDto = { status: OrderStatus.SHIPPED };
      const response = { status: 200, data: { id: orderId, status: 'SHIPPED' } };
      jest.spyOn(ordersService, 'updateOrderStatus').mockResolvedValue(response);

      const result = await ordersController.updateOrderStatus(orderId, updateOrderStatusDto);
      expect(result).toEqual({ id: orderId, status: 'SHIPPED' });
      expect(ordersService.updateOrderStatus).toHaveBeenCalledWith(orderId, updateOrderStatusDto);
    });

    it('should throw HttpException if updating order status fails', async () => {
      const orderId = '1';
      const updateOrderStatusDto: UpdateOrderStatusDto = { status: OrderStatus.SHIPPED };
      const response = { status: 400, message: 'Failed to update order status' };
      jest.spyOn(ordersService, 'updateOrderStatus').mockResolvedValue(response);

      await expect(ordersController.updateOrderStatus(orderId, updateOrderStatusDto)).rejects.toThrow(HttpException);
      await expect(ordersController.updateOrderStatus(orderId, updateOrderStatusDto)).rejects.toThrow('Failed to update order status');
      expect(ordersService.updateOrderStatus).toHaveBeenCalledWith(orderId, updateOrderStatusDto);
    });
  });
});
