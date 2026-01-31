import {
  IsLatitude,
  IsLongitude,
  IsNumber,
  IsOptional,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';

export class NearbyMerchantsDto {
  @IsLatitude()
  @Type(() => Number)
  latitude: number;

  @IsLongitude()
  @Type(() => Number)
  longitude: number;

  @IsNumber()
  @IsOptional()
  @Min(1)
  @Type(() => Number)
  radius: number = 5000; // Rayon en mètres par défaut (5km)
}
