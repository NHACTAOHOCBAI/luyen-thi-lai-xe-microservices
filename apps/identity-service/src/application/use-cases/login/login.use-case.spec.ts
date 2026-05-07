/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { LoginUseCase } from './login.use-case';
import { LoginCommand } from './login.command';
import type { KeycloakLoginResult } from '../../../infrastructure/keycloak/keycloak.service';
import type { IdentityUserRepository } from '../../../domain/repositories/identity-user.repository';
import type { EventPublisher } from '../../ports/event-publisher.port';
import { UserRole } from '../../../domain/identity-role.enum';

describe('LoginUseCase', () => {
  it('creates a new identity user on first login and publishes the domain event', async () => {
    const keycloakResult: KeycloakLoginResult = {
      accessToken: 'header.payload.signature',
      tokenType: 'Bearer',
      expiresAt: new Date('2026-05-07T10:00:00.000Z'),
      user: {
        id: 'user-1',
        email: 'student@example.com',
        name: 'Student',
        role: UserRole.STUDENT,
        isActive: true,
        lastLoginAt: new Date('2026-05-07T09:00:00.000Z'),
        createdAt: new Date('2026-05-07T09:00:00.000Z'),
        updatedAt: new Date('2026-05-07T09:00:00.000Z'),
      },
    };

    const keycloakService = {
      login: jest.fn().mockResolvedValue(keycloakResult),
    };

    const identityUserRepository: Pick<
      IdentityUserRepository,
      'findByEmail' | 'save'
    > = {
      findByEmail: jest.fn().mockResolvedValue(null),
      save: jest.fn().mockResolvedValue(undefined),
    };

    const eventPublisher: Pick<EventPublisher, 'publish'> = {
      publish: jest.fn().mockResolvedValue(undefined),
    };

    const useCase = new LoginUseCase(
      keycloakService as never,
      identityUserRepository as never,
      eventPublisher as never,
    );

    const result = await useCase.execute(
      new LoginCommand('student@example.com', 'secret', 'mobile-client'),
    );

    expect(keycloakService.login).toHaveBeenCalledWith({
      email: 'student@example.com',
      password: 'secret',
      client: 'mobile-client',
    });
    expect(identityUserRepository.save).toHaveBeenCalledTimes(1);
    expect(eventPublisher.publish).toHaveBeenCalledWith(
      'identity.user.created',
      expect.objectContaining({
        user: expect.objectContaining({
          email: 'student@example.com',
          role: UserRole.STUDENT,
        }),
      }),
    );
    expect(result.accessToken).toBe('header.payload.signature');
    expect(result.user.email).toBe('student@example.com');
  });
});
