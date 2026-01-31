// src/admin/dto/create-commission-rule.dto.ts
import {
  IsString,
  IsNumber,
  IsBoolean,
  IsArray,
  ValidateNested,
  IsOptional,
  IsIn,
} from 'class-validator';
import { Type } from 'class-transformer';
import { CommissionStructureDto } from './commission-structure.dto';

// This DTO now matches the RuleFormData interface in your frontend
export class CreateCommissionRuleDto {
  @IsString()
  action: string; // e.g., 'send_money'

  @IsIn(['fixed', 'percentage'])
  type: 'fixed' | 'percentage';

  @IsNumber()
  value: number;

  @IsNumber()
  @IsOptional()
  minAmount?: number;

  @IsNumber()
  @IsOptional()
  maxAmount?: number;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  /**
   * Rôle cible auquel cette règle de commission s'applique. Par défaut, les
   * commissions concernent les utilisateurs (clients). Utilisez 'MERCHANT'
   * pour créer une commission applicable aux commerçants.
   */
  @IsString()
  @IsOptional()
  @IsIn(['USER', 'MERCHANT'])
  target?: 'USER' | 'MERCHANT';
}
