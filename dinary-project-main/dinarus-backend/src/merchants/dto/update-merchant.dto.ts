// src/merchants/dto/update-merchant.dto.ts
import { IsOptional, IsString } from 'class-validator';

export class UpdateMerchantDto {
  @IsOptional() @IsString() name?: string;
  @IsOptional() @IsString() category?: string;
  @IsOptional() @IsString() address?: string;
  @IsOptional() @IsString() description?: string;
  // ajoute d'autres champs si nécessaire (phone, openingHours, etc.)
}
