// src/wallet/dto/pay-qr.dto.ts
import {
  IsNumber,
  IsString,
  IsNotEmpty,
  IsUUID,
  IsOptional,
  IsArray,
  ValidateNested,
  IsInt,
} from 'class-validator';
import { Type } from 'class-transformer';
class CartItemDto {
  @IsString()
  id: string;

  @IsString()
  name: string;

  @IsNumber()
  price: number;

  @IsInt()
  quantity: number;
}
export class PayQrDto {
  @IsNumber()
  @IsNotEmpty()
  amount: number;

  @IsString()
  @IsNotEmpty()
  @IsUUID()
  merchantUserId: string;

  @IsString()
  @IsUUID()
  @IsOptional() // On le rend optionnel pour la compatibilité
  paymentRequestId?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CartItemDto)
  @IsOptional()
  cart?: CartItemDto[];
}
