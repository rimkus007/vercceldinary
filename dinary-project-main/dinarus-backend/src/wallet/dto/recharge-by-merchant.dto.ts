import { IsNotEmpty, IsNumber, IsString, Min, IsUUID } from 'class-validator';

export class RechargeByMerchantDto {
  @IsString()
  @IsNotEmpty()
  userId: string;

  @IsNumber()
  @Min(100)
  amount: number;

  @IsUUID() // On s'assure que c'est bien un ID unique
  @IsNotEmpty()
  rechargeRequestId: string;
}
