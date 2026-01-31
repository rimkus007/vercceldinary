import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class CommissionService {
  private prisma: PrismaClient;
  constructor(prismaService: PrismaService) {
    this.prisma = prismaService as unknown as PrismaClient;
  }

  async getActiveCommissionRule(action: string) {
    return await (this.prisma as any).commissionRule.findFirst({
      where: { action, isActive: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async calculateCommission(action: string, amount: number): Promise<number> {
    const rule = await this.getActiveCommissionRule(action);
    if (!rule) return 0;
    if (rule.type === 'fixed') return rule.value;
    if (rule.type === 'percentage') {
      let commission = (amount * rule.value) / 100;
      if (rule.minAmount && commission < rule.minAmount)
        commission = rule.minAmount;
      if (rule.maxAmount && commission > rule.maxAmount)
        commission = rule.maxAmount;
      return commission;
    }
    return 0;
  }
}
