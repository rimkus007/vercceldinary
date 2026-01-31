import { Test, TestingModule } from '@nestjs/testing';
import { VerificationArchivesService } from './verification-archives.service';

describe('VerificationArchivesService', () => {
  let service: VerificationArchivesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [VerificationArchivesService],
    }).compile();

    service = module.get<VerificationArchivesService>(VerificationArchivesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
