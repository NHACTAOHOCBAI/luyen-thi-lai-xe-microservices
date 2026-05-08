import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  type KeycloakConnectOptions,
  type KeycloakConnectOptionsFactory,
  PolicyEnforcementMode,
  TokenValidation,
} from 'nest-keycloak-connect';

@Injectable()
export class KeycloakConfigService implements KeycloakConnectOptionsFactory {
  constructor(private readonly configService: ConfigService) {}

  createKeycloakConnectOptions(): KeycloakConnectOptions {
    return {
      authServerUrl: this.configService.getOrThrow<string>(
        'keycloak.authServerUrl',
      ),
      realm: this.configService.getOrThrow<string>('keycloak.realm'),
      clientId: this.configService.getOrThrow<string>('keycloak.clientId'),
      secret: this.configService.getOrThrow<string>('keycloak.clientSecret'),
      policyEnforcement: PolicyEnforcementMode.PERMISSIVE,
      tokenValidation: TokenValidation.ONLINE,
    };
  }
}
