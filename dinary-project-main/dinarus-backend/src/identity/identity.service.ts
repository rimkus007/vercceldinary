// src/identity/identity.service.ts
import {
  Injectable,
  ConflictException,
  NotFoundException,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { v4 as uuidv4 } from 'uuid'; // Pour générer des noms de fichiers uniques
import * as fs from 'fs'; // Pour interagir avec le système de fichiers
import * as path from 'path'; // Pour gérer les chemins de fichiers

@Injectable()
export class IdentityService {
  constructor(private prisma: PrismaService) {}

  async submitDocuments(
    userId: string,
    documentType: 'ID_CARD' | 'PASSPORT' | 'DRIVER_LICENSE',
    selfieInstruction: string,
    files: {
      frontImage?: Express.Multer.File[];
      backImage?: Express.Multer.File[];
      selfieImage?: Express.Multer.File[];
    },
    taxNumber?: string,
  ) {
    const existingVerification =
      await this.prisma.identityVerification.findUnique({
        where: { userId },
      });

    if (existingVerification && existingVerification.status !== 'REJECTED') {
      throw new ConflictException(
        'Vous avez déjà une vérification en cours ou approuvée.',
      );
    }

    // Validation des fichiers obligatoires
    if (!files.frontImage || files.frontImage.length === 0) {
      throw new BadRequestException(
        'L\'image recto du document est obligatoire.',
      );
    }

    if (!files.selfieImage || files.selfieImage.length === 0) {
      throw new BadRequestException('L\'image selfie est obligatoire.');
    }

    const frontImage = files.frontImage[0];
    const selfieImage = files.selfieImage[0];

    // Vérifier que les fichiers ont un buffer (nécessaire avec memoryStorage)
    if (!frontImage.buffer) {
      throw new BadRequestException(
        'Erreur lors du traitement de l\'image recto du document.',
      );
    }

    if (!selfieImage.buffer) {
      throw new BadRequestException(
        'Erreur lors du traitement de l\'image selfie.',
      );
    }

    // Vérifier que backImage est fourni si ce n'est pas un passeport
    if (documentType !== 'PASSPORT' && (!files.backImage || files.backImage.length === 0)) {
      throw new BadRequestException(
        'L\'image verso du document est obligatoire pour ce type de document.',
      );
    }

    // Vérifier le rôle de l'utilisateur pour savoir si taxNumber est requis
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { role: true },
    });

    if (!user) {
      throw new NotFoundException('Utilisateur non trouvé.');
    }

    // Si c'est un marchand, le numéro d'impôt est obligatoire
    if (user.role === 'MERCHANT' && (!taxNumber || taxNumber.trim() === '')) {
      throw new BadRequestException(
        'Le numéro d\'impôt est obligatoire pour les marchands.',
      );
    }

    try {
      // --- NOUVELLE LOGIQUE DE SAUVEGARDE ---

      // 1. Définir le chemin de sauvegarde (ex: /uploads/documents/)
      const uploadPath = path.join(process.cwd(), 'uploads', 'documents');
      if (!fs.existsSync(uploadPath)) {
        fs.mkdirSync(uploadPath, { recursive: true });
      }

      // Sauvegarder l'image recto
      const frontImageExt = path.extname(frontImage.originalname) || '.jpg';
      const frontImageName = `${uuidv4()}${frontImageExt}`;
      const frontImagePath = path.join(uploadPath, frontImageName);
      fs.writeFileSync(frontImagePath, frontImage.buffer);
      const frontImageUrl = `documents/${frontImageName}`;

      // Sauvegarder l'image verso (si fournie)
      let backImageUrl: string | null = null;
      if (files.backImage && files.backImage.length > 0) {
        const backImage = files.backImage[0];
        if (!backImage.buffer) {
          throw new BadRequestException(
            'Erreur lors du traitement de l\'image verso du document.',
          );
        }
        const backImageExt = path.extname(backImage.originalname) || '.jpg';
        const backImageName = `${uuidv4()}${backImageExt}`;
        const backImagePath = path.join(uploadPath, backImageName);
        fs.writeFileSync(backImagePath, backImage.buffer);
        backImageUrl = `documents/${backImageName}`;
      }

      // Sauvegarder le selfie
      const selfieImageExt = path.extname(selfieImage.originalname) || '.jpg';
      const selfieImageName = `${uuidv4()}${selfieImageExt}`;
      const selfieImagePath = path.join(uploadPath, selfieImageName);
      fs.writeFileSync(selfieImagePath, selfieImage.buffer);
      const selfieImageUrl = `documents/${selfieImageName}`;

      // --- FIN DE LA NOUVELLE LOGIQUE ---

      // Sauvegarder en base de données
      const verification = await this.prisma.identityVerification.upsert({
        where: { userId },
        update: {
          status: 'PENDING',
          documentType,
          frontImageUrl, // Sauvegarde le nouveau chemin
          backImageUrl,
          selfieImageUrl,
          selfieInstruction,
          taxNumber: taxNumber || null, // Sauvegarder le numéro d'impôt si fourni
          rejectionReason: null,
        },
        create: {
          userId,
          documentType,
          frontImageUrl,
          backImageUrl,
          selfieImageUrl,
          selfieInstruction,
          taxNumber: taxNumber || null, // Sauvegarder le numéro d'impôt si fourni
        },
      });

      // Si c'est un marchand et qu'un numéro d'impôt est fourni, le mettre à jour dans le profil marchand
      if (user.role === 'MERCHANT' && taxNumber) {
        await this.prisma.merchant.updateMany({
          where: { userId },
          data: { taxNumber },
        });
      }

      return verification;
    } catch (error) {
      
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException(
        'Une erreur est survenue lors de l\'upload des documents. Veuillez réessayer.',
      );
    }
  }

  async getStatus(userId: string) {
    // ... (votre code existant ici, pas de changement nécessaire)
    const verification = await this.prisma.identityVerification.findUnique({
      where: { userId },
      select: {
        status: true,
        rejectionReason: true,
        documentType: true,
      },
    });

    if (!verification) {
      return { status: 'NOT_SUBMITTED' };
    }
    return verification;
  }

  async getVerificationById(verificationId: string) {
    const verification = await this.prisma.identityVerification.findUnique({
      where: { id: verificationId },
      select: {
        id: true,
        frontImageUrl: true,
        backImageUrl: true,
        selfieImageUrl: true,
      },
    });

    if (!verification) {
      return null;
    }
    return verification;
  }
}
