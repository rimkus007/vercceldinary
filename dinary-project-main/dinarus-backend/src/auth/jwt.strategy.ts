// backend/src/auth/jwt.strategy.ts
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private prisma: PrismaService) {
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      throw new Error("La variable d'environnement JWT_SECRET est manquante.");
    }
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: jwtSecret,
    });
  }

  async validate(payload: any) {
    if (!payload || !payload.sub) {
      throw new UnauthorizedException('Token invalide ou corrompu.');
    }
    // On récupère l'utilisateur pour vérifier son statut en base
    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
      select: { status: true, role: true, username: true },
    });
    if (!user) {
      throw new UnauthorizedException('Utilisateur introuvable.');
    }
    // Si un statut est défini et qu'il est différent de 'active', on refuse l'authentification
    const status = (user.status as string | null | undefined)?.toLowerCase();
    if (status && status !== 'active') {
      throw new UnauthorizedException(
        "Votre compte est désactivé ou suspendu. Veuillez contacter l'assistance.",
      );
    }
    return {
      id: payload.sub,
      sub: payload.sub,
      username: payload.username,
      role: payload.role,
    };
  }
}
