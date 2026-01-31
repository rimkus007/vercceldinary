// src/identity/identity.controller.ts
import {
  Controller,
  Post,
  UseGuards,
  UseInterceptors,
  UploadedFiles,
  Body,
  Request,
  Get,
  UnauthorizedException,
  Res,
  Param,
  NotFoundException,
} from '@nestjs/common';
import type { Response } from 'express';
import * as fs from 'fs';
import * as path from 'path';

import { AuthGuard } from '@nestjs/passport';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from 'src/auth/guards/JwtAuthGuard';
import { GetUser } from '../auth/decorators/get-user.decorator';
import type { User } from '@prisma/client';
import { IdentityService } from './identity.service';
import { CreateIdentityVerificationDto } from './dto/create-identity-verification.dto';
import { imageFileFilter, MAX_IMAGE_SIZE, validateImageFile } from '../utils/file-validation.util';
import { memoryStorage } from 'multer';
import { AdminGuard } from '../auth/guards/AdminGuard';

@UseGuards(AuthGuard('jwt'))
@Controller('identity')
export class IdentityController {
  constructor(private readonly identityService: IdentityService) {}

  private getUserId(req: any): string {
    const userId = req.user?.sub;
    if (!userId) {
      throw new UnauthorizedException(
        'ID utilisateur non trouvé dans le token.',
      );
    }
    return userId;
  }

  private resolveImageFullPath(imagePath: string): string {
    const uploadsRoot = path.resolve(process.cwd(), 'uploads');
    const normalizedUploadsRoot = path.normalize(uploadsRoot);

    if (!imagePath) {
      throw new NotFoundException('Chemin d\'image vide.');
    }

    if (path.isAbsolute(imagePath)) {
      const candidate = path.normalize(imagePath);
      if (
        candidate === normalizedUploadsRoot ||
        candidate.startsWith(normalizedUploadsRoot + path.sep)
      ) {
        return candidate;
      }
      throw new NotFoundException('Fichier image en dehors du dossier autorisé.');
    }

    let sanitized = imagePath
      .replace(/\\/g, '/')
      .replace(/^(\.\.(\/|\\))+/, '')
      .replace(/^\/+/, '');

    if (sanitized.startsWith('uploads/')) {
      sanitized = sanitized.substring('uploads/'.length);
    }

    const candidate = path.resolve(uploadsRoot, sanitized);
    const normalizedCandidate = path.normalize(candidate);

    if (
      normalizedCandidate === normalizedUploadsRoot ||
      normalizedCandidate.startsWith(normalizedUploadsRoot + path.sep)
    ) {
      return normalizedCandidate;
    }

    throw new NotFoundException('Chemin de fichier non autorisé.');
  }

  // 🔒 SÉCURITÉ: Upload avec validation stricte des images
  @Post('upload')
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        { name: 'frontImage', maxCount: 1 },
        { name: 'backImage', maxCount: 1 },
        { name: 'selfieImage', maxCount: 1 },
      ],
      {
        storage: memoryStorage(), // Utiliser memoryStorage pour que les fichiers soient en mémoire (buffer disponible)
        fileFilter: imageFileFilter, // 🔒 Validation des types de fichiers
        limits: {
          fileSize: MAX_IMAGE_SIZE, // 🔒 Limite de 5MB
          files: 3, // Maximum 3 fichiers
        },
      },
    ),
  )
  async submitDocuments(
    @GetUser() user: User,
    @UploadedFiles()
    files: {
      frontImage?: Express.Multer.File[];
      backImage?: Express.Multer.File[];
      selfieImage?: Express.Multer.File[];
    },
    @Body() createDto: CreateIdentityVerificationDto,
  ) {
    try {
      // 🔒 SÉCURITÉ: Validation supplémentaire côté serveur
      if (files.frontImage?.[0]) {
        validateImageFile(files.frontImage[0]);
      }
      if (files.backImage?.[0]) {
        validateImageFile(files.backImage[0]);
      }
      if (files.selfieImage?.[0]) {
        validateImageFile(files.selfieImage[0]);
      }

      return await this.identityService.submitDocuments(
        user.id,
        createDto.documentType,
        createDto.selfieInstruction,
        files,
        createDto.taxNumber,
      );
    } catch (error) {
      void 0;
      throw error;
    }
  }

  @Get('status')
  getStatus(@Request() req) {
    const userId = this.getUserId(req);
    return this.identityService.getStatus(userId);
  }

  // Endpoint pour servir les images d'identité (protégé par admin)
  @Get('image/:verificationId/:imageType')
  @UseGuards(AuthGuard('jwt'), AdminGuard)
  async getIdentityImage(
    @Param('verificationId') verificationId: string,
    @Param('imageType') imageType: 'front' | 'back' | 'selfie',
    @Res() res: Response,
  ) {
    try {
      const verification = await this.identityService.getVerificationById(verificationId);
      
      if (!verification) {
        throw new NotFoundException('Vérification non trouvée');
      }

      let imagePath: string | null = null;
      switch (imageType) {
        case 'front':
          imagePath = verification.frontImageUrl;
          break;
        case 'back':
          imagePath = verification.backImageUrl;
          break;
        case 'selfie':
          imagePath = verification.selfieImageUrl;
          break;
        default:
          throw new NotFoundException('Type d\'image invalide');
      }

      if (!imagePath) {
        throw new NotFoundException(`Image ${imageType} non trouvée pour cette vérification`);
      }

      // Construire le chemin complet du fichier (compatible anciens et nouveaux chemins)
      const fullPath = this.resolveImageFullPath(imagePath);
      
      // Vérifier que le fichier existe
      if (!fs.existsSync(fullPath)) {
        void 0;
        void 0;
        void 0;
        throw new NotFoundException(`Fichier image non trouvé sur le serveur: ${imagePath}`);
      }

      // Déterminer le type MIME
      const ext = path.extname(fullPath).toLowerCase();
      const mimeTypes: { [key: string]: string } = {
        '.jpg': 'image/jpeg',
        '.jpeg': 'image/jpeg',
        '.png': 'image/png',
        '.webp': 'image/webp',
        '.heic': 'image/heic',
      };
      const mimeType = mimeTypes[ext] || 'image/jpeg';

      // Servir le fichier
      res.setHeader('Content-Type', mimeType);
      res.setHeader('Content-Disposition', `inline; filename="${path.basename(fullPath)}"`);
      res.setHeader('Cache-Control', 'private, max-age=3600');
      res.sendFile(fullPath, (err) => {
        if (err) {
          void 0;
          if (!res.headersSent) {
            res.status(500).json({ message: 'Erreur lors de l\'envoi de l\'image' });
          }
        }
      });
    } catch (error) {
      void 0;
      if (!res.headersSent) {
        if (error instanceof NotFoundException) {
          res.status(404).json({ message: error.message });
        } else {
          res.status(500).json({ message: 'Erreur serveur lors de la récupération de l\'image' });
        }
      }
    }
  }
}
