import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
async function bootstrap() {
  // 1. Khởi tạo Web Server (HTTP)
  const app = await NestFactory.create(AppModule);

  // 2. Kết nối thêm Microservice (RabbitMQ)
  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.RMQ,
    options: {
      urls: ['amqp://rabbitmq:5672'],
      queue: 'orders_queue',
    },
  });

  // 3. Khởi động cả hai
  await app.startAllMicroservices(); // Chạy RabbitMQ ngầm
  await app.listen(process.env.PORT ?? 3000);       // Mở cổng 3002 cho HTTP
}
bootstrap();