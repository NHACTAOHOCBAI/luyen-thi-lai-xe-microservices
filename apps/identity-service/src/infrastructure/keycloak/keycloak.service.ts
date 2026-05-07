import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InvalidCredentialsException } from '../../domain/exceptions/invalid-credentials.exception';
import { MultiRoleViolationException } from '../../domain/exceptions/multi-role-violation.exception';
import { UnsupportedClientException } from '../../domain/exceptions/unsupported-client.exception';
import { isUserRole, UserRole } from '../../domain/identity-role.enum';
import type { LoginClient } from '../../application/use-cases/login/login.command';

type KeycloakLoginInput = {
  email: string;
  password: string;
  client: LoginClient;
};

type KeycloakTokenResponse = {
  access_token?: string;
  expires_in?: number;
  token_type?: string;
  refresh_token?: string;
  id_token?: string;
};

type KeycloakClaims = {
  sub: string;
  email?: string;
  name?: string;
  preferred_username?: string;
  realm_access?: {
    roles?: string[];
  };
};

export type KeycloakLoginResult = {
  accessToken: string;
  tokenType: 'Bearer';
  expiresAt: Date;
  user: {
    id: string;
    email: string;
    name: string;
    role: UserRole;
    isActive: boolean;
    lastLoginAt: Date;
    createdAt: Date;
    updatedAt: Date;
  };
};

@Injectable()
export class KeycloakService {
  constructor(private readonly configService: ConfigService) {}

  async login(input: KeycloakLoginInput): Promise<KeycloakLoginResult> {
    const baseUrl =
      this.configService.get<string>('keycloak.baseUrl') ??
      'http://localhost:8080';
    const realm =
      this.configService.get<string>('keycloak.realm') ?? 'dev-realm';

    const clientConfig = this.resolveClientConfig(input.client);
    const tokenUrl = `${baseUrl.replace(/\/$/, '')}/realms/${realm}/protocol/openid-connect/token`;

    const formData = new URLSearchParams({
      grant_type: 'password',
      client_id: clientConfig.clientId,
      username: input.email,
      password: input.password,
      scope: 'openid profile email',
    });

    if (clientConfig.clientSecret) {
      formData.set('client_secret', clientConfig.clientSecret);
    }

    let response: Response;

    try {
      response = await fetch(tokenUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: formData,
      });
    } catch {
      throw new InvalidCredentialsException(input.email);
    }

    const payload = (await response.json()) as KeycloakTokenResponse;

    if (!response.ok || typeof payload.access_token !== 'string') {
      throw new InvalidCredentialsException(input.email);
    }

    const claims = this.decodeAccessToken(payload.access_token);
    const role = this.extractSingleRole(claims.realm_access?.roles ?? []);
    const now = new Date();
    const expiresIn = payload.expires_in ?? 0;

    return {
      accessToken: payload.access_token,
      tokenType: 'Bearer',
      expiresAt: new Date(now.getTime() + expiresIn * 1000),
      user: {
        id: claims.sub,
        email: claims.email ?? input.email,
        name:
          claims.name ??
          claims.preferred_username ??
          input.email.split('@')[0] ??
          'User',
        role,
        isActive: true,
        lastLoginAt: now,
        createdAt: now,
        updatedAt: now,
      },
    };
  }

  private resolveClientConfig(client: LoginClient): {
    clientId: string;
    clientSecret?: string;
  } {
    if (client === 'mobile-client') {
      return {
        clientId:
          this.configService.get<string>('keycloak.mobileClientId') ??
          'mobile-client',
        clientSecret: this.configService.get<string>(
          'keycloak.mobileClientSecret',
        ),
      };
    }

    if (client === 'web-client') {
      return {
        clientId:
          this.configService.get<string>('keycloak.webClientId') ??
          'web-client',
        clientSecret: this.configService.get<string>(
          'keycloak.webClientSecret',
        ),
      };
    }

    throw new UnsupportedClientException(client);
  }

  private decodeAccessToken(token: string): KeycloakClaims {
    const parts = token.split('.');

    if (parts.length < 2) {
      throw new BadRequestException('Invalid Keycloak access token');
    }

    const payload = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const padded = payload.padEnd(
      payload.length + ((4 - (payload.length % 4)) % 4),
      '=',
    );
    const json = Buffer.from(padded, 'base64').toString('utf8');

    return JSON.parse(json) as KeycloakClaims;
  }

  private extractSingleRole(roles: string[]): UserRole {
    const filteredRoles = roles.filter((role): role is UserRole =>
      isUserRole(role),
    );

    if (filteredRoles.length !== 1) {
      throw new MultiRoleViolationException(
        `Expected exactly one application role, received: ${filteredRoles.join(', ') || 'none'}`,
      );
    }

    return filteredRoles[0];
  }
}
