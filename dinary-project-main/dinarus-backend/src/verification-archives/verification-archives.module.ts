import { Module } from '@nestjs/common';
import { VerificationArchivesService } from './verification-archives.service';
import { VerificationArchivesController } from './verification-archives.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [VerificationArchivesService],
  controllers: [VerificationArchivesController],
  exports: [VerificationArchivesService],
})
export class VerificationArchivesModule {}
