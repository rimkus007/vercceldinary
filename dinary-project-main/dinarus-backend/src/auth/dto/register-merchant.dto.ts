// dinary-temp/dinarus-backend/src/auth/dto/register-merchant.dto.ts

import {
  IsString,
  IsNotEmpty,
  IsEmail,
  IsEnum,
  IsOptional,
} from 'class-validator';
import { CreateUserDto } from '../../users/dto/create-user.dto';

export class RegisterMerchantDto extends CreateUserDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  address: string;

  @IsString()
  @IsOptional()
  category: string;

  @IsString()
  @IsOptional()
  suggestionCode?: string;
}
