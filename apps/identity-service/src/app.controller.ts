import { Body, Controller, Get, Post } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }
  
  @Post('test-rabbitMQ')
  async createUser(
    @Body() body: { email: string; name: string }
  ) {
    console.log('Đang tạo người dùng với dữ liệu:', body);

    const result = await this.appService.createUser(body);

    return { message: result.message };
  }
}
