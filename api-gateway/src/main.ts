import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import * as morgan from 'morgan';
import * as fs from 'fs';
import * as path from 'path';
import { SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const swaggerFile = path.join(__dirname, '../swagger.json'); 
  const swaggerDoc = JSON.parse(fs.readFileSync(swaggerFile, 'utf-8'));

  SwaggerModule.setup('api-docs',app, swaggerDoc)
  app.setGlobalPrefix('api')
  app.useGlobalPipes(new ValidationPipe())
  app.use(morgan('combined'))
  await app.listen(process.env.PORT ?? 3000);

}
bootstrap();
