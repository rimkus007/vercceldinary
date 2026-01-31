// src/wallet/dto/refund-items.dto.ts
import {
  IsArray,
  IsNotEmpty,
  IsString,
  ValidateNested,
  IsInt,
  Min,
  IsNumber,
  IsOptional,
  Min as MinNumber,
  ValidateIf,
  IsPositive,
} from 'class-validator';
import { Type } from 'class-transformer';

class RefundItemDto {
  @IsString()
  id: string;

  @IsString()
  name: string;

  // 👇 AJOUTEZ CES LIGNES 👇
  @IsInt()
  @Min(1)
  quantity: number;
}

export class RefundItemsDto {
  @IsString()
  @IsNotEmpty()
  transactionId: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => RefundItemDto)
  @ValidateIf(o => o.manualAmount === undefined)
  @IsNotEmpty({ message: 'Either items or manualAmount must be provided' })
  items?: RefundItemDto[];

  @IsNumber()
  @MinNumber(0.01)
  @IsPositive()
  @ValidateIf(o => !o.items || o.items.length === 0)
  @IsNotEmpty({ message: 'Either items or manualAmount must be provided' })
  manualAmount?: number;
}
