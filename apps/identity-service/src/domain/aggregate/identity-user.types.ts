import type { UserRole } from '../identity-role.enum';

export interface IdentityUserSnapshot {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  isActive: boolean;
  lastLoginAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateIdentityUserProps {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  isActive?: boolean;
  lastLoginAt?: Date | null;
  createdAt?: Date;
  updatedAt?: Date;
}

export type ReconstituteIdentityUserProps = IdentityUserSnapshot;
