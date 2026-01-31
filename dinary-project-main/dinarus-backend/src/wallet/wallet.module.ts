// src/wallet/wallet.module.ts
import { Module } from '@nestjs/common';

import { WalletService } from './wallet.service';
import { WalletController } from './wallet.controller';
import { CommissionService } from './commission.service';
import { CommissionController } from './commission.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { GamificationModule } from 'src/gamification/gamification.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { ProductsModule } from '../products/products.module';
import { MerchantsModule } from 'src/merchants/merchants.module';
import { CommissionsModule } from '../commissions/commissions.module';

@Module({
  imports: [
    PrismaModule,
    GamificationModule,
    NotificationsModule,
    ProductsModule,
    MerchantsModule,
    CommissionsModule,
  ],
  controllers: [WalletController, CommissionController],
  providers: [WalletService, CommissionService],
  exports: [WalletService],
})
export class WalletModule {}
