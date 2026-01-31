import { IsEnum, IsNumber, IsOptional, IsBoolean, IsString, Min } from 'class-validator';
import { AudienceRole } from '@prisma/client';

export enum ReferralRequiredAction {
  FIRST_TRANSACTION = 'FIRST_TRANSACTION',
  FIRST_RECHARGE = 'FIRST_RECHARGE',
  FIRST_SALE = 'FIRST_SALE',
  ACCOUNT_CREATED = 'ACCOUNT_CREATED',
}

export class CreateReferralRuleDto {
  @IsEnum(AudienceRole)
  referrerType: AudienceRole;

  @IsEnum(AudienceRole)
  refereeType: AudienceRole;

  @IsEnum(ReferralRequiredAction)
  requiredAction: ReferralRequiredAction;

  @IsNumber()
  @Min(0)
  referrerReward: number;

  @IsNumber()
  @Min(0)
  refereeReward: number;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsString()
  description?: string;
}

export class UpdateReferralRuleDto {
  @IsOptional()
  @IsEnum(ReferralRequiredAction)
  requiredAction?: ReferralRequiredAction;

  @IsOptional()
  @IsNumber()
  @Min(0)
  referrerReward?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  refereeReward?: number;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsString()
  description?: string;
}

