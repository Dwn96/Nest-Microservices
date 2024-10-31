import { Controller, HttpStatus } from '@nestjs/common';
import { ClientProxy, MessagePattern, Payload } from '@nestjs/microservices';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { FetchOrdersDTO } from './dto/fetch-orders.dto';
import { InventoryService } from 'src/inventory/inventory.service';
import { UpdateInventoryDto } from 'src/inventory/dto/update-inventory.dto';

@Controller()
export class OrdersController {
  constructor(
    private readonly ordersService: OrdersService,
    private readonly inventoryService: InventoryService
  ) { }

  @MessagePattern('createOrder')
  async create(@Payload() createOrderDto: CreateOrderDto) {

    const orderItemsProductIds = createOrderDto.items.map((item) => item.productId)

    const stockAvailability = await this.inventoryService.
      checkBulkAvailability({ productIds: orderItemsProductIds, flatten: true })


    const inventoryToUpdate = []
    let totalAmount = 0
    for (const orderItem of createOrderDto.items) {
      const orderedStock = orderItem.quantity
      const {stockQuantity:availableStock, price} = stockAvailability[orderItem.productId]

      const remainingStock = availableStock - orderedStock
      totalAmount += (price * orderedStock)
      orderItem.price = price

      if (remainingStock < 0) {
        return {
          status: HttpStatus.CONFLICT,
          data: null,
          message: `Could not process your order for product ID ${orderItem.productId}. Insufficient stock available`
        }
      }

      inventoryToUpdate.push({
        productId: orderItem.productId,
        stockQuantity: remainingStock
      })
    }

    createOrderDto.totalAmount = totalAmount

    await this.inventoryService.bulkUpdateInventory(inventoryToUpdate)
    const createdOrder = await this.ordersService.create(createOrderDto);

    if (createdOrder) {
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
