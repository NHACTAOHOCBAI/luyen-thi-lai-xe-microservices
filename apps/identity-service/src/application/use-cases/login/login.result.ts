import type { IdentityUserSnapshot } from '../../../domain/aggregate/identity-user.types';

export class LoginResult {
  constructor(
    public readonly message: string,
    public readonly tokenType: 'Bearer',
    public readonly accessToken: string,
    public readonly expiresAt: Date,
    public readonly user: IdentityUserSnapshot,
  ) {}
}
