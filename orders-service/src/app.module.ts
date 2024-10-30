import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { OrdersModule } from './orders/orders.module';
import { CustomersModule } from './customers/customers.module';
import { DatabaseModule } from './database/database.module';
import { ConfigModule } from '@nestjs/config';
import * as Joi from 'joi';


@Module({
  imports: [ConfigModule.forRoot({
    envFilePath: '.env',
    validationSchema: Joi.object({
      DB_HOST: Joi.string().required(),
      DB_PORT: Joi.number().required(),
      DB_USER: Joi.string().required(),
      DB_PASSWORD: Joi.string().required().allow(null, ''),
      DB_NAME: Joi.string().required(),
    }),
  }), DatabaseModule, OrdersModule, CustomersModule, DatabaseModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
