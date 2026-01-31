// src/admin/ledger.controller.ts
import {
  BadRequestException,
  Controller,
  Get,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { LedgerService } from './ledger.service';
import type { UserLedgerResponse } from './ledger.service';
import { JwtAuthGuard } from '../auth/guards/JwtAuthGuard';
import { AdminGuard } from '../auth/guards/AdminGuard';

@Controller('admin/ledger')
@UseGuards(JwtAuthGuard, AdminGuard)
export class LedgerController {
  constructor(private readonly ledger: LedgerService) {}

  @Get(':userId')
  async getUserLedger(
    @Param('userId') userId: string,
    @Query('from') from?: string,
    @Query('to') to?: string,
  ): Promise<UserLedgerResponse> {
    const fromDate = from ? new Date(from) : undefined;
    const toDate = to ? new Date(to) : undefined;

    if (fromDate && isNaN(fromDate.getTime())) {
      throw new BadRequestException('Invalid "from" date');
    }
    if (toDate && isNaN(toDate.getTime())) {
      throw new BadRequestException('Invalid "to" date');
    }

    return this.ledger.getUserLedger(userId, fromDate, toDate);
  }
}
