import { Module } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { OrdersController } from './orders.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Order } from './entities/order.entity';
import { InventoryService } from 'src/inventory/inventory.service';
import { ClientsModule, Transport } from '@nestjs/microservices';

@Module({
  imports: [TypeOrmModule.forFeature([Order]),   ClientsModule.register([
    {
      name: 'INVENTORY',
      transport: Transport.REDIS,
      options: {
        host: 'localhost',
        port: 6379,
      }
    }
  ])],
  controllers: [OrdersController],
  providers: [OrdersService, InventoryService],
})
export class OrdersModule {}
