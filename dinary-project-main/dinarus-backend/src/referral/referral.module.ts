import { Module } from '@nestjs/common';
import { ReferralController } from './referral.controller';
import { AdminModule } from '../admin/admin.module';

@Module({
  imports: [AdminModule],
  controllers: [ReferralController],
})
export class ReferralModule {}

