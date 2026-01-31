// src/admin/dto/create-xp-rule.dto.ts
import {
  IsString,
  IsNotEmpty,
  IsInt,
  IsOptional,
  IsBoolean,
  IsIn,
} from 'class-validator';

export class CreateXpRuleDto {
  @IsString()
  @IsNotEmpty()
  action: string;

  @IsInt()
  xpValue: number;

  @IsString()
  @IsOptional()
  description?: string;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  /**
   * Permet de cibler le public auquel cette règle s'applique.
   * Si aucun rôle n'est spécifié lors de la création, la règle
   * sera appliquée aux utilisateurs (clients) par défaut. Utilisez
   * la valeur 'MERCHANT' pour créer une règle spécifique aux commerçants.
   */
  @IsString()
  @IsOptional()
  @IsIn(['USER', 'MERCHANT'])
  role?: 'USER' | 'MERCHANT';
}
