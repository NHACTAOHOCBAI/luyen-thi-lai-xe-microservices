import { DomainEvent } from '@repo/common';
import type { IdentityUserSnapshot } from '../aggregate/identity-user.types';

export class IdentityUserCreatedEvent extends DomainEvent {
  constructor(public readonly user: IdentityUserSnapshot) {
    super();
  }

  override get eventName(): string {
    return 'identity.user.created';
  }
}
