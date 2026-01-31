// Fichier : src/merchants/merchants.controller.ts

import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
  Req,
  Query,
  Patch,
  Param,
  Delete,
  UnauthorizedException,
  BadRequestException,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { MerchantsService } from './merchants.service';
import { CreateMerchantDto } from './dto/create-merchant.dto';
import { SuggestMerchantDto } from './dto/suggest-merchant.dto';
import { NearbyMerchantsDto } from './dto/nearby-merchants.dto';
import { UpdateLocationDto } from './dto/update-location.dto';
import { UpdateMerchantDto } from './dto/update-merchant.dto';
import { JwtAuthGuard } from '../auth/guards/JwtAuthGuard';
import { IsNumber, IsPositive } from 'class-validator';
import { AdminService } from '../admin/admin.service';

export class UpdateSalesGoalDto {
  @IsNumber({}, { message: "L'objectif doit être un nombre." })
  @IsPositive({ message: "L'objectif doit être un nombre positif." })
  salesGoal: number;
}

@Controller('merchants')
@UseGuards(JwtAuthGuard) // ✅ Appliquer le guard à tout le contrôleur
export class MerchantsController {
  constructor(
    private readonly merchantsService: MerchantsService,
    private readonly adminService: AdminService,
  ) {}

  // ✅ Fonction utilitaire pour récupérer l'ID utilisateur de manière fiable
  private getUserId(req: any): string {
    const userId = req.user?.id || req.user?.sub;
    if (!userId) {
      throw new UnauthorizedException(
        'ID utilisateur non trouvé dans le token',
      );
    }
    return userId;
  }

  @Patch('me')
  async updateMe(@Req() req: any, @Body() dto: UpdateMerchantDto) {
    const userId = this.getUserId(req);
    return this.merchantsService.updateByUserId(userId, dto);
  }

  @Post()
  create(@Req() req: any, @Body() createMerchantDto: CreateMerchantDto) {
    const userId = this.getUserId(req);
    return this.merchantsService.create(userId, createMerchantDto);
  }

  @Get('me')
  findMyProfile(@Req() req: any) {
    const userId = this.getUserId(req);
    return this.merchantsService.findMe(userId);
  }

  @Get('dashboard')
  getDashboardData(@Req() req: any) {
    const userId = this.getUserId(req);
    return this.merchantsService.getDashboardData(userId);
  }

  @Post('suggest')
  suggest(@Req() req: any, @Body() suggestMerchantDto: SuggestMerchantDto) {
    const userId = this.getUserId(req);
    return this.merchantsService.suggest(userId, suggestMerchantDto);
  }

  @Get('suggestions/my')
  findMySuggestions(@Req() req: any) {
    const userId = this.getUserId(req);
    return this.merchantsService.findMySuggestions(userId);
  }

  @Get('nearby')
  findNearby(@Query() nearbyMerchantsDto: NearbyMerchantsDto) {
    return this.merchantsService.findNearby(nearbyMerchantsDto);
  }

  @Patch('me/location')
  async updateMyLocation(@Req() req: any, @Body() dto: UpdateLocationDto) {
    const userId = this.getUserId(req);
    return this.merchantsService.updateLocation(
      userId,
      dto.latitude,
      dto.longitude,
      dto.address,
    );
  }

  @Get('me/stats') // Endpoint pour les stats détaillées
  async getMyStats(@Req() req: any) {
    const userId = this.getUserId(req);
    // Important: getMerchantStats attend l'ID du *Merchant*, pas de l'User
    const merchant = await this.merchantsService.findMe(userId); // Trouve le merchant via userId
    return this.merchantsService.getMerchantStats(merchant.id); // Passe l'ID du merchant
  }

  @Get('me/notifications')
  async getMyNotifications(@Req() req: any) {
    const userId = this.getUserId(req);
    const merchant = await this.merchantsService.findMe(userId);
    return this.merchantsService.getMerchantNotifications(merchant.id);
  }

  @Post('me/notifications/:notificationId/read')
  async markNotificationAsRead(
    @Req() req: any,
    @Param('notificationId') notificationId: string,
  ) {
    const userId = this.getUserId(req);
    const merchant = await this.merchantsService.findMe(userId);
    return this.merchantsService.markNotificationAsRead(
      merchant.id,
      notificationId,
    );
  }

  @Post('me/notifications/mark-all-read')
  async markAllNotificationsAsRead(@Req() req: any) {
    const userId = this.getUserId(req);
    const merchant = await this.merchantsService.findMe(userId);
    return this.merchantsService.markAllNotificationsAsRead(merchant.id);
  }

  @Delete('me/notifications')
  async deleteAllNotifications(@Req() req: any) {
    const userId = this.getUserId(req);
    const merchant = await this.merchantsService.findMe(userId);
    return this.merchantsService.deleteAllNotifications(merchant.id);
  }
  // --- 👇 NOUVEL ENDPOINT ---
  /**
   * Permet au marchand de définir son objectif de ventes mensuel.
   */
  @Patch('me/sales-goal')
  async setMySalesGoal(
    @Req() req: any,
    @Body() updateSalesGoalDto: UpdateSalesGoalDto,
  ) {
    const userId = this.getUserId(req);
    // Valider que salesGoal est bien un nombre positif (le DTO s'en charge avec class-validator)
    return this.merchantsService.updateSalesGoal(
      userId,
      updateSalesGoalDto.salesGoal,
    );
  }

  /**
   * Récupère la conversation entre le marchand et l'admin
   */
  @Get('me/chat')
  async getMyChat(@Req() req: any) {
    const userId = this.getUserId(req);
    return this.adminService.getConversationForUser(userId);
  }

  /**
   * Envoie un message de la part du marchand à l'admin
   */
  @Post('me/chat')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads/messages',
        filename: (req, file, cb) => {
          const uniqueSuffix =
            Date.now() + '-' + Math.round(Math.random() * 1e9);
          const ext = extname(file.originalname);
          cb(null, `${uniqueSuffix}${ext}`);
        },
      }),
      limits: {
        fileSize: 10 * 1024 * 1024, // 10MB max
      },
    }),
  )
  async sendMyChat(
    @Req() req: any,
    @Body('content') content: string,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    const userId = this.getUserId(req);
    const fileUrl = file ? `/uploads/messages/${file.filename}` : undefined;
    const fileName = file ? file.originalname : undefined;
    const fileType = file ? file.mimetype : undefined;

    return this.adminService.sendMessageFromUser(
      userId,
      content || '(Fichier joint)',
      fileUrl,
      fileName,
      fileType,
    );
  }
}
