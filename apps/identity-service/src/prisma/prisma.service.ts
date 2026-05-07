import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import {
  Prisma,
  PrismaClient,
  type IdentityUser as PrismaIdentityUser,
} from '@prisma/client';
import type { IdentityUserSnapshot } from '../domain/aggregate/identity-user.types';

export type IdentityUserRecord = PrismaIdentityUser;

export interface IdentityUserPersistencePort {
  findIdentityUserByEmail(email: string): Promise<IdentityUserRecord | null>;
  upsertIdentityUser(identityUser: IdentityUserSnapshot): Promise<void>;
}

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy, IdentityUserPersistencePort
{
  override get identityUser(): Prisma.IdentityUserDelegate {
    return super.identityUser;
  }

  async findIdentityUserByEmail(
    email: string,
  ): Promise<PrismaIdentityUser | null> {
    return this.identityUser.findUnique({
      where: { email },
    });
  }

  async upsertIdentityUser(identityUser: IdentityUserSnapshot): Promise<void> {
    await this.identityUser.upsert({
      where: { id: identityUser.id },
      create: {
        id: identityUser.id,
        email: identityUser.email,
        name: identityUser.name,
        role: identityUser.role,
        isActive: identityUser.isActive,
        lastLoginAt: identityUser.lastLoginAt,
        createdAt: identityUser.createdAt,
        updatedAt: identityUser.updatedAt,
      },
      update: {
        email: identityUser.email,
        name: identityUser.name,
        role: identityUser.role,
        isActive: identityUser.isActive,
        lastLoginAt: identityUser.lastLoginAt,
        updatedAt: identityUser.updatedAt,
      },
    });
  }

  async onModuleInit() {
    const maxRetries = 10;
    const retryDelayMs = 2000;

    for (let attempt = 1; attempt <= maxRetries; attempt += 1) {
      try {
        await this.$connect();
        return;
      } catch (error) {
        if (attempt === maxRetries) {
          throw error;
        }

        await new Promise((resolve) => setTimeout(resolve, retryDelayMs));
      }
    }
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
