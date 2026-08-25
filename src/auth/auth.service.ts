import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import type { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly config: ConfigService,
    private readonly jwt: JwtService,
  ) {}

  async login(dto: LoginDto) {
    const email = this.config.getOrThrow<string>('ADMIN_EMAIL');
    const password = this.config.getOrThrow<string>('ADMIN_PASSWORD');

    if (dto.email !== email || dto.password !== password) {
      throw new UnauthorizedException('Ongeldige inloggegevens');
    }

    const expiresIn = this.config.get<string>('JWT_EXPIRES_IN') ?? '8h';
    const accessToken = await this.jwt.signAsync({
      sub: 'admin',
      email,
    });

    return {
      access_token: accessToken,
      token_type: 'Bearer',
      expires_in: expiresIn,
    };
  }
}
