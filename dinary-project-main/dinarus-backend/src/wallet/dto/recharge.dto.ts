import { IsNumber, IsPositive, IsString, IsOptional } from 'class-validator';

export class RechargeDto {
  @IsNumber({}, { message: 'Le montant doit être un nombre.' })
  @IsPositive({ message: 'Le montant doit être positif.' })
  amount: number;

  // 👇 AJOUTEZ CETTE LIGNE 👇
  @IsString()
  @IsOptional() // On le rend optionnel car toutes les recharges n'ont pas forcément de référence
  reference: string;
}
