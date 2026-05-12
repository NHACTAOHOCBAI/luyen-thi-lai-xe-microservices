import { DomainException } from '@repo/common';

export class FileNotFoundException extends DomainException {
  readonly code = 'FILE_NOT_FOUND';

  constructor(id: string) {
    super(`File with id "${id}" not found`);
  }
}
