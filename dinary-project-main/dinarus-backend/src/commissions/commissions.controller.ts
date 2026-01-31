import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { CommissionsService } from './commissions.service';
import { CreateCommissionRuleDto } from './dto/create-commission-rule.dto';
import { UpdateCommissionRuleDto } from './dto/update-commission-rule.dto';
import { AuthGuard } from '@nestjs/passport';
import { AdminGuard } from '../auth/guards/AdminGuard';
import { AudienceRole } from '@prisma/client';

@Controller('admin/commission-rules')
@UseGuards(AuthGuard('jwt'), AdminGuard)
export class CommissionsController {
  constructor(private readonly commissionsService: CommissionsService) {}

  /**
   * Crée une nouvelle règle de commission
   * POST /admin/commission-rules
   */
  @Post()
  createRule(@Body() createDto: CreateCommissionRuleDto) {
    return this.commissionsService.createRule(createDto);
  }

  /**
   * Récupère toutes les règles de commission
   * GET /admin/commission-rules?target=USER
   */
  @Get()
  getAllRules(@Query('target') target?: string) {
    const audienceRole = target as AudienceRole;
    return this.commissionsService.getAllRules(audienceRole);
  }

  /**
   * Récupère une règle spécifique
   * GET /admin/commission-rules/:id
   */
  @Get(':id')
  getRuleById(@Param('id') id: string) {
    return this.commissionsService.getRuleById(id);
  }

  /**
   * Met à jour une règle
   * PATCH /admin/commission-rules/:id
   */
  @Patch(':id')
  updateRule(@Param('id') id: string, @Body() updateDto: UpdateCommissionRuleDto) {
    return this.commissionsService.updateRule(id, updateDto);
  }

  /**
   * Supprime une règle
   * DELETE /admin/commission-rules/:id
   */
  @Delete(':id')
  deleteRule(@Param('id') id: string) {
    return this.commissionsService.deleteRule(id);
  }
}

