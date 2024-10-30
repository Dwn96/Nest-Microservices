import { Controller, HttpStatus } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { FetchOrdersDTO } from './dto/fetch-orders.dto';

@Controller()
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) { }

  @MessagePattern('createOrder')
  async create(@Payload() createOrderDto: CreateOrderDto) {
    const createdOrder =  await this.ordersService.create(createOrderDto);
    if(createdOrder) {
      return {
        status: HttpStatus.CREATED,
        data: createdOrder
      }
    }
    return {
      status: HttpStatus.CONFLICT,
      data: null
    }
  }

  @MessagePattern('listOrders')
  async findAll(@Payload() fetchOrdersDto: FetchOrdersDTO) {
    return await this.ordersService.findAll(fetchOrdersDto.page, fetchOrdersDto.limit);
  }

  @MessagePattern('getOrderDetails')
  async findOne(@Payload() id: number) {
    const order = await this.ordersService.findOne(id);
    if (order) return {
      status: HttpStatus.OK,
      data: order
    }
    return {
      status: HttpStatus.NOT_FOUND,
      message: `Order ID ${id} does not exist`,
      data: null
    }
  }

  @MessagePattern('updateOrderStatus')
  async update(@Payload() updateOrderDto: UpdateOrderDto) {
    console.log('up',updateOrderDto)
    const updatedOrder = await this.ordersService.update(updateOrderDto.id, updateOrderDto);
    if (updatedOrder) return {
      status: HttpStatus.OK,
      data: updatedOrder
    }
    return {
      status: HttpStatus.NOT_FOUND,
      message: `Order ID ${updateOrderDto.id} does not exist`,
      data: null
    }
  }
}
