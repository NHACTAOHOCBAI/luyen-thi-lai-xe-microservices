import { DomainException } from '@repo/common';

export class FileTooLargeException extends DomainException {
  readonly code = 'FILE_TOO_LARGE';

  constructor(actualBytes: number, maxBytes: number) {
    super(
      `File size ${actualBytes} bytes exceeds maximum allowed size of ${maxBytes} bytes`,
    );
  }
}
