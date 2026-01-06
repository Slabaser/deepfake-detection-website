import { IsString, IsOptional, MinLength } from 'class-validator';

export class UpdateProfileDto {
  @IsString()
  @IsOptional()
  fullName?: string;

  @IsString()
  @IsOptional()
  @MinLength(6, { message: 'Parola en az 6 karakter olmalıdır.' })
  currentPassword?: string;

  @IsString()
  @IsOptional()
  @MinLength(6)
  newPassword?: string;
}
