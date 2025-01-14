import { Test, TestingModule } from '@nestjs/testing';
import { FactionController } from './faction.controller';
import { FactionService } from './faction.service';

describe('FactionController', () => {
  let controller: FactionController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FactionController],
      providers: [FactionService],
    }).compile();

    controller = module.get<FactionController>(FactionController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
