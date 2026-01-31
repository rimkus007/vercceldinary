// src/products/dto/create-product.dto.ts
import {
  IsString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  Min,
  IsInt,
} from 'class-validator';
import { Type } from 'class-transformer';
export class CreateProductDto {
  @IsString()
  @IsNotEmpty({ message: 'Le nom ne doit pas être vide.' })
  name: string;

  @IsNumber({}, { message: 'Le prix doit être un nombre.' })
  @Min(0)
  @Type(() => Number)
  price: number;

  @IsString()
  @IsOptional()
  description?: string;

  @IsInt({ message: 'Le stock doit être un nombre entier.' })
  @Min(0)
  @IsOptional()
  @Type(() => Number)
  stock?: number;

  @IsString()
  @IsOptional()
  category?: string;

  @IsString()
  @IsOptional()
  emoji?: string;
}
