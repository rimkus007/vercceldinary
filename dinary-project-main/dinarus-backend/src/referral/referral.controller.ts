import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AdminService } from '../admin/admin.service';

@Controller('referral')
export class ReferralController {
  constructor(private readonly adminService: AdminService) {}

  /**
   * 🌐 ENDPOINT PUBLIC
   * Récupère les règles de parrainage actives pour un type d'utilisateur
   * Accessible aux USER et MERCHANT authentifiés (pas besoin d'être admin)
   */
  @Get('rules/:userRole')
  @UseGuards(AuthGuard('jwt')) // ✅ Seulement authentifié, pas besoin d'être admin
  async getPublicReferralRules(@Param('userRole') userRole: 'USER' | 'MERCHANT') {
    return this.adminService.getPublicReferralRules(userRole);
  }
}

