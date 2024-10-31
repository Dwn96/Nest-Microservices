import { Injectable } from '@nestjs/common';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Order } from './entities/order.entity';
import { Repository } from 'typeorm';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order) private orderRepository:Repository<Order>
  ){}
  async create(createOrderDto: CreateOrderDto) {
    return await this.orderRepository.save(createOrderDto)
  }

  async findAll(page: number, limit: number) {
    const [orders, total] = await this.orderRepository.findAndCount({
      skip: (page - 1) * limit,
      take: limit,
      order: {
        createdAt: 'DESC',
      },
      relations: ['customer']
    });

    return {
      data: orders,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: number) {
    return await this.orderRepository.findOne({
      where: {
        id
      },
      relations: ['customer']
    })
  }

  async update(id: number, updateOrderDto: UpdateOrderDto) {
    await this.orderRepository.update({id}, {status: updateOrderDto.status})
    return await this.findOne(id)
  }

  calculateTotalQuantities(orderItems: { productId: string; quantity: number }[], productId: string): number {
    let totalQuantity = 0;

    for (const item of orderItems) {
        if (item.productId === productId) {
            totalQuantity += item.quantity;
        }
    }

    return totalQuantity;
}

 
}
