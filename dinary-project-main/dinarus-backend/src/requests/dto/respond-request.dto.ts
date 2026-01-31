import { IsString, IsNotEmpty, IsIn } from 'class-validator';

export class RespondRequestDto {
  @IsString()
  @IsNotEmpty()
  @IsIn(['accepted', 'rejected'], {
    message: 'L\'action doit être "accepted" ou "rejected".',
  })
  action: 'accepted' | 'rejected';
}
