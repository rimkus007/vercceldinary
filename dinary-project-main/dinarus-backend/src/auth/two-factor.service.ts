import { Injectable, BadRequestException, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as speakeasy from 'speakeasy';
import * as QRCode from 'qrcode';

@Injectable()
export class TwoFactorService {
  constructor(private prisma: PrismaService) {}

  async generateTwoFactorSecret(userId: string): Promise<{ secret: string; qrCodeUrl: string }> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new BadRequestException('Utilisateur introuvable');
    }

    // Générer un secret 2FA
    const secret = speakeasy.generateSecret({
      name: `Dinary (${user.email})`,
      issuer: 'Dinary',
      length: 32,
    });

    // Générer l'URL du QR code
    const qrCodeUrl = await QRCode.toDataURL(secret.otpauth_url!);

    // Sauvegarder le secret en base (temporairement, pas encore activé)
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        // @ts-ignore - Temporaire jusqu'à migration Prisma
        twoFactorSecret: secret.base32,
      },
    });

    return {
      secret: secret.base32,
      qrCodeUrl,
    };
  }

  async enableTwoFactor(userId: string, token: string): Promise<{ backupCodes: string[] }> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new BadRequestException('Utilisateur introuvable');
    }

    // @ts-ignore - Temporaire jusqu'à migration Prisma
    if (!user.twoFactorSecret) {
      throw new BadRequestException('Secret 2FA introuvable');
    }

    // Vérifier le token
    const verified = speakeasy.totp.verify({
      // @ts-ignore - Temporaire jusqu'à migration Prisma
      secret: user.twoFactorSecret,
      encoding: 'base32',
      token,
      window: 2, // Permet une petite marge de temps
    });

    if (!verified) {
      throw new UnauthorizedException('Code 2FA invalide');
    }

    // Générer des codes de secours
    const backupCodes = this.generateBackupCodes();

    // Activer 2FA et sauvegarder les codes de secours
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        // @ts-ignore - Temporaire jusqu'à migration Prisma
        isTwoFactorEnabled: true,
        // @ts-ignore - Temporaire jusqu'à migration Prisma
        backupCodes,
      },
    });

    return { backupCodes };
  }

  async verifyTwoFactorToken(userId: string, token: string): Promise<boolean> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return false;
    }

    // @ts-ignore - Temporaire jusqu'à migration Prisma
    if (!user.isTwoFactorEnabled || !user.twoFactorSecret) {
      return false;
    }

    // Vérifier si c'est un code de secours
    // @ts-ignore - Temporaire jusqu'à migration Prisma
    if (user.backupCodes && user.backupCodes.includes(token)) {
      // Supprimer le code de secours utilisé
      await this.prisma.user.update({
        where: { id: userId },
        data: {
          // @ts-ignore - Temporaire jusqu'à migration Prisma
          backupCodes: user.backupCodes.filter((code: string) => code !== token),
        },
      });
      return true;
    }

    // Vérifier le token TOTP
    return speakeasy.totp.verify({
      // @ts-ignore - Temporaire jusqu'à migration Prisma
      secret: user.twoFactorSecret,
      encoding: 'base32',
      token,
      window: 2,
    });
  }

  async disableTwoFactor(userId: string, password: string): Promise<void> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new BadRequestException('Utilisateur introuvable');
    }

    // Vérifier le mot de passe (nécessite bcrypt)
    const bcrypt = require('bcrypt');
    const isPasswordValid = await bcrypt.compare(password, user.hashedPassword);
    
    if (!isPasswordValid) {
      throw new UnauthorizedException('Mot de passe incorrect');
    }

    // Désactiver 2FA
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        // @ts-ignore - Temporaire jusqu'à migration Prisma
        isTwoFactorEnabled: false,
        // @ts-ignore - Temporaire jusqu'à migration Prisma
        twoFactorSecret: null,
        // @ts-ignore - Temporaire jusqu'à migration Prisma
        backupCodes: [],
      },
    });
  }

  async generateNewBackupCodes(userId: string): Promise<string[]> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new BadRequestException('Utilisateur introuvable');
    }

    // @ts-ignore - Temporaire jusqu'à migration Prisma
    if (!user.isTwoFactorEnabled) {
      throw new BadRequestException('2FA n\'est pas activé');
    }

    const backupCodes = this.generateBackupCodes();

    await this.prisma.user.update({
      where: { id: userId },
      data: {
        // @ts-ignore - Temporaire jusqu'à migration Prisma
        backupCodes,
      },
    });

    return backupCodes;
  }

  private generateBackupCodes(): string[] {
    const codes: string[] = [];
    for (let i = 0; i < 10; i++) {
      codes.push(speakeasy.generateSecret({ length: 8 }).base32.substring(0, 8));
    }
    return codes;
  }

  async getTwoFactorStatus(userId: string): Promise<{
    enabled: boolean;
    hasSecret: boolean;
    backupCodesCount: number;
  }> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        // @ts-ignore - Temporaire jusqu'à migration Prisma
        isTwoFactorEnabled: true,
        // @ts-ignore - Temporaire jusqu'à migration Prisma
        twoFactorSecret: true,
        // @ts-ignore - Temporaire jusqu'à migration Prisma
        backupCodes: true,
      },
    });

    if (!user) {
      throw new BadRequestException('Utilisateur introuvable');
    }

    return {
      // @ts-ignore - Temporaire jusqu'à migration Prisma
      enabled: user.isTwoFactorEnabled || false,
      // @ts-ignore - Temporaire jusqu'à migration Prisma
      hasSecret: !!user.twoFactorSecret,
      // @ts-ignore - Temporaire jusqu'à migration Prisma
      backupCodesCount: user.backupCodes?.length || 0,
    };
  }
}
