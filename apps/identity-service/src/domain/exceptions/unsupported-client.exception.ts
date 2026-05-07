import { DomainException } from '@repo/common';

export class UnsupportedClientException extends DomainException {
  readonly code = 'UNSUPPORTED_CLIENT';

  constructor(client: string) {
    super(`Unsupported client: ${client}`);
  }
}
