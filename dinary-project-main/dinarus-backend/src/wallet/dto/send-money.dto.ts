// backend/src/wallet/dto/send-money.dto.ts

import {
  IsNumber,
  IsString,
  IsNotEmpty,
  IsOptional,
  IsIn,
} from 'class-validator';

export class SendMoneyDto {
  @IsNumber()
  @IsNotEmpty()
  amount: number;

  // CORRECTION : On attend maintenant un ID, pas un nom d'utilisateur.
  @IsString()
  @IsNotEmpty()
  receiverId: string;

  @IsString()
  @IsIn(['now', 'deferred', 'planned'])
  @IsOptional()
  scheduleType?: 'now' | 'deferred' | 'planned';

  @IsString()
  @IsOptional()
  plannedDate?: string; // ISO date string for planned transfers
}
