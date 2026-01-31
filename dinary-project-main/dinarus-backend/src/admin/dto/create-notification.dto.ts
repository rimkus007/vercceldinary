import { IsString, IsNotEmpty, IsOptional, IsIn } from 'class-validator';

export class CreateNotificationDto {
  @IsString()
  @IsNotEmpty()
  message: string;

  @IsIn(['all', 'users', 'merchants', 'single'])
  target: 'all' | 'users' | 'merchants' | 'single';

  @IsOptional()
  @IsString()
  username?: string; // <-- Changé de userId à username

  @IsOptional()
  @IsString()
  emoji?: string; // Emoji personnalisé pour la notification
}
