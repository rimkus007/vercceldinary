import {
  Controller,
  Get,
  Query,
  UseGuards,
} from '@nestjs/common';
import { CommissionsService } from './commissions.service';
import { AuthGuard } from '@nestjs/passport';
import { AudienceRole } from '@prisma/client';

@Controller('commission-rules')
@UseGuards(AuthGuard('jwt'))
export class PublicCommissionsController {
  constructor(private readonly commissionsService: CommissionsService) {}

  /**
   * Récupère les règles de commission actives pour un type d'audience
   * Accessible à tous les utilisateurs authentifiés
   * GET /commission-rules?target=USER
   */
  @Get()
  getActiveRules(@Query('target') target?: string) {
    const audienceRole = (target as AudienceRole) || AudienceRole.USER;
    // Retourne uniquement les règles actives
    return this.commissionsService.getActiveRules(audienceRole);
  }

  /**
   * Calcule la commission pour une action donnée
   * GET /commission-rules/calculate?action=send_money&amount=1000&target=USER
   */
  @Get('calculate')
  async calculateCommission(
    @Query('action') action: string,
    @Query('amount') amount: string,
    @Query('target') target?: string,
  ) {
    const audienceRole = (target as AudienceRole) || AudienceRole.USER;
    const commission = await this.commissionsService.calculateCommission(
      action,
      parseFloat(amount),
      audienceRole,
    );
    
    return {
      action,
      amount: parseFloat(amount),
      commission,
      total: parseFloat(amount) + commission,
    };
  }
}

