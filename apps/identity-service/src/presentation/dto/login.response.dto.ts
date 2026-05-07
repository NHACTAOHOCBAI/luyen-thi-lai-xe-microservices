import type { LoginResult } from '../../application/use-cases/login/login.result';
import { IdentityUserResponseDto } from './identity-user.response.dto';
import { ApiProperty } from '@nestjs/swagger';

export class LoginResponseDto {
  @ApiProperty({ example: 'Login successful' })
  message!: string;

  @ApiProperty({ example: 'Bearer' })
  tokenType!: 'Bearer';

  @ApiProperty({ example: 'eyJhbGciOiJSUzI1NiIs...' })
  accessToken!: string;

  @ApiProperty({ example: '2026-05-07T10:00:00.000Z' })
  expiresAt!: string;

  @ApiProperty({ type: () => IdentityUserResponseDto })
  user!: IdentityUserResponseDto;

  static from(result: LoginResult): LoginResponseDto {
    const dto = new LoginResponseDto();
    dto.message = result.message;
    dto.tokenType = result.tokenType;
    dto.accessToken = result.accessToken;
    dto.expiresAt = result.expiresAt.toISOString();
    dto.user = IdentityUserResponseDto.from(result.user);
    return dto;
  }
}
