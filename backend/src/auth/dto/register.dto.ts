import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength } from 'class-validator';

export class RegisterDto {
  @ApiProperty({
    example: 'sila@example.com',
    description: 'Kullanıcı e-posta adresi',
  })
  @IsEmail({}, { message: 'Geçerli bir e-posta adresi giriniz.' })
  email: string;

  @ApiProperty({ example: '123456', description: 'En az 6 karakterli şifre' })
  @IsString()
  @MinLength(6, { message: 'Şifre en az 6 karakter olmalıdır.' })
  password: string;

  @ApiProperty({ example: 'Sıla Başer', description: 'Kullanıcı tam adı' })
  @IsString()
  fullName: string;
}
