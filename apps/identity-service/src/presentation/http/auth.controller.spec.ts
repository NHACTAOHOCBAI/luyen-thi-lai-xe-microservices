import { Test, type TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { LoginUseCase } from '../../application/use-cases/login/login.use-case';

describe('AuthController', () => {
  let controller: AuthController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: LoginUseCase,
          useValue: {
            execute: jest.fn().mockResolvedValue({
              message: 'Login successful',
              tokenType: 'Bearer',
              accessToken: 'access-token',
              expiresAt: new Date('2026-05-07T10:00:00.000Z'),
              user: {
                id: 'user-1',
                email: 'student@example.com',
                name: 'Student',
                role: 'STUDENT',
                isActive: true,
                lastLoginAt: new Date('2026-05-07T09:00:00.000Z'),
                createdAt: new Date('2026-05-07T09:00:00.000Z'),
                updatedAt: new Date('2026-05-07T09:00:00.000Z'),
              },
            }),
          },
        },
      ],
    }).compile();

    controller = module.get(AuthController);
  });

  it('returns login response dto', async () => {
    await expect(
      controller.login({
        email: 'student@example.com',
        password: 'secret',
        client: 'mobile-client',
      }),
    ).resolves.toMatchObject({
      message: 'Login successful',
      tokenType: 'Bearer',
      accessToken: 'access-token',
      user: {
        email: 'student@example.com',
        role: 'STUDENT',
      },
    });
  });
});
