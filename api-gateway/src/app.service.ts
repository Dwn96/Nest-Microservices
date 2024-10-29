import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';

@Injectable()
export class AppService {

  constructor(@Inject('ORDER') private readonly orderClient: ClientProxy){

  }
  getHello(): string {
    return 'Hello World!';
  }
  createUser(): string {
    this.orderClient.emit(
      'user_created', 
      {done: true}
    )

    return 'User Created'
  }
}
