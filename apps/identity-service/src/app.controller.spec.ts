import { Test, type TestingModule } from "@nestjs/testing";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { PrismaService } from "./prisma/prisma.service";

describe("AppController", () => {
	let appController: AppController;

	const prismaMock = {
		$connect: jest.fn(),
		$disconnect: jest.fn(),
		$queryRaw: jest.fn().mockResolvedValue([]),

		identityUser: {
			upsert: jest.fn().mockResolvedValue({
				id: "user-1",
				email: "test@gmail.com",
				name: "Test",
			}),
		},
	};

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			controllers: [AppController],
			providers: [
				AppService,

				{
					provide: "NOTI_SERVICE",
					useValue: {
						emit: jest.fn(),
						send: jest.fn(),
					},
				},

				{
					provide: PrismaService,
					useValue: prismaMock,
				},
			],
		}).compile();

		appController = module.get<AppController>(AppController);
	});

	it('should return "Hello World!"', () => {
		expect(appController.getHello()).toBe("Hello World!");
	});
});
