import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { nanoid } from 'nanoid';

@Injectable()
export class RefreshTokenService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async generateRefreshToken(userId: string): Promise<string> {
    // Nettoyer les anciens refresh tokens expirés
    await this.cleanupExpiredTokens(userId);

    // Générer un token refresh sécurisé
    const token = `refresh_${nanoid(32)}_${Date.now()}`;
    
    // Calculer la date d'expiration (7 jours)
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    // Sauvegarder en base de données
    await this.prisma.refreshToken.create({
      data: {
        token,
        userId,
        expiresAt,
      },
    });

    return token;
  }

  async validateRefreshToken(token: string): Promise<{ userId: string; valid: boolean }> {
    const refreshToken = await this.prisma.refreshToken.findUnique({
      where: { token },
      include: { user: true },
    });

    if (!refreshToken) {
      throw new UnauthorizedException('Refresh token invalide');
    }

    if (refreshToken.expiresAt < new Date()) {
      // Supprimer le token expiré
      await this.prisma.refreshToken.delete({
        where: { id: refreshToken.id },
      });
      throw new UnauthorizedException('Refresh token expiré');
    }

    // Vérifier que l'utilisateur est toujours actif
    if (refreshToken.user.status !== 'active') {
      throw new UnauthorizedException('Compte désactivé');
    }

    return { userId: refreshToken.userId, valid: true };
  }

  async refreshAccessToken(refreshToken: string): Promise<{ access_token: string; refresh_token: string }> {
    const { userId } = await this.validateRefreshToken(refreshToken);

    // Récupérer les informations utilisateur
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, username: true, email: true, role: true },
    });

    if (!user) {
      throw new UnauthorizedException('Utilisateur introuvable');
    }

    // Générer un nouvel access token
    const payload = {
      username: user.username,
      email: user.email,
      sub: user.id,
      role: user.role,
    };

    const access_token = this.jwtService.sign(payload, { expiresIn: '15m' });

    // Générer un nouveau refresh token (rotation)
    const new_refresh_token = await this.generateRefreshToken(userId);

    // Supprimer l'ancien refresh token
    await this.revokeRefreshToken(refreshToken);

    return { access_token, refresh_token: new_refresh_token };
  }

  async revokeRefreshToken(token: string): Promise<void> {
    await this.prisma.refreshToken.deleteMany({
      where: { token },
    });
  }

  async revokeAllUserTokens(userId: string): Promise<void> {
    await this.prisma.refreshToken.deleteMany({
      where: { userId },
    });
  }

  private async cleanupExpiredTokens(userId: string): Promise<void> {
    await this.prisma.refreshToken.deleteMany({
      where: {
        userId,
        expiresAt: {
          lt: new Date(),
        },
      },
    });
  }

  async getUserRefreshTokens(userId: string): Promise<Array<{ token: string; expiresAt: Date; createdAt: Date }>> {
    return this.prisma.refreshToken.findMany({
      where: { userId },
      select: {
        token: true,
        expiresAt: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }
}
