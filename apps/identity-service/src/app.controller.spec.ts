import { Test, type TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';

describe('AppController', () => {
  let appController: AppController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [
        {
          provide: AppService,
          useValue: {
            getHello: jest.fn().mockReturnValue('Hello World!'),
            healthCheck: jest
              .fn()
              .mockResolvedValue({ status: 'ok', database: 'connected' }),
          },
        },
      ],
    }).compile();

    appController = module.get<AppController>(AppController);
  });

  it('should return "Hello World!"', () => {
    expect(appController.getHello()).toBe('Hello World!');
  });

  it('should return health status', async () => {
    await expect(appController.health()).resolves.toEqual({
      status: 'ok',
      database: 'connected',
    });
  });
});
