// src/admin/dto/commission-structure.dto.ts
import { IsString, IsNumber, IsIn, IsOptional, IsArray } from 'class-validator';

export class CommissionStructureDto {
  @IsIn(['fixed', 'percentage', 'tiered', 'hybrid'])
  type: 'fixed' | 'percentage' | 'tiered' | 'hybrid';

  @IsNumber()
  @IsOptional()
  value?: number;

  @IsNumber()
  @IsOptional()
  minAmount?: number;

  @IsNumber()
  @IsOptional()
  maxAmount?: number;

  // Fields for other types like 'hybrid'
  @IsNumber()
  @IsOptional()
  fixedPart?: number;

  @IsNumber()
  @IsOptional()
  percentagePart?: number;

  // Field for 'tiered'
  @IsArray()
  @IsOptional()
  tiers?: any[];
}
 