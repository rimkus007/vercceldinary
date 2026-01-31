// src/admin/dto/create-mission.dto.ts
import {
  IsString,
  IsNotEmpty,
  IsInt,
  IsOptional,
  IsEnum,
  IsIn,
} from 'class-validator';
import { MissionStatus, AudienceRole } from '@prisma/client';

export class CreateMissionDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsInt()
  xpReward: number;

  @IsInt()
  goal: number;

  @IsString()
  @IsNotEmpty()
  type: string;

  @IsString()
  @IsOptional()
  icon?: string;

  @IsEnum(MissionStatus)
  @IsOptional()
  status?: MissionStatus;

  @IsOptional()
  @IsString()
  @IsIn(['USER', 'MERCHANT']) // Valide que le rôle est correct
  role?: AudienceRole; // Utilise le type AudienceRole
}
