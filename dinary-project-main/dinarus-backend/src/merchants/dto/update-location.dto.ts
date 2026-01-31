// src/merchants/dto/update-location.dto.ts
import { IsNumber, IsOptional, IsString } from 'class-validator';

export class UpdateLocationDto {
  @IsNumber() latitude!: number;
  @IsNumber() longitude!: number;
  @IsOptional() @IsString() address?: string; // envoyé par le front si dispo
}
