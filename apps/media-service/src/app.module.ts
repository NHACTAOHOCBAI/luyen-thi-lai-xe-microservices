import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ConsulConfigFactory } from '@repo/common';
import Joi from 'joi';
import { MediaModule } from './media.module';

@Module({
  imports: [
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
            port: Joi.number().default(3010),
            database: Joi.object({
              url: Joi.string().required(),
            }).optional(),
            rabbitmq: Joi.object({
              url: Joi.string().required(),
            }).optional(),
            storage: Joi.object({
              accountName: Joi.string().required(),
              accountKey: Joi.string().required(),
              containerName: Joi.string().default('media'),
              presignedUrlExpiry: Joi.number().default(3600),
            }).optional(),
          }).unknown(true),
          'media-service',
        ),
      ],
      isGlobal: true,
    }),
    MediaModule,
  ],
})
export class AppModule {}
