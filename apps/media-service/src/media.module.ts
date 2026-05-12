import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { MulterModule } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { EventPublisher } from './application/ports/event-publisher.port';
import { StoragePort } from './application/ports/storage.port';
import { DeleteFileUseCase } from './application/use-cases/delete-file/delete-file.use-case';
import { GetFileMetadataUseCase } from './application/use-cases/get-file-metadata/get-file-metadata.use-case';
import { GetPresignedUrlUseCase } from './application/use-cases/get-presigned-url/get-presigned-url.use-case';
import { ListFilesUseCase } from './application/use-cases/list-files/list-files.use-case';
import { UploadFileUseCase } from './application/use-cases/upload-file/upload-file.use-case';
import { FileObjectRepository } from './domain/repositories/file-object.repository';
import { DomainExceptionFilter } from './infrastructure/filters/domain-exception.filter';
import {
  RABBITMQ_CLIENT,
  RabbitMqEventPublisher,
} from './infrastructure/messaging/rabbitmq-event-publisher.service';
import { PrismaFileObjectRepository } from './infrastructure/persistence/prisma/prisma-file-object.repository';
import { PrismaService } from './infrastructure/persistence/prisma/prisma.service';
import { AzureBlobStorageProvider } from './infrastructure/storage/azure-blob-storage.provider';
import { MediaController } from './presentation/http/media.controller';

@Module({
  imports: [
    MulterModule.register({
      storage: memoryStorage(),
      limits: { fileSize: 10 * 1024 * 1024 },
    }),
    ClientsModule.registerAsync([
      {
        name: RABBITMQ_CLIENT,
        inject: [ConfigService],
        useFactory: (config: ConfigService) => ({
          transport: Transport.RMQ,
          options: {
            urls: [
              config.get<string>('rabbitmq.url') ?? 'amqp://localhost:5672',
            ],
            queue: 'media_service_publish',
            queueOptions: { durable: true },
          },
        }),
      },
    ]),
  ],
  controllers: [MediaController],
  providers: [
    PrismaService,
    DomainExceptionFilter,

    { provide: FileObjectRepository, useClass: PrismaFileObjectRepository },
    { provide: StoragePort, useClass: AzureBlobStorageProvider },
    { provide: EventPublisher, useClass: RabbitMqEventPublisher },

    UploadFileUseCase,
    GetFileMetadataUseCase,
    GetPresignedUrlUseCase,
    DeleteFileUseCase,
    ListFilesUseCase,
  ],
})
export class MediaModule {}
