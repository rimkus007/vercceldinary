 import { IsString, IsBoolean, IsNumber, IsOptional, IsEnum, Min, Max } from 'class-validator';
import { AudienceRole } from '@prisma/client';

export class CreateCommissionRuleDto {
  @IsString()
  action: string; // 'send_money', 'merchant_payment', 'withdrawal', 'recharge', etc.

  @IsEnum(['fixed', 'percentage'])
  type: 'fixed' | 'percentage';

  @IsNumber()
  @Min(0)
  value: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  minAmount?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  maxAmount?: number;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @IsEnum(AudienceRole)
  @IsOptional()
  target?: AudienceRole; // USER or MERCHANT
}

