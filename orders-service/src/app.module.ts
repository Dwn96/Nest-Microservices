import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { OrdersModule } from './orders/orders.module';
import { CustomersModule } from './customers/customers.module';

@Module({
  imports: [OrdersModule, CustomersModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
