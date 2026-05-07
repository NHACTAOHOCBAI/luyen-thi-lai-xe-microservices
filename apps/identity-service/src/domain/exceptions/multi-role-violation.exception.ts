import { DomainException } from '@repo/common';

export class MultiRoleViolationException extends DomainException {
  readonly code = 'MULTI_ROLE_VIOLATION';

  constructor(detail: string) {
    super(detail);
  }
}
