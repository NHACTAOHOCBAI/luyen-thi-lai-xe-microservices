import { Inject, Injectable } from '@nestjs/common';
import type { ClientProxy } from '@nestjs/microservices';
import { lastValueFrom } from 'rxjs';
import { EventPublisher } from '../../application/ports/event-publisher.port';

export const RABBITMQ_CLIENT = 'RABBITMQ_CLIENT';

@Injectable()
export class RabbitMqEventPublisher extends EventPublisher {
  constructor(@Inject(RABBITMQ_CLIENT) private readonly client: ClientProxy) {
    super();
  }

  override async publish(eventName: string, payload: unknown): Promise<void> {
    await lastValueFrom(this.client.emit(eventName, payload));
  }
}
