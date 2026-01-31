import { Test, TestingModule } from '@nestjs/testing';
import { VerificationArchivesController } from './verification-archives.controller';

describe('VerificationArchivesController', () => {
  let controller: VerificationArchivesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [VerificationArchivesController],
    }).compile();

    controller = module.get<VerificationArchivesController>(VerificationArchivesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
