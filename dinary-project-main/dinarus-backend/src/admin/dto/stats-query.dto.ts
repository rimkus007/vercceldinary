import { IsOptional, IsString, IsEnum, IsNumber, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

/**
 * Périodes supportées pour les statistiques
 */
export enum StatsPeriod {
  SEVEN_DAYS = '7d',
  THIRTY_DAYS = '30d',
  NINETY_DAYS = '90d',
  SIX_MONTHS = '6m',
  ONE_YEAR = '1y',
}

/**
 * DTO pour les requêtes de statistiques de churn
 */
export class ChurnStatsQueryDto {
  @IsOptional()
  @IsEnum(StatsPeriod)
  period?: StatsPeriod;

  @IsOptional()
  @IsString()
  riskLevel?: 'low' | 'medium' | 'high';

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @Max(100)
  churnRate?: number;

  @IsOptional()
  @IsString()
  segment?: string;
}

/**
 * DTO pour les requêtes de statistiques de conversion
 */
export class ConversionStatsQueryDto {
  @IsOptional()
  @IsEnum(StatsPeriod)
  period?: StatsPeriod;

  @IsOptional()
  @IsString()
  userType?: 'new' | 'active' | 'recurring' | 'referred' | 'merchant';

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @Max(100)
  conversionRate?: number;

  @IsOptional()
  @IsString()
  segment?: string;
}

/**
 * DTO pour les requêtes de statistiques de rétention
 */
export class RetentionStatsQueryDto {
  @IsOptional()
  @IsEnum(StatsPeriod)
  period?: StatsPeriod;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @Max(100)
  retentionRate?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  cohortSize?: number;
}

