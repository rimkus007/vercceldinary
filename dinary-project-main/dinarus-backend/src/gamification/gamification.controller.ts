// backend/src/gamification/gamification.controller.ts
import {
  Controller,
  Get,
  UseGuards,
  Request,
  UnauthorizedException,
  Query,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { GamificationService } from './gamification.service';

@Controller('gamification')
export class GamificationController {
  constructor(private readonly gamificationService: GamificationService) {}

  @UseGuards(AuthGuard('jwt'))
  @Get('profile')
  getProfile(@Request() req: any) {
    // On s'assure que req.user et req.user.sub existent.
    const userId = (req.user && (req.user.sub as string | undefined)) as
      | string
      | undefined;

    if (!userId) {
      // Si on ne trouve pas d'ID, c'est une erreur d'authentification
      throw new UnauthorizedException(
        "Impossible de trouver l'ID utilisateur dans le token.",
      );
    }

    // On passe l'ID de l'utilisateur au service.
    return this.gamificationService.getProfile(userId);
  }
  @UseGuards(AuthGuard('jwt')) // Protège la route, s'assure que l'utilisateur est connecté
  @Get('missions')
  getUserMissions(@Request() req: any) {
    const userId = (req.user && (req.user.sub as string | undefined)) as
      | string
      | undefined;
    if (!userId) {
      throw new UnauthorizedException(
        "Impossible de trouver l'ID utilisateur dans le token.",
      );
    }
    // Appelle la fonction du service que nous avons créée précédemment
    return this.gamificationService.getUserMissionsWithProgress(userId);
  }
  @UseGuards(AuthGuard('jwt'))
  @Get('level-rules') // Nouvelle route : /api/gamification/level-rules
  getLevelRules(@Query('role') role?: 'USER' | 'MERCHANT') {
    // If a role is provided, return role-specific level rules
    if (role) return this.gamificationService.getLevelRulesForRole(role);
    return this.gamificationService.getLevelRules();
  }

  @Get('init-level-rules')
  async initLevelRules() {
    await this.gamificationService.ensureUserLevelRules();
    await this.gamificationService.ensureMerchantLevelRules();
    await this.gamificationService.ensureBasicXpRules();
    return { message: 'Règles de niveaux et XP initialisées avec succès' };
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('xp/history')
  async getXpHistory(@Request() req: any) {
    const userId = (req.user && (req.user.sub as string | undefined)) as
      | string
      | undefined;
    if (!userId) {
      throw new UnauthorizedException(
        "Impossible de trouver l'ID utilisateur dans le token.",
      );
    }
    return this.gamificationService.getXpHistory(userId);
  }
}
