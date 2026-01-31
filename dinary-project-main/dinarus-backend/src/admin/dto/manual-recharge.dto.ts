// src/admin/dto/manual-recharge.dto.ts
import { IsString, IsNotEmpty, IsNumber, IsOptional } from 'class-validator';

export class ManualRechargeDto {
  @IsString()
  @IsNotEmpty()
  phone: string;

  @IsNumber()
  amount: number;

  @IsString()
  @IsOptional()
  reference?: string;
}
