import { DomainException } from '@repo/common';

export class IdentityUserNotFoundException extends DomainException {
  readonly code = 'IDENTITY_USER_NOT_FOUND';

  constructor(email: string) {
    super(`Identity user not found for email: ${email}`);
  }
}
