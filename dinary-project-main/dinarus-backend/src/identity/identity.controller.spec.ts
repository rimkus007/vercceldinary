import { Test, TestingModule } from '@nestjs/testing';
import { IndentityController } from '../identity/indentity.controller';

describe('IndentityController', () => {
  let controller: IndentityController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [IndentityController],
    }).compile();

    controller = module.get<IndentityController>(IndentityController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
