import { DomainException } from '@repo/common';

export class InvalidCredentialsException extends DomainException {
  readonly code = 'INVALID_CREDENTIALS';

  constructor(email: string) {
    super(`Invalid credentials for email: ${email}`);
  }
}
