import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import {
  AppLoggerModule,
  ConsulConfigFactory,
  HealthModule,
} from '@repo/common';
import Joi from 'joi';

@Module({
  imports: [
    AppLoggerModule,
    HealthModule.register({
      serviceName: 'analytics-service',
      dependencies: [{ name: 'rabbitmq', configKey: 'rabbitmq.url' }],
    }),
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
            rabbitmq: Joi.object({
              url: Joi.string().required(),
              username: Joi.string().default('guest'),
              password: Joi.string().default('guest'),
              vhost: Joi.string().default('/'),
              connectionTimeout: Joi.number().default(10000),
              heartbeat: Joi.number().default(60),
            }).optional(),
          }).unknown(true),
          'analytics-service',
        ),
      ],
      isGlobal: true,
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
