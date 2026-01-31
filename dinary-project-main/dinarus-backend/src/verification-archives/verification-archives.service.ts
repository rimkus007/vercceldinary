import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { EncryptionService } from '../utils/encryption.service';
import * as bcrypt from 'bcrypt';

export interface SensitiveData {
  documentNumber?: string;
  dateOfBirth?: string;
  address?: string;
  nationality?: string;
  expirationDate?: string;
  issueDate?: string;
  placeOfBirth?: string;
  [key: string]: any; // Pour des champs additionnels
}

@Injectable()
export class VerificationArchivesService {
  constructor(private prisma: PrismaService) {}

  /**
   * Créer une archive après vérification approuvée
   * @param userId ID de l'utilisateur
   * @param documentType Type de document
   * @param sensitiveData Données sensibles à chiffrer
   * @param verifiedBy ID de l'admin qui vérifie
   * @param notes Notes optionnelles
   */
  async createArchive(
    userId: string,
    documentType: string,
    sensitiveData: SensitiveData,
    verifiedBy: string,
    notes?: string,
  ) {
    // Récupère les infos de l'utilisateur
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        fullName: true,
        email: true,
        phoneNumber: true,
      },
    });

    if (!user) {
      throw new Error('Utilisateur non trouvé');
    }

    // Chiffre les données sensibles
    const encryptedData = EncryptionService.encrypt(JSON.stringify(sensitiveData));

    // Crée l'archive
    const archive = await this.prisma.verificationArchive.create({
      data: {
        userId: user.id,
        userFullName: user.fullName,
        userEmail: user.email,
        userPhone: user.phoneNumber,
        documentType,
        encryptedData,
        verifiedBy,
        notes,
      },
    });

    return {
      id: archive.id,
      userId: archive.userId,
      archivedAt: archive.archivedAt,
    };
  }

  /**
   * Récupère toutes les archives (admin only)
   * @param filters Filtres optionnels
   */
  async getAllArchives(filters?: {
    userId?: string;
    email?: string;
    startDate?: Date;
    endDate?: Date;
  }) {
    const where: any = {};

    if (filters?.userId) {
      where.userId = filters.userId;
    }
    if (filters?.email) {
      where.userEmail = { contains: filters.email, mode: 'insensitive' };
    }
    if (filters?.startDate || filters?.endDate) {
      where.archivedAt = {};
      if (filters.startDate) where.archivedAt.gte = filters.startDate;
      if (filters.endDate) where.archivedAt.lte = filters.endDate;
    }

    const archives = await this.prisma.verificationArchive.findMany({
      where,
      orderBy: { archivedAt: 'desc' },
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            email: true,
            phoneNumber: true,
            isVerified: true,
          },
        },
      },
    });

    // Ne retourne PAS les données déchiffrées par défaut (sécurité)
    return archives.map((archive) => ({
      id: archive.id,
      userId: archive.userId,
      userFullName: archive.userFullName,
      userEmail: archive.userEmail,
      userPhone: archive.userPhone,
      documentType: archive.documentType,
      verifiedAt: archive.verifiedAt,
      verifiedBy: archive.verifiedBy,
      archivedAt: archive.archivedAt,
      notes: archive.notes,
      hasEncryptedData: !!archive.encryptedData,
      user: archive.user,
    }));
  }

  /**
   * Déverrouille une archive avec vérification du mot de passe admin
   * @param archiveId ID de l'archive
   * @param adminId ID de l'admin
   * @param password Mot de passe de l'admin
   */
  async unlockArchiveWithPassword(
    archiveId: string,
    adminId: string,
    password: string,
  ) {
    // Récupère l'admin depuis la base de données
    const admin = await this.prisma.user.findUnique({
      where: { id: adminId },
      select: { id: true, hashedPassword: true, role: true, email: true },
    });

    if (!admin || admin.role !== 'ADMIN') {
      throw new UnauthorizedException('Accès refusé');
    }

    // Vérifie le mot de passe
    const isPasswordValid = await bcrypt.compare(password, admin.hashedPassword);
    
    if (!isPasswordValid) {
      void 0;
      throw new UnauthorizedException('Mot de passe incorrect');
    }

    void 0;

    // Si le mot de passe est correct, déchiffre l'archive
    return this.getArchiveById(archiveId, adminId);
  }

  /**
   * Récupère une archive spécifique avec déchiffrement (admin only)
   * @param archiveId ID de l'archive
   * @param adminId ID de l'admin qui demande l'accès (pour audit)
   */
  async getArchiveById(archiveId: string, adminId: string) {
    const archive = await this.prisma.verificationArchive.findUnique({
      where: { id: archiveId },
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            email: true,
            phoneNumber: true,
            isVerified: true,
            dateOfBirth: true,
            address: true,
          },
        },
      },
    });

    if (!archive) {
      throw new Error('Archive non trouvée');
    }

    // Déchiffre les données sensibles
    let decryptedData: SensitiveData = {};
    try {
      const decryptedString = EncryptionService.decrypt(archive.encryptedData);
      decryptedData = JSON.parse(decryptedString);
    } catch (error) {
      void 0;
      throw new Error('Impossible de déchiffrer les données');
    }

    // Log l'accès pour audit (optionnel mais recommandé)
    void 0;

    return {
      id: archive.id,
      userId: archive.userId,
      userFullName: archive.userFullName,
      userEmail: archive.userEmail,
      userPhone: archive.userPhone,
      documentType: archive.documentType,
      verifiedAt: archive.verifiedAt,
      verifiedBy: archive.verifiedBy,
      archivedAt: archive.archivedAt,
      notes: archive.notes,
      // Données déchiffrées
      sensitiveData: decryptedData,
      user: archive.user,
    };
  }

  /**
   * Supprime une archive (à utiliser avec précaution)
   * @param archiveId ID de l'archive
   * @param adminId ID de l'admin qui supprime
   */
  async deleteArchive(archiveId: string, adminId: string) {
    const archive = await this.prisma.verificationArchive.findUnique({
      where: { id: archiveId },
    });

    if (!archive) {
      throw new Error('Archive non trouvée');
    }

    // Log la suppression pour audit
    void 0;

    await this.prisma.verificationArchive.delete({
      where: { id: archiveId },
    });

    return { success: true, message: 'Archive supprimée' };
  }

  /**
   * Recherche une archive par email d'utilisateur
   * @param email Email de l'utilisateur
   */
  async searchByEmail(email: string) {
    return this.getAllArchives({ email });
  }

  /**
   * Statistiques des archives
   */
  async getStats() {
    const total = await this.prisma.verificationArchive.count();
    const last30Days = await this.prisma.verificationArchive.count({
      where: {
        archivedAt: {
          gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        },
      },
    });

    const byDocumentType = await this.prisma.verificationArchive.groupBy({
      by: ['documentType'],
      _count: true,
    });

    return {
      total,
      last30Days,
      byDocumentType: byDocumentType.map((item) => ({
        type: item.documentType,
        count: item._count,
      })),
    };
  }

  /**
   * Exporte toutes les archives en CSV (SANS les données sensibles)
   */
  async exportToCSV() {
    const archives = await this.prisma.verificationArchive.findMany({
      orderBy: { archivedAt: 'desc' },
    });

    // En-têtes CSV
    const headers = [
      'ID Archive',
      'ID Utilisateur',
      'Nom Complet',
      'Email',
      'Téléphone',
      'Type de Document',
      'Date de Vérification',
      'Vérifié Par (Admin ID)',
      'Date d\'Archivage',
      'A des Données Chiffrées',
      'Notes',
    ];

    // Convertit les archives en lignes CSV
    const rows = archives.map((archive) => [
      archive.id,
      archive.userId,
      archive.userFullName,
      archive.userEmail,
      archive.userPhone || 'N/A',
      archive.documentType,
      new Date(archive.verifiedAt).toLocaleString('fr-FR'),
      archive.verifiedBy,
      new Date(archive.archivedAt).toLocaleString('fr-FR'),
      archive.encryptedData ? 'Oui' : 'Non',
      archive.notes || 'Aucune',
    ]);

    // Génère le CSV
    const csvLines = [
      headers.join(','),
      ...rows.map((row) =>
        row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(','),
      ),
    ];

    const csvContent = csvLines.join('\n');

    return {
      filename: `archives-verification-${new Date().toISOString().split('T')[0]}.csv`,
      content: csvContent,
      contentType: 'text/csv;charset=utf-8',
    };
  }
}
