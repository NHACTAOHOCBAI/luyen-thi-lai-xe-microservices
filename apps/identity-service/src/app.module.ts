import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ClientsModule, Transport } from '@nestjs/microservices';
import Joi from 'joi';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaService } from './prisma/prisma.service';
import { AppLoggerModule, ConsulConfigFactory } from '@repo/common';
import { AuthController } from './presentation/http/auth.controller';
import { LoginUseCase } from './application/use-cases/login/login.use-case';
import { EventPublisher } from './application/ports/event-publisher.port';
import { IdentityUserRepository } from './domain/repositories/identity-user.repository';
import { DomainExceptionFilter } from './infrastructure/filters/domain-exception.filter';
import { KeycloakService } from './infrastructure/keycloak/keycloak.service';
import {
  RABBITMQ_CLIENT,
  RabbitMqEventPublisher,
} from './infrastructure/messaging/rabbitmq-event-publisher.service';
import { PrismaIdentityUserRepository } from './infrastructure/persistence/prisma/prisma-identity-user.repository';

@Module({
  imports: [
    AppLoggerModule,
    ConfigModule.forRoot({
      load: [
        ConsulConfigFactory.create(
          Joi.object({
            nodeEnv: Joi.string()
              .valid(
                'development',
                'development-local',
                'staging',
                'production',
              )
              .default('development'),
            port: Joi.number().default(3000),
            database: Joi.object({
              url: Joi.string().required(),
              poolSize: Joi.number().default(10),
              connectionTimeout: Joi.number().default(5000),
            }).optional(),
            rabbitmq: Joi.object({
              url: Joi.string().required(),
              username: Joi.string().default('guest'),
              password: Joi.string().default('guest'),
              vhost: Joi.string().default('/'),
              connectionTimeout: Joi.number().default(10000),
              heartbeat: Joi.number().default(60),
            }).optional(),
            keycloak: Joi.object({
              baseUrl: Joi.string().uri().default('http://localhost:8080'),
              realm: Joi.string().default('dev-realm'),
              mobileClientId: Joi.string().default('mobile-client'),
              webClientId: Joi.string().default('web-client'),
              mobileClientSecret: Joi.string().optional(),
              webClientSecret: Joi.string().optional(),
            }).optional(),
          }).unknown(true),
          'identity-service',
        ),
      ],
      isGlobal: true,
    }),
    ClientsModule.registerAsync([
      {
        name: RABBITMQ_CLIENT,
        imports: [ConfigModule],
        inject: [ConfigService],
        useFactory: (configService: ConfigService) => ({
          transport: Transport.RMQ,
          options: {
            urls: [
              configService.get<string>('rabbitmq.url') ??
                'amqp://localhost:5672',
            ],
            queue: 'identity_service_publish',
            queueOptions: { durable: true },
          },
        }),
      },
    ]),
  ],
  controllers: [AppController, AuthController],
  providers: [
    AppService,
    PrismaService,
    DomainExceptionFilter,
    KeycloakService,
    LoginUseCase,
    { provide: IdentityUserRepository, useClass: PrismaIdentityUserRepository },
    { provide: EventPublisher, useClass: RabbitMqEventPublisher },
  ],
})
export class AppModule {}
