import type { IdentityUserSnapshot } from '../../domain/aggregate/identity-user.types';
import { ApiProperty } from '@nestjs/swagger';

export class IdentityUserResponseDto {
  @ApiProperty({ example: '8f1f0d7b-ec58-4c8e-b243-0ce5e9ec66d7' })
  id!: string;

  @ApiProperty({ example: 'student@example.com' })
  email!: string;

  @ApiProperty({ example: 'Student' })
  name!: string;

  @ApiProperty({ enum: ['ADMIN', 'CENTER_MANAGER', 'INSTRUCTOR', 'STUDENT'] })
  role!: IdentityUserSnapshot['role'];

  @ApiProperty({ example: true })
  isActive!: boolean;

  @ApiProperty({ example: '2026-05-07T09:00:00.000Z', nullable: true })
  lastLoginAt!: string | null;

  @ApiProperty({ example: '2026-05-07T09:00:00.000Z' })
  createdAt!: string;

  @ApiProperty({ example: '2026-05-07T10:00:00.000Z' })
  updatedAt!: string;

  static from(snapshot: IdentityUserSnapshot): IdentityUserResponseDto {
    const dto = new IdentityUserResponseDto();
    dto.id = snapshot.id;
    dto.email = snapshot.email;
    dto.name = snapshot.name;
    dto.role = snapshot.role;
    dto.isActive = snapshot.isActive;
    dto.lastLoginAt = snapshot.lastLoginAt
      ? snapshot.lastLoginAt.toISOString()
      : null;
    dto.createdAt = snapshot.createdAt.toISOString();
    dto.updatedAt = snapshot.updatedAt.toISOString();
    return dto;
  }
}
