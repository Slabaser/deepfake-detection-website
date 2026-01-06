import {
  Controller,
  Post,
  Body,
  UsePipes,
  ValidationPipe,
  Patch,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { LoginDto } from './dto/login.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';
import { Request } from '@nestjs/common';
import type { RequestWithUser } from './interfaces/request-with-user.interface';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @ApiOperation({ summary: 'Kullanıcı girişi yapar ve JWT döner' })
  @ApiResponse({ status: 200, description: 'Başarıyla giriş yapıldı.' })
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Post('register')
  @ApiOperation({ summary: 'Yeni kullanıcı kaydı oluşturur' })
  @ApiResponse({ status: 201, description: 'Kullanıcı başarıyla oluşturuldu.' })
  @ApiResponse({ status: 409, description: 'E-posta zaten kullanımda.' })
  @UsePipes(new ValidationPipe())
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('update-profile')
  async updateProfile(
    @Request() req: RequestWithUser,
    @Body() updateProfileDto: UpdateProfileDto,
  ) {
    return this.authService.updateProfile(req.user.userId, updateProfileDto);
  }
}
