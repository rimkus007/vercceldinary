// src/notifications/notifications.service.ts
import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class NotificationsService {
  constructor(private prisma: PrismaService) {}

  /**
   * Crée une nouvelle notification pour un utilisateur.
   * @param data Les données de la notification (userId, message)
   */
  async create(data: Prisma.NotificationCreateInput) {
    return this.prisma.notification.create({
      data,
    });
  }
  // Cette fonction pour récupérer les notifications est déjà correcte
  findAll(userId: string) {
    return this.prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Marque toutes les notifications non lues d'un utilisateur comme lues.
   */
  async markAllAsRead(userId: string) {
    await this.prisma.notification.updateMany({
      where: {
        userId: userId,
        isRead: false,
      },
      data: {
        isRead: true,
      },
    });
    return { message: 'Notifications marquées comme lues.' };
  }

  /**
   * Supprime TOUTES les notifications pour un utilisateur donné.
   */
  async deleteAllForUser(userId: string) {
    await this.prisma.notification.deleteMany({
      where: {
        userId: userId,
      },
    });
    return { message: 'Notifications supprimées.' };
  }
}
