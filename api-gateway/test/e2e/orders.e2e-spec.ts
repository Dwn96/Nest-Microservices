import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { AppModule } from '../../src/app.module'; // Adjust the path based on your structure
import * as request from 'supertest';
import { getConnection } from 'typeorm';
import { CreateOrderDto } from '../../src/orders/dto/create-order.dto';
import { OrderStatus, UpdateOrderStatusDto } from '../../src/orders/dto/update-order-status.dto';

describe('OrdersController (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule], // Import the main app module
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await getConnection().close();
    await app.close();
  });

  it('/orders (POST) - should create an order', async () => {
    const createOrderDto: CreateOrderDto = {
      items: [
        { productId: 1, quantity: 2 },
      ],
      customer: {
        name: 'Test N',
        email: 'mail@test.com',
        shippingAddress: 'North W, Jm St'
      }
    };

    const response = await request(app.getHttpServer())
      .post('/orders')
      .send(createOrderDto)
      .expect(201);

    expect(response.body).toHaveProperty('data');
    expect(response.body.data).toHaveProperty('id');
    expect(response.body.data.items).toEqual(createOrderDto.items);
  });

  it('/orders (GET) - should return a list of orders', async () => {
    const fetchOrdersDto = {
      page: 1,
      limit: 10,
    };

    const response = await request(app.getHttpServer())
      .get(`/orders?page=${fetchOrdersDto.page}&limit=${fetchOrdersDto.limit}`)
      .expect(200);

    expect(Array.isArray(response.body.data)).toBe(true);
  });

  it('/orders/:id (GET) - should return an order by ID', async () => {
    const orderId = 1;

    const response = await request(app.getHttpServer())
      .get(`/orders/${orderId}`)
      .expect(200);

    expect(response.body).toHaveProperty('data');
    expect(response.body.data.id).toBe(orderId);
  });

  it('/orders/:id (PUT) - should update an order status', async () => {
    const updateOrderDto: UpdateOrderStatusDto = {
      status: OrderStatus.DELIVERED
    };

    const response = await request(app.getHttpServer())
      .put(`/orders/1`)
      .send(updateOrderDto)
      .expect(200);

    expect(response.body).toHaveProperty('data');
    expect(response.body.data.status).toBe(updateOrderDto.status);
  });

  it('/orders/:id (GET) - should return NOT_FOUND for non-existing order', async () => {
    const nonExistingOrderId = 999;

    const response = await request(app.getHttpServer())
      .get(`/orders/${nonExistingOrderId}`)
      .expect(404);

    expect(response.body).toHaveProperty('message');
    expect(response.body.message).toMatch(/does not exist/);
  });
});
