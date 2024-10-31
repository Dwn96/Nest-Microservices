import { Module } from '@nestjs/common';
import { OrdersModule } from './orders/orders.module';
import { CustomersModule } from './customers/customers.module';
import { DatabaseModule } from './database/database.module';
import { ConfigModule } from '@nestjs/config';
import * as Joi from 'joi';
import { ClientsModule, Transport } from '@nestjs/microservices';


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
  }),
    DatabaseModule, OrdersModule, CustomersModule, DatabaseModule],
})
export class AppModule { }
