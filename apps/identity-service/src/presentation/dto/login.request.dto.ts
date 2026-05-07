import type { LoginClient } from '../../application/use-cases/login/login.command';
import { ApiProperty } from '@nestjs/swagger';

export class LoginRequestDto {
  @ApiProperty({ example: 'student@example.com' })
  email!: string;

  @ApiProperty({ example: 'P@ssw0rd!' })
  password!: string;

  @ApiProperty({
    enum: ['mobile-client', 'web-client'],
    example: 'mobile-client',
  })
  client!: LoginClient;
}
