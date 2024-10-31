import { Test, TestingModule } from '@nestjs/testing';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { OrderStatus, UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { HttpException, HttpStatus } from '@nestjs/common';

describe('OrdersController', () => {
  let controller: OrdersController;
  let ordersService: Partial<OrdersService>;

  beforeEach(async () => {
    ordersService = {
      createOrder: jest.fn(),
      getOrderDetails: jest.fn(),
      listOrders: jest.fn(),
      updateOrderStatus: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [OrdersController],
      providers: [
        { provide: OrdersService, useValue: ordersService },
      ],
    }).compile();

    controller = module.get<OrdersController>(OrdersController);
  });

  describe('createOrder', () => {
    it('should create an order successfully', async () => {
      const createOrderDto: CreateOrderDto = {
        customer: {
          name: "John Doe",
          email: "john.doe@example.com",
          shippingAddress: "123 Main St, Anytown, USA"
        },
        items: [
          {
            productId: 1,
            quantity: 2
          },
          {
            productId: 2,
            quantity: 1
          }
        ],
        totalAmount: 49.99,  // Optional, but included
        status: OrderStatus.PENDING // Assuming OrderStatus is an enum with values like PENDING, SHIPPED, etc.
      };
      const response = { status: HttpStatus.CREATED, data: { orderId: '123' } };
      jest.spyOn(ordersService, 'createOrder').mockResolvedValue(response);

      const result = await controller.createOrder(createOrderDto);
      expect(result).toEqual(response.data);
      expect(ordersService.createOrder).toHaveBeenCalledWith(createOrderDto);
    });

    it('should throw an HttpException on failed order creation', async () => {
      const createOrderDto: CreateOrderDto = {
        customer: {
          name: "John Doe",
          email: "john.doe@example.com",
          shippingAddress: "123 Main St, Anytown, USA"
        },
        items: [
          {
            productId: 1,
            quantity: 2
          },
          {
            productId: 2,
            quantity: 1
          }
        ],
        totalAmount: 49.99,  // Optional, but included
        status: OrderStatus.PENDING // Assuming OrderStatus is an enum with values like PENDING, SHIPPED, etc.
      };
      const response = { status: HttpStatus.BAD_REQUEST, message: 'Failed to create order' };
      jest.spyOn(ordersService, 'createOrder').mockResolvedValue(response);

      await expect(controller.createOrder(createOrderDto)).rejects.toThrow(HttpException);
      await expect(controller.createOrder(createOrderDto)).rejects.toThrow(new HttpException({
        message: response.message,
      }, response.status));
    });
  });

  describe('getOrderDetails', () => {
    it('should return order details successfully', async () => {
      const response = { status: HttpStatus.OK, data: { orderId: '123', items: [] } };
      jest.spyOn(ordersService, 'getOrderDetails').mockResolvedValue(response);

      const result = await controller.getOrderDetails('123');
      expect(result).toEqual(response.data);
      expect(ordersService.getOrderDetails).toHaveBeenCalledWith('123');
    });

    it('should throw an HttpException on failed order retrieval', async () => {
      const response = { status: HttpStatus.NOT_FOUND, message: 'Order not found' };
      jest.spyOn(ordersService, 'getOrderDetails').mockResolvedValue(response);

      await expect(controller.getOrderDetails('123')).rejects.toThrow(HttpException);
      await expect(controller.getOrderDetails('123')).rejects.toThrow(new HttpException({
        message: response.message,
      }, response.status));
    });
  });

  describe('listOrders', () => {
    it('should return a list of orders', async () => {
      const response = { orders: [], totalCount: 0 };
      jest.spyOn(ordersService, 'listOrders').mockResolvedValue(response);

      const result = await controller.listOrders(1, 10);
      expect(result).toEqual(response);
      expect(ordersService.listOrders).toHaveBeenCalledWith(1, 10);
    });
  });

  describe('updateOrderStatus', () => {
    it('should update order status successfully', async () => {
      const updateOrderStatusDto: UpdateOrderStatusDto = { status: OrderStatus.DELIVERED};
      const response = { status: HttpStatus.OK, data: { orderId: '123', status: 'updated' } };
      jest.spyOn(ordersService, 'updateOrderStatus').mockResolvedValue(response);

      const result = await controller.updateOrderStatus('123', updateOrderStatusDto);
      expect(result).toEqual(response.data);
      expect(ordersService.updateOrderStatus).toHaveBeenCalledWith('123', updateOrderStatusDto);
    });

    it('should throw an HttpException on failed status update', async () => {
      const updateOrderStatusDto: UpdateOrderStatusDto = { status: OrderStatus.DELIVERED };
      const response = { status: HttpStatus.BAD_REQUEST, message: 'Failed to update order status' };
      jest.spyOn(ordersService, 'updateOrderStatus').mockResolvedValue(response);

      await expect(controller.updateOrderStatus('123', updateOrderStatusDto)).rejects.toThrow(HttpException);
      await expect(controller.updateOrderStatus('123', updateOrderStatusDto)).rejects.toThrow(new HttpException({
        message: response.message,
      }, response.status));
    });
  });
});
