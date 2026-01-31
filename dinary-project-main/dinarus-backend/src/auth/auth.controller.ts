// backend/src/auth/auth.controller.ts

import {
  Controller,
  Post,
  Body,
  UseGuards,
  Request,
  Get,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { Throttle, SkipThrottle, ThrottlerGuard } from '@nestjs/throttler';
import { AuthService } from './auth.service';
import { RefreshTokenService } from './refresh-token.service';
import { TwoFactorService } from './two-factor.service';
import { JwtAuthGuard } from './guards/JwtAuthGuard';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { LoginDto } from './dto/login.dto';
import { RegisterMerchantDto } from './dto/register-merchant.dto';

@Controller('auth')
// @UseGuards(ThrottlerGuard) // DÉSACTIVÉ TEMPORAIREMENT pour connexion
export class AuthController {
  constructor(
    private authService: AuthService,
    private refreshTokenService: RefreshTokenService,
    private twoFactorService: TwoFactorService,
  ) {}

  // 🔒 SÉCURITÉ: Rate limiting strict sur login (DÉSACTIVÉ TEMPORAIREMENT)
  // @Throttle({ default: { limit: 5, ttl: 900000 } }) // 5 tentatives en 15 minutes
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async signIn(@Body() loginDto: LoginDto) {
    const result = await this.authService.signIn(loginDto);
    return result;
  }

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  async register(@Body() createUserDto: CreateUserDto) {
    return this.authService.register(createUserDto);
  }

  @Post('register-merchant')
  @HttpCode(HttpStatus.CREATED)
  async registerMerchant(@Body() registerMerchantDto: RegisterMerchantDto) {
    return this.authService.registerMerchant(registerMerchantDto);
  }

  // === ENDPOINTS 2FA ===
  
  @Post('2fa/generate')
  @UseGuards(JwtAuthGuard)
  async generateTwoFactor(@Request() req) {
    return this.twoFactorService.generateTwoFactorSecret(req.user.id);
  }

  @Post('2fa/enable')
  @UseGuards(JwtAuthGuard)
  async enableTwoFactor(@Request() req, @Body() body: { token: string }) {
    return this.twoFactorService.enableTwoFactor(req.user.id, body.token);
  }

  @Post('2fa/disable')
  @UseGuards(JwtAuthGuard)
  async disableTwoFactor(@Request() req, @Body() body: { password: string }) {
    await this.twoFactorService.disableTwoFactor(req.user.id, body.password);
    return { message: '2FA désactivé avec succès' };
  }

  @Post('2fa/regenerate-backup-codes')
  @UseGuards(JwtAuthGuard)
  async regenerateBackupCodes(@Request() req) {
    const codes = await this.twoFactorService.generateNewBackupCodes(req.user.id);
    return { backupCodes: codes };
  }

  @Get('2fa/status')
  @UseGuards(JwtAuthGuard)
  async getTwoFactorStatus(@Request() req) {
    return this.twoFactorService.getTwoFactorStatus(req.user.id);
  }

  @SkipThrottle()
  @Get('profile')
  @UseGuards(JwtAuthGuard)
  getProfile(@Request() req) {
    return req.user;
  }
}
