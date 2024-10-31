import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    return 'Hello World!';
  }

  handleUserCreated(user, ctx) {
    return {
      success: true,
      well: 'received'
    }
  }
}
