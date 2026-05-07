import { Inject, Injectable } from '@nestjs/common';
import { IdentityUser } from '../../../domain/aggregate/identity-user.aggregate';
import type { IdentityUserSnapshot } from '../../../domain/aggregate/identity-user.types';
import { IdentityUserRepository } from '../../../domain/repositories/identity-user.repository';
import {
  type IdentityUserPersistencePort,
  PrismaService,
} from '../../../prisma/prisma.service';

@Injectable()
export class PrismaIdentityUserRepository extends IdentityUserRepository {
  constructor(
    @Inject(PrismaService)
    private readonly prisma: IdentityUserPersistencePort,
  ) {
    super();
  }

  override async findByEmail(email: string): Promise<IdentityUser | null> {
    // Prisma's generated delegate is typed, but the ESLint analyzer in this workspace
    // does not fully resolve the assignment through the Nest injection boundary.

    const record = await this.prisma.findIdentityUserByEmail(email);

    if (!record) {
      return null;
    }

    return IdentityUser.reconstitute(this.toSnapshot(record));
  }

  override async save(identityUser: IdentityUser): Promise<void> {
    await this.prisma.upsertIdentityUser(identityUser.toSnapshot());
  }

  private toSnapshot(record: {
    id: string;
    email: string;
    name: string;
    role: string;
    isActive: boolean;
    lastLoginAt: Date | null;
    createdAt: Date;
    updatedAt: Date;
  }): IdentityUserSnapshot {
    return {
      id: record.id,
      email: record.email,
      name: record.name,
      role: record.role as IdentityUserSnapshot['role'],
      isActive: record.isActive,
      lastLoginAt: record.lastLoginAt,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
    };
  }
}
