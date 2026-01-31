import { IsNumber, Min, Max, IsNotEmpty, IsPositive } from 'class-validator';
import { Type } from 'class-transformer';

/**
 * 🔒 SÉCURITÉ: DTO pour la validation des montants de transaction
 */
export class TransactionAmountDto {
  // 🔒 SÉCURITÉ: Validation stricte des montants
  @IsNotEmpty({ message: 'Le montant est requis.' })
  @Type(() => Number) // Force la conversion en nombre
  @IsNumber(
    { maxDecimalPlaces: 2 },
    { message: 'Le montant doit être un nombre valide avec maximum 2 décimales.' },
  )
  @IsPositive({ message: 'Le montant doit être positif.' })
  @Min(1, { message: 'Le montant minimum est de 1 DA.' })
  @Max(1000000, { message: 'Le montant maximum est de 1 000 000 DA par transaction.' })
  amount: number;
}

/**
 * 🔒 SÉCURITÉ: DTO pour la validation des recharges
 */
export class RechargeAmountDto {
  @IsNotEmpty({ message: 'Le montant est requis.' })
  @Type(() => Number)
  @IsNumber(
    { maxDecimalPlaces: 2 },
    { message: 'Le montant doit être un nombre valide avec maximum 2 décimales.' },
  )
  @IsPositive({ message: 'Le montant doit être positif.' })
  @Min(100, { message: 'Le montant minimum de recharge est de 100 DA.' })
  @Max(500000, { message: 'Le montant maximum de recharge est de 500 000 DA.' })
  amount: number;
}

/**
 * 🔒 SÉCURITÉ: DTO pour la validation des retraits
 */
export class WithdrawalAmountDto {
  @IsNotEmpty({ message: 'Le montant est requis.' })
  @Type(() => Number)
  @IsNumber(
    { maxDecimalPlaces: 2 },
    { message: 'Le montant doit être un nombre valide avec maximum 2 décimales.' },
  )
  @IsPositive({ message: 'Le montant doit être positif.' })
  @Min(500, { message: 'Le montant minimum de retrait est de 500 DA.' })
  @Max(200000, { message: 'Le montant maximum de retrait est de 200 000 DA par demande.' })
  amount: number;
}


