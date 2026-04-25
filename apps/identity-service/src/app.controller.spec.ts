import { Test, type TestingModule } from "@nestjs/testing";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { PrismaService } from "./prisma/prisma.service";

describe("AppController", () => {
	let appController: AppController;

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			controllers: [AppController],
			providers: [
				AppService,
				{
					provide: "NOTI_SERVICE",
					useValue: {},
				},
				{
					provide: PrismaService,
					useValue: {},
				},
			],
		}).compile();

		appController = module.get<AppController>(AppController);
	});

	it('should return "Hello World!"', () => {
		expect(appController.getHello()).toBe("Hello World!");
	});
});
