import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { PrismaService } from './prisma/prisma.service';

@Injectable()
export class AppService {
  constructor(
    @Inject('NOTI_SERVICE') private readonly client: ClientProxy,
    private readonly prisma: PrismaService,
  ) {}

  getHello(): string {
    return 'Hello World!';
  }

  async healthCheck() {
    await this.prisma.$queryRaw`SELECT 1`;
    return { status: 'ok', database: 'connected' };
  }

  async createUser(userDto: { email: string; name: string }) {
    const user = await this.prisma.identityUser.upsert({
      where: { email: userDto.email },
      update: { name: userDto.name },
      create: {
        email: userDto.email,
        name: userDto.name,
      },
    });

    this.client.emit('user_created', {
      userId: user.id,
      email: user.email,
      name: user.name,
    });

    return {
      message: 'User persisted and notification triggered',
      user,
    };
  }
}
