import {
  Injectable,
  ConflictException,
  UnauthorizedException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { User } from './schemas/user.schema';
import { LoginDto } from './dto/login.dto';
import { JwtService } from '@nestjs/jwt';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { RegisterDto } from './dto/register.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel('User') private userModel: Model<User>,
    private jwtService: JwtService,
  ) {}

  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;

    const user = await this.userModel.findOne({ email });
    if (!user) {
      throw new UnauthorizedException('E-posta veya şifre hatalı.');
    }

    const isPasswordMatching = await bcrypt.compare(password, user.password);
    if (!isPasswordMatching) {
      throw new UnauthorizedException('E-posta veya şifre hatalı.');
    }

    const payload = { email: user.email, sub: user._id };
    return {
      access_token: this.jwtService.sign(payload),
      user: {
        email: user.email,
        fullName: user.fullName,
        id: user._id,
      },
    };
  }

  async register(registerDto: RegisterDto): Promise<User> {
    const { email, password, fullName } = registerDto;

    const existingUser = await this.userModel.findOne({ email });
    if (existingUser) {
      throw new ConflictException('Bu e-posta adresi zaten kullanımda.');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new this.userModel({
      email,
      password: hashedPassword,
      fullName,
    });

    return newUser.save();
  }

  async updateProfile(userId: string, updateDto: UpdateProfileDto) {
    const user = await this.userModel.findById(userId);
    if (!user) throw new NotFoundException('Kullanıcı bulunamadı');

    if (updateDto.fullName) {
      user.fullName = updateDto.fullName;
    }

    if (updateDto.currentPassword && updateDto.newPassword) {
      const isMatch = await bcrypt.compare(
        updateDto.currentPassword,
        user.password,
      );
      if (!isMatch) {
        throw new UnauthorizedException('Mevcut parola hatalı');
      }
      user.password = await bcrypt.hash(updateDto.newPassword, 10);
    }

    await user.save();
    return { message: 'Profil başarıyla güncellendi' };
  }
}
