import { Controller, HttpStatus, Logger } from '@nestjs/common';
import { ClientProxy, MessagePattern, Payload } from '@nestjs/microservices';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { FetchOrdersDTO } from './dto/fetch-orders.dto';
import { InventoryService } from '../inventory/inventory.service';

@Controller()
export class OrdersController {
  constructor(
    private readonly ordersService: OrdersService,
    private readonly inventoryService: InventoryService
  ) { }

  private readonly logger = new Logger(OrdersController.name);

  @MessagePattern('createOrder')
  async create(@Payload() createOrderDto: CreateOrderDto & {traceId:string}) {
    this.logger.log(`[Trace ID: ${createOrderDto.traceId}] Received getOrderDetails request`, createOrderDto);    

    const orderItemsProductIds = createOrderDto.items.map((item) => item.productId)

    const stockAvailability = await this
      .inventoryService
      .checkBulkAvailability({ productIds: orderItemsProductIds, flatten: true, traceId: createOrderDto.traceId })


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

    console.log('toupdate', inventoryToUpdate);
      

    await this.inventoryService.bulkUpdateInventory(inventoryToUpdate, createOrderDto.traceId)
    delete createOrderDto.traceId
    const createdOrder  = await this.ordersService.create(createOrderDto);

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
  async findAll(@Payload() fetchOrdersDto: FetchOrdersDTO & {traceId:string}) {
    this.logger.log(`[Trace ID: ${fetchOrdersDto.traceId}] Received getOrderDetails request`, fetchOrdersDto);
    return await this.ordersService.findAll(fetchOrdersDto.page, fetchOrdersDto.limit);
  }

  @MessagePattern('getOrderDetails')
  async findOne(@Payload() data: {id:number } & {traceId:string}) {
    const {id, traceId } = data
    this.logger.log(`[Trace ID: ${traceId}] Received getOrderDetails request`, data);
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
  async update(@Payload() updateOrderDto: UpdateOrderDto & {traceId:string}) {
    this.logger.log(`[Trace ID: ${updateOrderDto.traceId}] Received getOrderDetails request`, updateOrderDto);
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
