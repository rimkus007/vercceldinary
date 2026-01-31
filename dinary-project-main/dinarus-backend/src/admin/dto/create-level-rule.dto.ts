import { IsInt, IsNotEmpty, IsOptional, IsString, Min, IsIn } from 'class-validator';

export class CreateLevelRuleDto {
  @IsInt()
  @Min(1)
  @IsNotEmpty()
  level: number;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsInt()
  @Min(0)
  @IsNotEmpty()
  xpRequired: number;

  @IsString()
  @IsOptional()
  icon?: string;

  /**
   * Rôle auquel cette règle de niveau s'applique. Par défaut, les règles
   * concernent les utilisateurs (clients). Utilisez 'MERCHANT' pour
   * configurer des niveaux spécifiques aux commerçants.
   */
  @IsString()
  @IsOptional()
  @IsIn(['USER', 'MERCHANT'])
  role?: 'USER' | 'MERCHANT';
}