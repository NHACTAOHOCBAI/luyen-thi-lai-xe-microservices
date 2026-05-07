import { AggregateRoot } from '@repo/common';
import { IdentityUserCreatedEvent } from '../events/identity-user-created.event';
import type { UserRole } from '../identity-role.enum';
import type {
  CreateIdentityUserProps,
  IdentityUserSnapshot,
  ReconstituteIdentityUserProps,
} from './identity-user.types';

export class IdentityUser extends AggregateRoot<string> {
  private constructor(private readonly props: IdentityUserSnapshot) {
    super(props.id);
  }

  static create(props: CreateIdentityUserProps): IdentityUser {
    const now = new Date();
    const user = new IdentityUser({
      id: props.id,
      email: props.email,
      name: props.name,
      role: props.role,
      isActive: props.isActive ?? true,
      lastLoginAt: props.lastLoginAt ?? now,
      createdAt: props.createdAt ?? now,
      updatedAt: props.updatedAt ?? now,
    });

    user.addDomainEvent(new IdentityUserCreatedEvent(user.toSnapshot()));
    return user;
  }

  static reconstitute(props: ReconstituteIdentityUserProps): IdentityUser {
    return new IdentityUser({ ...props });
  }

  get email(): string {
    return this.props.email;
  }

  get name(): string {
    return this.props.name;
  }

  get role(): UserRole {
    return this.props.role;
  }

  get isActive(): boolean {
    return this.props.isActive;
  }

  get lastLoginAt(): Date | null {
    return this.props.lastLoginAt;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get updatedAt(): Date {
    return this.props.updatedAt;
  }

  recordLogin(at: Date = new Date()): void {
    this.props.lastLoginAt = at;
    this.touch();
  }

  changeRole(role: UserRole): void {
    if (this.props.role === role) {
      return;
    }

    this.props.role = role;
    this.touch();
  }

  deactivate(): void {
    this.props.isActive = false;
    this.touch();
  }

  activate(): void {
    this.props.isActive = true;
    this.touch();
  }

  updateName(name: string): void {
    this.props.name = name.trim();
    this.touch();
  }

  toSnapshot(): IdentityUserSnapshot {
    return { ...this.props };
  }

  private touch(): void {
    this.props.updatedAt = new Date();
  }
}
