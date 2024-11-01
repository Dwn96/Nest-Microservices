import { Module } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { OrdersController } from './orders.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Order } from './entities/order.entity';
import { InventoryService } from 'src/inventory/inventory.service';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({isGlobal: true}),  
    TypeOrmModule.forFeature([Order]),   
    ClientsModule.register([
    {
      name: 'INVENTORY',
      transport: Transport.REDIS,
      options: {
        host: process.env.REDIS_HOST,
        port: 6379,
      }
    }
  ])],
  controllers: [OrdersController],
  providers: [OrdersService, InventoryService],
})
export class OrdersModule {}
