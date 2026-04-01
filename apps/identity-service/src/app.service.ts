import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';

@Injectable()
export class AppService {
  getHello(): string {
    return 'Hello World!';
    //hihiiiiiii
  }
  constructor(@Inject('NOTI_SERVICE') private client: ClientProxy) {}

  async createUser(userDto: { email: string; name: string }) {
    // 1. Lưu user vào DB-identity của bạn
    // ...
    
    // 2. Bắn sự kiện sang Notification Service
    this.client.emit('user_created', { email: userDto.email, name: userDto.name });
    
    return { message: 'User created and notification triggered' };
  }
}
