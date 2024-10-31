import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { OrdersController } from './orders/orders.controller';
import { OrdersService } from './orders/orders.service';
import { InventoryController } from './inventory/inventory.controller';
import { InventoryService } from './inventory/inventory.service';
import { TracingMiddleware } from './middleware/tracing.middleware';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: 'ORDER',
        transport: Transport.REDIS,
        options: {
          host: 'localhost',
          port: 6379,
        }
      },
      {
        name: 'INVENTORY',
        transport: Transport.REDIS,
        options: {
          host: 'localhost',
          port: 6379,
        }
      }
    ])
  ],
  controllers: [OrdersController, InventoryController],
  providers: [OrdersService, InventoryService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(TracingMiddleware).forRoutes('*')
  }
}
