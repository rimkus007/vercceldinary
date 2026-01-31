// dinary-temp/dinarus-backend/src/users/users.controller.ts

import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  Delete,
  UseGuards,
  Request,
  Query,
  NotFoundException,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { AdminService } from '../admin/admin.service';
import { UsersService } from './users.service';
import { AuthGuard } from '@nestjs/passport';
import { AdminGuard } from 'src/auth/guards/AdminGuard';

@Controller('users')
@UseGuards(AuthGuard('jwt'))
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly adminService: AdminService,
  ) {}

  @Get('me')
  async getMe(@Request() req) {
    const userId = req.user.sub;
    const user = await this.usersService.findOneById(userId);

    // --- CORRECTION ICI ---
    // On vérifie si l'utilisateur a bien été trouvé avant de continuer.
    if (!user) {
      // Même si le service le fait déjà, cette vérification est une bonne pratique
      // et elle satisfait le compilateur TypeScript.
      throw new NotFoundException(
        `Utilisateur avec l'ID ${userId} non trouvé.`,
      );
    }
    const verificationStatus =
      user.identityVerification?.status || 'NOT_SUBMITTED';

    // Maintenant que TypeScript sait que 'user' ne peut pas être 'null',
    // cette ligne ne posera plus de problème.
    const { hashedPassword, identityVerification, ...result } = user;
    return { ...result, verificationStatus };
  }
  @Get('me/rewards-details')
  async getMyRewardsDetails(@Request() req) {
    const userId = req.user.sub;
    return this.usersService.getRewardsDetails(userId);
  }
  @Get('me/referral-details')
  async getMyReferralDetails(@Request() req) {
    const userId = req.user.sub;
    return this.usersService.getReferralDetails(userId);
  }

  // ... (le reste de ton contrôleur reste inchangé)
  @Get('all')
  @UseGuards(AdminGuard)
  async findAll(@Request() req) {
    return this.usersService.findAll(req.user.id);
  }
  @UseGuards(AuthGuard('jwt'))
  @Patch('me/activity')
  updateActivity(@Request() req) {
    return this.usersService.updateActivity(req.user.sub);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('search')
  search(@Query('q') query: string, @Request() req) {
    const currentUserId = req.user.sub;
    return this.usersService.searchUsers(query, currentUserId);
  }

  @Get(':id/public')
  async getPublicProfile(@Param('id') id: string) {
    const user = await this.usersService.findOneById(id);
    if (!user) {
      throw new NotFoundException('Utilisateur non trouvé.');
    }
    return {
      id: user.id,
      fullName: user.fullName,
      username: user.username,
    };
  }

  // --- 💬 Chat utilisateur <-> admin ---
  /**
   * Récupère l'historique de conversation entre l'utilisateur courant et l'admin.
   */
  @Get('me/chat')
  async getMyChat(@Request() req) {
    const userId = req.user.sub;
    return this.adminService.getConversationForUser(userId);
  }

  /**
   * Envoie un message de l'utilisateur courant vers l'admin.
   */
  @Post('me/chat')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads/messages',
        filename: (req, file, cb) => {
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
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
    @Request() req,
    @Body('content') content: string,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    const userId = req.user.sub;
    const fileUrl = file ? `/uploads/messages/${file.filename}` : undefined;
    const fileName = file ? file.originalname : undefined;
    const fileType = file ? file.mimetype : undefined;
    
    return this.adminService.sendMessageFromUser(
      userId,
      content || '(Fichier joint)',
      fileUrl,
      fileName,
      fileType
    );
  }
}
