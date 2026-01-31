// dinary-temp/dinarus-backend/src/auth/auth.module.ts

import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { RefreshTokenService } from './refresh-token.service';
import { TwoFactorService } from './two-factor.service';
import { UsersModule } from '../users/users.module';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from './jwt.strategy';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { GamificationModule } from '../gamification/gamification.module';
import { CustomThrottlerModule } from '../throttler/throttler.module';

@Module({
  imports: [
    UsersModule,
    PassportModule,
    // 🔒 SÉCURITÉ: JWT avec expiration de 15min (plus sécurisé)
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: { 
          expiresIn: '15m', // 15 minutes d'expiration
          issuer: 'dinary-api', // Identifiant de l'émetteur
          audience: 'dinary-app', // Audience cible
        },
      }),
    }),
    ConfigModule,
    GamificationModule,
    CustomThrottlerModule,
  ],
  controllers: [AuthController],
  providers: [
    AuthService, 
    JwtStrategy,
    RefreshTokenService,
    TwoFactorService,
  ],
})
export class AuthModule {}
