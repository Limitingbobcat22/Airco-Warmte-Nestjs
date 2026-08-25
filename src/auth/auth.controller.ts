import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { CurrentUser } from './current-user.decorator';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from './jwt-auth.guard';
import type { JwtPayload } from './jwt.strategy';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @ApiOperation({ summary: 'Inloggen als admin (geen registratie)' })
  @ApiOkResponse({ description: 'JWT access token' })
  @ApiUnauthorizedResponse({ description: 'Ongeldige inloggegevens' })
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Huidige admin, vereist Bearer token' })
  @ApiUnauthorizedResponse({ description: 'Geen of ongeldig token' })
  me(@CurrentUser() user: JwtPayload) {
    return user;
  }
}
