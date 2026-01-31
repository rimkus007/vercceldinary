import { Module } from '@nestjs/common';
import { MerchantsService } from './merchants.service';
import { MerchantsController } from './merchants.controller';
import { GamificationModule } from 'src/gamification/gamification.module';
import { NotificationsModule } from 'src/notifications/notifications.module';
import { AdminModule } from 'src/admin/admin.module';

@Module({
  imports: [
    GamificationModule,
    NotificationsModule,
    AdminModule, // Pour accéder à AdminService
  ],
  controllers: [MerchantsController],
  providers: [MerchantsService],
  exports: [MerchantsService],
})
export class MerchantsModule {}
