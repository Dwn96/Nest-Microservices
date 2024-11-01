import { Test, TestingModule } from '@nestjs/testing';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { Repository } from 'typeorm';
import { Order, OrderStatus } from './entities/order.entity';
import { getRepositoryToken } from '@nestjs/typeorm';

describe('OrdersService', () => {
  let service: OrdersService;
  let orderRepository: Repository<Order>;

  const mockOrderRepository = {
    save: jest.fn(),
    findAndCount: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrdersService,
        { provide: getRepositoryToken(Order), useValue: mockOrderRepository },
      ],
    }).compile();

    service = module.get<OrdersService>(OrdersService);
    orderRepository = module.get<Repository<Order>>(getRepositoryToken(Order));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create and return an order', async () => {
      const createOrderDto: CreateOrderDto = {
        customer: { name: 'John Doe', email: 'john.doe@example.com', shippingAddress: '123 Main St' },
        items: [{ productId: 1, quantity: 2, price: 3 }],
        totalAmount: 49.99,
      };

      const savedOrder = { id: 1, ...createOrderDto }; // Simulating the saved order with an ID
      mockOrderRepository.save.mockResolvedValue(savedOrder);

      const result = await service.create(createOrderDto);
      expect(result).toEqual(savedOrder);
      expect(mockOrderRepository.save).toHaveBeenCalledWith(createOrderDto);
    });
  });

  describe('findAll', () => {
    it('should return a paginated list of orders', async () => {
      const page = 1;
      const limit = 10;
      const orders = [{ id: 1, customer: { name: 'John Doe' } }, { id: 2, customer: { name: 'Jane Doe' } }];
      mockOrderRepository.findAndCount.mockResolvedValue([orders, 2]);

      const result = await service.findAll(page, limit);
      expect(result).toEqual({
        data: orders,
        total: 2,
        page,
        limit,
        totalPages: 1,
      });
      expect(mockOrderRepository.findAndCount).toHaveBeenCalledWith({
        skip: 0,
        take: limit,
        order: { createdAt: 'DESC' },
        relations: ['customer'],
      });
    });
  });

  describe('findOne', () => {
    it('should return an order by id', async () => {
      const orderId = 1;
      const order = { id: orderId, customer: { name: 'John Doe' } };
      mockOrderRepository.findOne.mockResolvedValue(order);

      const result = await service.findOne(orderId);
      expect(result).toEqual(order);
      expect(mockOrderRepository.findOne).toHaveBeenCalledWith({
        where: { id: orderId },
        relations: ['customer'],
      });
    });
  });

  describe('update', () => {
    it('should update the order status and return the updated order', async () => {
      const orderId = 1;
      const updateOrderDto: UpdateOrderDto = {id: 12,  status: OrderStatus.DELIVERED};
      const updatedOrder = { id: orderId, status: 'DELIVERED', customer: { name: 'John Doe' } };

      mockOrderRepository.update.mockResolvedValue(undefined); // update doesn't return anything
      mockOrderRepository.findOne.mockResolvedValue(updatedOrder);

      const result = await service.update(orderId, updateOrderDto);
      expect(result).toEqual(updatedOrder);
      expect(mockOrderRepository.update).toHaveBeenCalledWith({ id: orderId }, { status: updateOrderDto.status });
    });
  });

  describe('calculateTotalQuantities', () => {
    it('should calculate total quantities for a given productId', () => {
      const orderItems = [
        { productId: '1', quantity: 2 },
        { productId: '2', quantity: 3 },
        { productId: '1', quantity: 5 },
      ];
      const productId = '1';
      const result = service.calculateTotalQuantities(orderItems, productId);
      expect(result).toBe(7);
    });

    it('should return 0 if productId is not found', () => {
      const orderItems = [
        { productId: '2', quantity: 3 },
        { productId: '3', quantity: 5 },
      ];
      const productId = '1';
      const result = service.calculateTotalQuantities(orderItems, productId);
      expect(result).toBe(0);
    });
  });
});
