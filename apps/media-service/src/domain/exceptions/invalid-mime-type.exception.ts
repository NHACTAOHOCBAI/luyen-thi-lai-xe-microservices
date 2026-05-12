import { DomainException } from '@repo/common';

export class InvalidMimeTypeException extends DomainException {
  readonly code = 'INVALID_MIME_TYPE';

  constructor(mimeType: string) {
    super(`MIME type "${mimeType}" is not allowed`);
  }
}
