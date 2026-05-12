import { DomainException } from '@repo/common';

export class FileUploadFailedException extends DomainException {
  readonly code = 'FILE_UPLOAD_FAILED';

  constructor(key: string) {
    super(`Failed to upload file with key "${key}" to storage`);
  }
}
