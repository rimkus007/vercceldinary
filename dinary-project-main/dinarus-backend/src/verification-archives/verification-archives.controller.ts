import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Query,
  UseGuards,
  Req,
  Body,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { VerificationArchivesService } from './verification-archives.service';
import { AdminGuard } from '../auth/guards/AdminGuard';

@Controller('admin/verification-archives')
@UseGuards(AuthGuard('jwt'), AdminGuard)
export class VerificationArchivesController {
  constructor(
    private readonly archivesService: VerificationArchivesService,
  ) {}

  /**
   * GET /api/admin/verification-archives
   * Récupère toutes les archives (sans données déchiffrées)
   */
  @Get()
  async getAllArchives(
    @Req() req: any,
    @Query('userId') userId?: string,
    @Query('email') email?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    void 0;
    void 0;
    void 0;

    const filters: any = {};
    if (userId) filters.userId = userId;
    if (email) filters.email = email;
    if (startDate) filters.startDate = new Date(startDate);
    if (endDate) filters.endDate = new Date(endDate);

    const result = await this.archivesService.getAllArchives(filters);
    void 0;
    return result;
  }

  /**
   * GET /api/admin/verification-archives/stats
   * Récupère les statistiques des archives
   */
  @Get('stats')
  async getStats(@Req() req: any) {
    void 0;
    void 0;
    
    const result = await this.archivesService.getStats();
    void 0;
    return result;
  }

  /**
   * POST /api/admin/verification-archives/:id/unlock
   * Déverrouille une archive AVEC vérification du mot de passe
   */
  @Post(':id/unlock')
  async unlockArchive(
    @Param('id') id: string,
    @Body('password') password: string,
    @Req() req: any,
  ) {
    void 0;
    void 0;
    void 0;

    const adminId = req.user?.userId || req.user?.id;
    return this.archivesService.unlockArchiveWithPassword(
      id,
      adminId,
      password,
    );
  }

  /**
   * GET /api/admin/verification-archives/:id
   * Récupère une archive spécifique AVEC déchiffrement
   */
  @Get(':id')
  async getArchiveById(@Param('id') id: string, @Req() req: any) {
    void 0;
    const adminId = req.user?.userId || req.user?.id;
    return this.archivesService.getArchiveById(id, adminId);
  }

  /**
   * GET /api/admin/verification-archives/export/csv
   * Exporte toutes les archives en CSV (sans données sensibles)
   */
  @Get('export/csv')
  async exportToCSV(@Req() req: any) {
    void 0;
    return this.archivesService.exportToCSV();
  }

  /**
   * DELETE /api/admin/verification-archives/:id
   * Supprime une archive (utilisation prudente)
   */
  @Delete(':id')
  async deleteArchive(@Param('id') id: string, @Req() req: any) {
    const adminId = req.user?.userId || req.user?.id;
    return this.archivesService.deleteArchive(id, adminId);
  }
}
