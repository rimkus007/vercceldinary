// src/requests/requests.module.ts
import { Module } from '@nestjs/common';
import { RequestsService } from './requests.service';
import { RequestsController } from './requests.controller';
import { WalletModule } from 'src/wallet/wallet.module';
@Module({
  imports: [WalletModule],
  controllers: [RequestsController],
  providers: [RequestsService],
})
export class RequestsModule {}
