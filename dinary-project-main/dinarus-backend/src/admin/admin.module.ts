// src/admin/admin.module.ts
import { Module, forwardRef } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { PrismaModule } from '../prisma/prisma.module';
import { LedgerController } from './ledger.controller';
import { LedgerService } from './ledger.service';
import { UsersModule } from '../users/users.module';
import { GamificationModule } from 'src/gamification/gamification.module';
import { TicketsModule } from '../tickets/tickets.module';
import { CommissionsModule } from '../commissions/commissions.module';
import { VerificationArchivesModule } from '../verification-archives/verification-archives.module';
@Module({
  imports: [PrismaModule, GamificationModule, TicketsModule, CommissionsModule, VerificationArchivesModule],
  controllers: [AdminController, LedgerController],
  providers: [AdminService, LedgerService],
  exports: [AdminService], // ✅ indispensable
})
export class AdminModule {}
