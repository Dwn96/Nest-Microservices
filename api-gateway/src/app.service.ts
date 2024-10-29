import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class AppService {

  constructor(@Inject('ORDER') private readonly orderClient: ClientProxy){

  }
  getHello(): string {
    return 'Hello World!';
  }
  async createUser() {
    const response = await firstValueFrom(this.orderClient.send(
      'user_created', 
      {done: true}
    ))

    return response
  }
}
