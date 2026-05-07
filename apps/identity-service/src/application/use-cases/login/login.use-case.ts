import { Inject, Injectable } from '@nestjs/common';
import { IUseCase } from '@repo/common';
import { IdentityUser } from '../../../domain/aggregate/identity-user.aggregate';
import { IdentityUserRepository } from '../../../domain/repositories/identity-user.repository';
import { EventPublisher } from '../../ports/event-publisher.port';
import { LoginCommand } from './login.command';
import { LoginResult } from './login.result';
import { KeycloakService } from '../../../infrastructure/keycloak/keycloak.service';

@Injectable()
export class LoginUseCase implements IUseCase<LoginCommand, LoginResult> {
  constructor(
    private readonly keycloakService: KeycloakService,
    @Inject(IdentityUserRepository)
    private readonly identityUserRepository: IdentityUserRepository,
    @Inject(EventPublisher)
    private readonly eventPublisher: EventPublisher,
  ) {}

  async execute(input: LoginCommand): Promise<LoginResult> {
    const authResult = await this.keycloakService.login({
      email: input.email,
      password: input.password,
      client: input.client,
    });

    const existingUser = await this.identityUserRepository.findByEmail(
      authResult.user.email,
    );

    let user: IdentityUser;

    if (!existingUser) {
      user = IdentityUser.create({
        id: authResult.user.id,
        email: authResult.user.email,
        name: authResult.user.name,
        role: authResult.user.role,
        lastLoginAt: authResult.user.lastLoginAt,
      });

      await this.identityUserRepository.save(user);
      await this.publishDomainEvents(user);
    } else {
      user = existingUser;

      if (user.role !== authResult.user.role) {
        user.changeRole(authResult.user.role);
      }

      user.updateName(authResult.user.name);
      user.recordLogin(authResult.user.lastLoginAt);
      await this.identityUserRepository.save(user);
    }

    return new LoginResult(
      'Login successful',
      'Bearer',
      authResult.accessToken,
      authResult.expiresAt,
      user.toSnapshot(),
    );
  }

  private async publishDomainEvents(identityUser: IdentityUser): Promise<void> {
    const events = identityUser.getDomainEvents();

    for (const event of events) {
      await this.eventPublisher.publish(event.eventName, event);
    }

    identityUser.clearDomainEvents();
  }
}
