// src/identity/dto/create-identity-verification.dto.ts

import { IsIn, IsNotEmpty, IsString, IsOptional } from 'class-validator';

export class CreateIdentityVerificationDto {
  @IsNotEmpty()
  @IsIn(['ID_CARD', 'PASSPORT', 'DRIVER_LICENSE'])
  documentType: 'ID_CARD' | 'PASSPORT' | 'DRIVER_LICENSE';

  // NOUVEAU: Ajout de la validation pour l'instruction du selfie
  @IsNotEmpty()
  @IsString()
  selfieInstruction: string;

  // Numéro d'impôt (optionnel pour les clients, requis pour les marchands)
  @IsOptional()
  @IsString()
  taxNumber?: string;
}
