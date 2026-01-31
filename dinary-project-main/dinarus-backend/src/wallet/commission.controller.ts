import { Controller, Get, Query } from '@nestjs/common';
import { CommissionService } from './commission.service';

@Controller('commission')
export class CommissionController {
  constructor(private readonly commissionService: CommissionService) {}

  @Get('send-money')
  async getSendMoneyCommission(@Query('amount') amount: string) {
    const amt = parseFloat(amount || '0');
    const commission = await this.commissionService.calculateCommission(
      'send_money',
      amt,
    );
    return { commission };
  }
}
