import {
  IsNumber,
  IsPositive,
  IsString,
  IsNotEmpty,
  IsOptional,
} from 'class-validator';

export class CreateRequestDto {
  @IsNumber()
  @IsPositive()
  amount: number;

  @IsString()
  @IsNotEmpty()
  payerUsername: string; // Le nom d'utilisateur de la personne à qui on demande de l'argent

  @IsString()
  @IsOptional() // La description est optionnelle
  description?: string;
}
