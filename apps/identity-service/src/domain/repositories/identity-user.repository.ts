import type { IdentityUser } from '../aggregate/identity-user.aggregate';

export abstract class IdentityUserRepository {
  abstract findByEmail(email: string): Promise<IdentityUser | null>;

  abstract save(identityUser: IdentityUser): Promise<void>;
}
