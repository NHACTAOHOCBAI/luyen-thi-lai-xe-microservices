import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  const port = configService.get<number>('port') ?? 3000;

  // Log config source for debugging
  console.log('✓ Configuration loaded from Consul (or .env fallback)');

  await app.listen(port);
  console.log(`✓ User Service listening on port ${port}`);
}
bootstrap();
