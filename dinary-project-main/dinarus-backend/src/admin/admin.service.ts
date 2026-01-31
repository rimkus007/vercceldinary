// src/admin/admin.service.ts
import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
  
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma, AudienceRole } from '@prisma/client';
import { CommissionsService } from '../commissions/commissions.service';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { GamificationService } from 'src/gamification/gamification.service';
import { VerificationArchivesService } from '../verification-archives/verification-archives.service';
import { CreateMissionDto } from './dto/create-mission.dto';
import { CreateCommissionRuleDto } from './dto/create-commission-rule.dto';
import { UpdateCommissionRuleDto } from './dto/update-commission-rule.dto';
import { CreateXpRuleDto } from './dto/create-xp-rule.dto';
import { UpdateXpRuleDto } from './dto/update-xp-rule.dto';
import { CreateLevelRuleDto } from './dto/create-level-rule.dto';
import { UpdateLevelRuleDto } from './dto/update-level-rule.dto';
import { randomUUID } from 'crypto';
import * as fs from 'fs';
import * as path from 'path';
import * as bcrypt from 'bcrypt';
import { nanoid } from 'nanoid';
import { ChurnStatsQueryDto, ConversionStatsQueryDto, RetentionStatsQueryDto, StatsPeriod } from './dto/stats-query.dto';

export interface MessageRecord {
  id: string;
  senderId: string;
  content: string;
  timestamp: string;
  read: boolean;
}
@Injectable()
export class AdminService {
  constructor(
    private prisma: PrismaService,
    private gamificationService: GamificationService,
    private verificationArchivesService: VerificationArchivesService,
    private commissionsService: CommissionsService,
  ) {}

  /**
   * Note: Les conversations sont maintenant persistées en base de données via le modèle AdminMessage.
   * Plus besoin de stockage en mémoire.
   */

  /**
   * Fonction helper pour calculer la plage de dates selon la période demandée
   */
  private getDateRangeFromPeriod(period?: StatsPeriod): { startDate: Date; endDate: Date } {
    const now = new Date();
    const endDate = now;
    let startDate: Date;

    switch (period) {
      case StatsPeriod.SEVEN_DAYS:
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case StatsPeriod.THIRTY_DAYS:
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case StatsPeriod.NINETY_DAYS:
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      case StatsPeriod.SIX_MONTHS:
        startDate = new Date(now.getTime() - 180 * 24 * 60 * 60 * 1000);
        break;
      case StatsPeriod.ONE_YEAR:
        startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
        break;
      default:
        // Par défaut, 30 jours
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }

    return { startDate, endDate };
  }

  /**
   * Représente un message échangé dans la messagerie interne.
   */

  // ==================== ANALYSES DYNAMIQUES ====================

  /**
   * Calcule les métriques de churn des utilisateurs
   */
  async getChurnMetrics() {
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);

    // Utilisateurs actifs dans les 30 derniers jours
    const activeUsers30Days = await this.prisma.user.count({
      where: {
        lastSeen: {
          gte: thirtyDaysAgo,
        },
        role: 'USER',
      },
    });

    // Utilisateurs actifs il y a 30-60 jours (cohorte de référence)
    const cohortUsers = await this.prisma.user.count({
      where: {
        lastSeen: {
          gte: sixtyDaysAgo,
          lt: thirtyDaysAgo,
        },
        role: 'USER',
      },
    });

    // Utilisateurs de la cohorte qui sont encore actifs
    const retainedUsers = await this.prisma.user.count({
      where: {
        lastSeen: {
          gte: thirtyDaysAgo,
        },
        role: 'USER',
        createdAt: {
          lte: thirtyDaysAgo,
        },
      },
    });

    const churnRate =
      cohortUsers > 0 ? ((cohortUsers - retainedUsers) / cohortUsers) * 100 : 0;
    const retentionRate =
      cohortUsers > 0 ? (retainedUsers / cohortUsers) * 100 : 0;

    return {
      churnRate: Math.round(churnRate * 100) / 100,
      retentionRate: Math.round(retentionRate * 100) / 100,
      activeUsers30Days,
      cohortUsers,
      retainedUsers,
    };
  }

  /**
   * Calcule les métriques de rétention par cohorte
   */
  async getRetentionMetrics() {
    const now = new Date();
    const cohorts: Array<{
      month: string;
      newUsers: number;
      activeUsers: number;
      retentionRate: number;
    }> = [];

    // Analyser les 6 derniers mois
    for (let i = 0; i < 6; i++) {
      const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);

      // Utilisateurs créés ce mois
      const newUsers = await this.prisma.user.count({
        where: {
          createdAt: {
            gte: monthStart,
            lte: monthEnd,
          },
          role: 'USER',
        },
      });

      // Utilisateurs encore actifs (dernière activité dans les 30 jours)
      const activeUsers = await this.prisma.user.count({
        where: {
          createdAt: {
            gte: monthStart,
            lte: monthEnd,
          },
          lastSeen: {
            gte: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000),
          },
          role: 'USER',
        },
      });

      cohorts.push({
        month: monthStart.toISOString().slice(0, 7),
        newUsers,
        activeUsers,
        retentionRate:
          newUsers > 0 ? Math.round((activeUsers / newUsers) * 100) : 0,
      });
    }

    return cohorts.reverse();
  }

  /**
   * Calcule le Lifetime Value (LTV) des utilisateurs
   */
  async getLTVMetrics() {
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    // Revenus totaux
    const totalRevenue = await this.prisma.transaction.aggregate({
      _sum: {
        amount: true,
      },
      where: {
        type: 'payment',
        status: 'completed',
      },
    });

    // Nombre total d'utilisateurs
    const totalUsers = await this.prisma.user.count({
      where: {
        role: 'USER',
      },
    });

    // Revenus des 30 derniers jours
    const recentRevenue = await this.prisma.transaction.aggregate({
      _sum: {
        amount: true,
      },
      where: {
        type: 'payment',
        status: 'completed',
        createdAt: {
          gte: thirtyDaysAgo,
        },
      },
    });

    // Utilisateurs actifs des 30 derniers jours
    const activeUsers = await this.prisma.user.count({
      where: {
        lastSeen: {
          gte: thirtyDaysAgo,
        },
        role: 'USER',
      },
    });

    const totalRevenueAmount = totalRevenue._sum.amount || 0;
    const recentRevenueAmount = recentRevenue._sum.amount || 0;
    const avgLTV = totalUsers > 0 ? totalRevenueAmount / totalUsers : 0;
    const avgRevenuePerActiveUser =
      activeUsers > 0 ? recentRevenueAmount / activeUsers : 0;

    return {
      totalRevenue: totalRevenueAmount,
      avgLTV: Math.round(avgLTV * 100) / 100,
      avgRevenuePerActiveUser: Math.round(avgRevenuePerActiveUser * 100) / 100,
      totalUsers,
      activeUsers,
    };
  }

  /**
   * Calcule les métriques de conversion
   */
  async getConversionMetrics() {
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    // Utilisateurs inscrits
    const totalUsers = await this.prisma.user.count({
      where: {
        role: 'USER',
      },
    });

    // Utilisateurs avec au moins une transaction
    const usersWithTransactions = await this.prisma.user.count({
      where: {
        role: 'USER',
        wallet: {
          receivedTransactions: {
            some: {},
          },
        },
      },
    });

    // Utilisateurs actifs (dernière activité dans les 30 jours)
    const activeUsers = await this.prisma.user.count({
      where: {
        lastSeen: {
          gte: thirtyDaysAgo,
        },
        role: 'USER',
      },
    });

    // Utilisateurs avec compte vérifié
    const verifiedUsers = await this.prisma.user.count({
      where: {
        role: 'USER',
        isVerified: true,
      },
    });

    const conversionRate =
      totalUsers > 0 ? (usersWithTransactions / totalUsers) * 100 : 0;
    const activationRate =
      totalUsers > 0 ? (activeUsers / totalUsers) * 100 : 0;
    const verificationRate =
      totalUsers > 0 ? (verifiedUsers / totalUsers) * 100 : 0;

    return {
      totalUsers,
      usersWithTransactions,
      activeUsers,
      verifiedUsers,
      conversionRate: Math.round(conversionRate * 100) / 100,
      activationRate: Math.round(activationRate * 100) / 100,
      verificationRate: Math.round(verificationRate * 100) / 100,
    };
  }

  /**
   * Calcule les métriques géographiques pour la cartographie
   */
  async getGeographicMetrics() {
    // Commerçants par région (basé sur les coordonnées)
    const merchants = await this.prisma.merchant.findMany({
      where: {
        latitude: { not: null },
        longitude: { not: null },
        isApproved: true,
      },
      select: {
        id: true,
        name: true,
        latitude: true,
        longitude: true,
        category: true,
        totalRevenue: true,
        user: {
          select: {
            wallet: {
              select: {
                id: true,
                receivedTransactions: {
                  where: {
                    type: 'payment',
                    status: 'completed',
                  },
                  select: {
                    amount: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    // Transactions par région
    const transactionsByRegion = await this.prisma.transaction.groupBy({
      by: ['receiverId'],
      where: {
        type: 'payment',
        status: 'completed',
      },
      _sum: {
        amount: true,
      },
      _count: {
        id: true,
      },
    });

    // Créer une map des transactions par commerçant
    const transactionMap = new Map();
    transactionsByRegion.forEach((t) => {
      transactionMap.set(t.receiverId, {
        totalAmount: t._sum.amount || 0,
        transactionCount: t._count.id,
      });
    });

    // Enrichir les données des commerçants avec les transactions
    const enrichedMerchants = merchants.map((merchant) => {
      const walletId = merchant.user.wallet?.id;
      const transactionData = walletId ? transactionMap.get(walletId) : null;
      const data = transactionData || {
        totalAmount: 0,
        transactionCount: 0,
      };

      return {
        id: merchant.id,
        name: merchant.name,
        latitude: merchant.latitude,
        longitude: merchant.longitude,
        category: merchant.category,
        totalRevenue: merchant.totalRevenue,
        transactionAmount: data.totalAmount,
        transactionCount: data.transactionCount,
      };
    });

    return enrichedMerchants;
  }

  /**
   * Système de tâches pour l'admin
   */
  async getAdminTasks() {
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    // Tâches basées sur les données réelles
    const tasks: Array<{
      id: string;
      title: string;
      description: string;
      type: string;
      priority: 'low' | 'medium' | 'high';
      count: number;
      action: string;
      href: string;
    }> = [];

    // 1. Vérifications d'identité en attente
    const pendingVerifications = await this.prisma.identityVerification.count({
      where: { status: 'PENDING' },
    });
    if (pendingVerifications > 0) {
      tasks.push({
        id: 'pending-verifications',
        title: "Vérifications d'identité en attente",
        description: `${pendingVerifications} demande(s) de vérification d'identité en attente`,
        type: 'verification',
        priority: 'high',
        count: pendingVerifications,
        action: 'Vérifier les documents',
        href: '/admin/users?tab=verifications',
      });
    }

    // 2. Recharges en attente
    const pendingRecharges = await this.prisma.rechargeRequest.count({
      where: { status: 'PENDING' },
    });
    if (pendingRecharges > 0) {
      tasks.push({
        id: 'pending-recharges',
        title: 'Recharges en attente',
        description: `${pendingRecharges} demande(s) de recharge en attente`,
        type: 'recharge',
        priority: 'medium',
        count: pendingRecharges,
        action: 'Traiter les recharges',
        href: '/admin/recharges',
      });
    }

    // 3. Suggestions de commerçants en attente
    const pendingSuggestions = await this.prisma.merchantSuggestion.count({
      where: { status: 'pending' },
    });
    if (pendingSuggestions > 0) {
      tasks.push({
        id: 'pending-suggestions',
        title: 'Suggestions de commerçants',
        description: `${pendingSuggestions} suggestion(s) de commerçants en attente`,
        type: 'suggestion',
        priority: 'medium',
        count: pendingSuggestions,
        action: 'Examiner les suggestions',
        href: '/admin/merchants?tab=suggestions',
      });
    }

    // 4. Retraits en attente
    const pendingWithdrawals = await this.prisma.withdrawalRequest.count({
      where: { status: 'PENDING' },
    });
    if (pendingWithdrawals > 0) {
      tasks.push({
        id: 'pending-withdrawals',
        title: 'Retraits en attente',
        description: `${pendingWithdrawals} demande(s) de retrait en attente`,
        type: 'withdrawal',
        priority: 'high',
        count: pendingWithdrawals,
        action: 'Traiter les retraits',
        href: '/admin/withdrawals',
      });
    }

    // 5. Commerçants non approuvés (excluant les suggestions)
    const unapprovedMerchants = await this.prisma.merchant.count({
      where: { 
        isApproved: false,
        isSuggestion: false, // Exclure les marchands suggérés
      },
    });
    if (unapprovedMerchants > 0) {
      tasks.push({
        id: 'unapproved-merchants',
        title: 'Commerçants non approuvés',
        description: `${unapprovedMerchants} commerçant(s) en attente d'approbation`,
        type: 'merchant',
        priority: 'medium',
        count: unapprovedMerchants,
        action: 'Approuver les commerçants',
        href: '/admin/merchants',
      });
    }

    // 6. Utilisateurs inactifs (dernière activité > 30 jours)
    const inactiveUsers = await this.prisma.user.count({
      where: {
        role: 'USER',
        lastSeen: { lt: thirtyDaysAgo },
      },
    });
    if (inactiveUsers > 0) {
      tasks.push({
        id: 'inactive-users',
        title: 'Utilisateurs inactifs',
        description: `${inactiveUsers} utilisateur(s) inactif(s) depuis plus de 30 jours`,
        type: 'user',
        priority: 'low',
        count: inactiveUsers,
        action: "Analyser l'inactivité",
        href: '/admin/users?tab=inactive',
      });
    }

    // 7. Messages non lus des utilisateurs
    const unreadMessages = await this.prisma.adminMessage.count({
      where: {
        senderId: { not: 'admin' },
        receiverId: 'admin',
        read: false,
      },
    });
    if (unreadMessages > 0) {
      tasks.push({
        id: 'unread-messages',
        title: 'Messages non lus',
        description: `${unreadMessages} message(s) non lu(s) des utilisateurs`,
        type: 'message',
        priority: 'high',
        count: unreadMessages,
        action: 'Répondre aux messages',
        href: '/admin/messages',
      });
    }

    return {
      tasks,
      totalTasks: tasks.length,
      urgentTasks: tasks.filter((t) => t.priority === 'high').length,
    };
  }

  /**
   * Marquer une tâche comme terminée
   */
  async markTaskAsCompleted(taskId: string) {
    // Pour l'instant, on simule la complétion
    // Dans une vraie implémentation, on pourrait stocker les tâches complétées en base
    return { success: true, taskId };
  }

  async getReferralStats() {
    const totalReferrals = await this.prisma.user.count({
      where: { referredById: { not: null } },
    });
    const pendingReferrals = 0;
    const completedReferrals = totalReferrals;
    const rewardedReferrals = await this.prisma.transaction.count({
      where: { type: 'bonus' },
    });
    const cancelledReferrals = 0;
    const totalRewardsAgg = await this.prisma.transaction.aggregate({
      _sum: { amount: true },
      where: { type: 'bonus' },
    });
    const totalRewards = totalRewardsAgg._sum.amount || 0;
    const conversionRate =
      totalReferrals > 0 ? (completedReferrals / totalReferrals) * 100 : 0;
    const topReferrersRaw = await this.prisma.user.findMany({
      where: { referrals: { some: {} } },
      select: {
        id: true,
        fullName: true,
        referrals: { select: { id: true } },
        wallet: { select: { id: true } },
      },
    });
    const topReferrers = await Promise.all(
      topReferrersRaw.map(async (user) => {
        let rewards = 0;
        if (user.wallet) {
          const agg = await this.prisma.transaction.aggregate({
            _sum: { amount: true },
            where: { type: 'bonus', receiverId: user.wallet.id },
          });
          rewards = agg._sum.amount || 0;
        }
        return {
          id: user.id,
          name: user.fullName,
          referrals: user.referrals.length,
          rewards,
        };
      }),
    );
    topReferrers.sort(
      (a, b) => b.referrals - a.referrals || b.rewards - a.rewards,
    );
    const top5 = topReferrers.slice(0, 5);
    return {
      totalReferrals,
      pendingReferrals,
      completedReferrals,
      rewardedReferrals,
      cancelledReferrals,
      totalRewards,
      conversionRate: Math.round(conversionRate * 10) / 10,
      topReferrers: top5,
    };
  }

  async getAllWithdrawals() {
    const requests = await this.prisma.withdrawalRequest.findMany({
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            email: true,
            username: true,
            wallet: { select: { balance: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Transformer la structure pour le frontend
    return requests.map((req) => ({
      id: req.id,
      amount: req.amount,
      status: req.status,
      createdAt: req.createdAt,
      updatedAt: req.updatedAt,
      rejectionReason: req.rejectionReason,
      bankDetails:
        req.bankDetails && typeof req.bankDetails === 'string'
          ? JSON.parse(req.bankDetails)
          : req.bankDetails || null,
      user: {
        id: req.user.id,
        fullName: req.user.fullName,
        email: req.user.email,
        username: req.user.username,
        wallet: {
          balance: req.user.wallet?.balance || 0,
        },
      },
    }));
  }

  async getPendingWithdrawals() {
    return this.prisma.withdrawalRequest.findMany({
      where: { status: 'PENDING' },
      include: {
        user: {
          select: {
            fullName: true,
            email: true,
            wallet: { select: { balance: true } },
          },
        },
      },
      orderBy: { createdAt: 'asc' },
    });
  }

  async approveWithdrawal(requestId: string) {
    return this.prisma.$transaction(async (tx) => {
      const request = await tx.withdrawalRequest.findUnique({
        where: { id: requestId },
        include: { user: { include: { wallet: true } } },
      });

      if (!request || request.status !== 'PENDING') {
        throw new NotFoundException('Demande non trouvée ou déjà traitée.');
      }
      if (!request.user.wallet) {
        throw new NotFoundException(
          'Portefeuille de l’utilisateur introuvable pour ce retrait.',
        );
      }

      // Calcul de la commission au moment de l'approbation
      const commission = await this.commissionsService.calculateCommission(
        'merchant_withdrawal',
        request.amount,
        AudienceRole.MERCHANT,
      );
      const totalToDeduct = request.amount + commission;

      if (request.user.wallet.balance < totalToDeduct) {
        throw new BadRequestException(
          "Solde de l'utilisateur insuffisant pour ce retrait.",
        );
      }

      // Débiter le wallet du marchand (montant + commission)
      await tx.wallet.update({
        where: { id: request.user.wallet.id },
        data: { balance: { decrement: totalToDeduct } },
      });

      // Créditer la commission au wallet admin
      if (commission > 0) {
        const adminWallet = await tx.wallet.findUnique({
          where: { userId: 'admin' },
        });
        if (adminWallet) {
          await tx.wallet.update({
            where: { id: adminWallet.id },
            data: { balance: { increment: commission } },
          });
        }
      }

      const updatedRequest = await tx.withdrawalRequest.update({
        where: { id: requestId },
        data: { status: 'APPROVED' },
      });

      // Créer une transaction pour l'historique de l'utilisateur
      await tx.transaction.create({
        data: {
          amount: request.amount,
          type: 'withdrawal',
          description: "Retrait approuvé par l'administration",
          senderId: request.user.wallet.id,
          receiverId: request.user.wallet.id,
          status: 'completed',
          commission,
        },
      });

      await tx.notification.create({
        data: {
          userId: request.userId,
          message: `Votre demande de retrait de ${request.amount} DZD a été approuvée.`,
        },
      });

      return updatedRequest;
    });
  }

  async rejectWithdrawal(requestId: string, reason: string) {
    const request = await this.prisma.withdrawalRequest.findUnique({
      where: { id: requestId },
    });
    if (!request || request.status !== 'PENDING') {
      throw new NotFoundException('Demande non trouvée ou déjà traitée.');
    }

    const updatedRequest = await this.prisma.withdrawalRequest.update({
      where: { id: requestId },
      data: { status: 'REJECTED', rejectionReason: reason },
    });

    await this.prisma.notification.create({
      data: {
        userId: request.userId,
        message: `Votre demande de retrait a été rejetée. Motif : ${reason}`,
      },
    });

    return updatedRequest;
  }

  // --- ✅ ACCOUNT STATUS MANAGEMENT ---
  /**
   * Met à jour le statut d'un utilisateur. Seules les valeurs autorisées sont
   * 'active', 'inactive', 'pending' et 'suspended'. Une erreur est levée
   * pour toute autre valeur. Le statut est stocké dans le champ `status` du
   * modèle User. Si le champ n'existe pas pour certains enregistrements,
   * Prisma le créera automatiquement. Cette méthode renvoie l'utilisateur
   * mis à jour avec son identifiant et son nouveau statut.
   */
  async updateUserStatus(id: string, status: string) {
    const allowed = ['active', 'inactive', 'pending', 'suspended'];
    if (!allowed.includes(status)) {
      throw new BadRequestException(
        `Statut utilisateur invalide. Valeurs autorisées : ${allowed.join(
          ', ',
        )}.`,
      );
    }
    // Vérifie l'existence de l'utilisateur
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) {
      throw new NotFoundException(`Utilisateur avec l'ID ${id} non trouvé.`);
    }
    return this.prisma.user.update({
      where: { id },
      data: { status },
      select: { id: true, status: true, email: true },
    });
  }

  /**
   * Met à jour le statut d'un commerçant. Les valeurs autorisées sont
   * 'active', 'inactive' et 'pending'. Le statut est stocké dans le champ
   * `status` du modèle Merchant. Cette méthode renvoie le commerçant mis à
   * jour avec son identifiant et son nouveau statut.
   */
  async updateMerchantStatus(id: string, status: string) {
    const allowed = ['active', 'inactive', 'pending'];
    if (!allowed.includes(status)) {
      throw new BadRequestException(
        `Statut commerçant invalide. Valeurs autorisées : ${allowed.join(
          ', ',
        )}.`,
      );
    }
    const merchant = await this.prisma.merchant.findUnique({ where: { id } });
    if (!merchant) {
      throw new NotFoundException(`Commerçant avec l'ID ${id} non trouvé.`);
    }
    return this.prisma.merchant.update({
      where: { id },
      data: { status },
      select: { id: true, status: true, name: true },
    });
  }

  async createManualRecharge(body: {
    phone: string;
    amount: number;
    reference?: string;
  }) {
    const { phone, amount, reference } = body;
    const user = await this.prisma.user.findUnique({
      where: { phoneNumber: phone },
    });
    if (!user) {
      throw new NotFoundException('Utilisateur non trouvé avec ce numéro.');
    }
    const wallet = await this.prisma.wallet.findUnique({
      where: { userId: user.id },
    });
    if (!wallet) {
      throw new NotFoundException('Wallet introuvable pour cet utilisateur.');
    }
    const recharge = await this.prisma.rechargeRequest.create({
      data: {
        receiverId: wallet.id,
        amount,
        reference: reference ?? '',
        status: 'APPROVED',
      },
    });
    await this.prisma.wallet.update({
      where: { id: wallet.id },
      data: { balance: { increment: amount } },
    });
    await this.prisma.transaction.create({
      data: {
        amount,
        type: 'recharge',
        description: 'Recharge libre (manuel)',
        receiverId: wallet.id,
        status: 'completed',
        reference: reference ?? '',
      },
    });
    return { success: true, rechargeId: recharge.id };
  }

  // ... (Le reste du fichier reste identique) ...
  async createCommissionRule(data: CreateCommissionRuleDto) {
    // Désactive les règles actives existantes pour la même action et le même public cible
    await this.prisma.commissionRule.updateMany({
      where: {
        action: data.action,
        isActive: true,
        target: data.target ?? 'USER',
      },
      data: {
        isActive: false,
      },
    });
    const target = data.target ?? 'USER';
    return this.prisma.commissionRule.create({
      data: {
        action: data.action,
        type: data.type,
        value: data.value,
        minAmount: data.minAmount,
        maxAmount: data.maxAmount,
        isActive: data.isActive ?? true,
        target,
      },
    });
  }

  async getCommissionRules(target?: 'USER' | 'MERCHANT') {
    const whereClause = target ? { target } : {};
    return this.prisma.commissionRule.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' },
    });
  }

  async updateCommissionRule(id: string, data: UpdateCommissionRuleDto) {
    const ruleToUpdate = await this.prisma.commissionRule.findUnique({
      where: { id },
    });
    if (!ruleToUpdate) {
      throw new NotFoundException(`Règle avec l'ID ${id} non trouvée.`);
    }

    if (data.isActive && !ruleToUpdate.isActive) {
      await this.prisma.commissionRule.updateMany({
        where: {
          action: ruleToUpdate.action,
          isActive: true,
          NOT: { id },
          target: data.target ?? ruleToUpdate.target ?? 'USER',
        },
        data: { isActive: false },
      });
    }
    return this.prisma.commissionRule.update({
      where: { id },
      data,
    });
  }

  async deleteCommissionRule(id: string) {
    return this.prisma.commissionRule.delete({ where: { id } });
  }

  // --- 📩 SUPPORT / TICKETS ---

  /**
   * Récupère toutes les demandes en attente. Actuellement, cette méthode
   * s'appuie sur la table `moneyRequest` de Prisma pour regrouper les
   * différentes requêtes (demandes de paiement ou autres). Les requêtes
   * retournées incluent les informations du demandeur et du payeur afin
   * d'afficher clairement l'origine et le destinataire de chaque demande.
   */
  async getAllRequests() {
    return this.prisma.moneyRequest.findMany({
      where: { status: 'pending' },
      include: {
        requester: {
          select: {
            fullName: true,
            username: true,
          },
        },
        payer: {
          select: {
            fullName: true,
            username: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Marque une demande comme résolue et notifie le demandeur. Si la demande
   * est déjà traitée, une exception sera levée. Le status est mis à
   * 'resolved' afin de la distinguer des réponses de paiement classiques.
   */
  async resolveRequest(requestId: string) {
    const request = await this.prisma.moneyRequest.findUnique({
      where: { id: requestId },
    });
    if (!request) {
      throw new NotFoundException('Demande non trouvée.');
    }
    if (request.status !== 'pending') {
      throw new ConflictException('Cette demande a déjà été traitée.');
    }
    const updated = await this.prisma.moneyRequest.update({
      where: { id: requestId },
      data: { status: 'resolved' },
    });
    // Envoyer une notification au demandeur
    await this.prisma.notification.create({
      data: {
        userId: request.requesterId,
        message:
          "Votre demande a été traitée par l'administration. Consultez vos notifications pour plus de détails.",
      },
    });
    return updated;
  }

  async createLevelRule(createLevelRuleDto: CreateLevelRuleDto) {
    // Assigner un rôle par défaut (USER) si non fourni
    const role = createLevelRuleDto.role ?? 'USER';

    // Vérifier s'il existe déjà une règle pour ce niveau ET ce rôle
    const existingLevel = await this.prisma.levelRule.findFirst({
      where: { level: createLevelRuleDto.level, role },
    });

    if (existingLevel) {
      throw new ConflictException(
        `Une règle pour le niveau ${createLevelRuleDto.level} existe déjà pour le rôle ${role}.`,
      );
    }

    try {
      return await this.prisma.levelRule.create({
        data: {
          ...createLevelRuleDto,
          role,
        },
      });
    } catch (err: any) {
      // Log the error to help debugging (will appear in backend logs)
      
      // Prisma unique constraint error (e.g., DB still has single-column unique)
      if (err?.code === 'P2002') {
        throw new ConflictException(
          `Une règle pour le niveau ${createLevelRuleDto.level} existe déjà (conflit en base).`,
        );
      }
      throw err;
    }
  }

  async getLevelRules(role?: 'USER' | 'MERCHANT') {
    const whereClause = role ? { role } : {};
    return this.prisma.levelRule.findMany({
      where: whereClause,
      orderBy: {
        level: 'asc',
      },
    });
  }

  async updateLevelRule(id: string, updateLevelRuleDto: UpdateLevelRuleDto) {
    try {
      return await this.prisma.levelRule.update({
        where: { id },
        data: updateLevelRuleDto,
      });
    } catch (err: any) {
      // Gérer proprement le conflit d'unicité (niveau + rôle)
      if (err?.code === 'P2002') {
        throw new ConflictException(
          "Une règle pour ce niveau existe déjà pour ce rôle. Modifiez le niveau ou supprimez d'abord l'autre règle.",
        );
      }
      throw err;
    }
  }

  async deleteLevelRule(id: string) {
    return this.prisma.levelRule.delete({
      where: { id },
    });
  }

  async getAllRecharges() {
    const requests = await this.prisma.rechargeRequest.findMany({
      include: {
        receiver: {
          include: {
            user: {
              select: {
                id: true,
                fullName: true,
                email: true,
                username: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Transformer la structure pour le frontend
    return requests.map((req) => ({
      id: req.id,
      amount: req.amount,
      reference: req.reference,
      status: req.status,
      createdAt: req.createdAt,
      updatedAt: req.updatedAt,
      rejectionReason: req.rejectionReason,
      proofUrl: req.proofUrl || null, // Temporaire jusqu'à la migration
      user: {
        id: req.receiver.user.id,
        fullName: req.receiver.user.fullName,
        email: req.receiver.user.email,
        username: req.receiver.user.username,
      },
    }));
  }

  async getPendingRecharges() {
    return this.prisma.rechargeRequest.findMany({
      where: {
        status: 'PENDING',
      },
      include: {
        receiver: {
          include: {
            user: {
              select: {
                fullName: true,
                email: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'asc',
      },
    });
  }

  async getDashboardStats() {
    try {
      // --- Périodes de temps ---
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
      const startOfLastMonth = new Date(
        today.getFullYear(),
        today.getMonth() - 1,
        1,
      );
      const sevenDaysAgo = new Date(today);
      sevenDaysAgo.setDate(today.getDate() - 7);
      const fourteenDaysAgo = new Date(today);
      fourteenDaysAgo.setDate(today.getDate() - 14);

      // --- Fonction de calcul de changement (plus robuste) ---
      const calculateChange = (current: number, previous: number) => {
        if (previous === 0) {
          return current > 0 ? 100 : 0; // Évite la division par zéro
        }
        return parseFloat((((current - previous) / previous) * 100).toFixed(1));
      };

      // --- Promesses pour les requêtes concurrentes ---
      const promises = {
        totalUsers: this.prisma.user.count({
          where: { role: { not: 'ADMIN' } },
        }),
        newUsersThisMonth: this.prisma.user.count({
          where: { createdAt: { gte: startOfMonth }, role: { not: 'ADMIN' } },
        }),
        newUsersLastMonth: this.prisma.user.count({
          where: {
            createdAt: { gte: startOfLastMonth, lt: startOfMonth },
            role: { not: 'ADMIN' },
          },
        }),

        activeUsersLast7Days: this.prisma.user.count({
          where: { lastSeen: { gte: sevenDaysAgo }, role: { not: 'ADMIN' } },
        }),
        activeUsersPrevious7Days: this.prisma.user.count({
          where: {
            lastSeen: { gte: fourteenDaysAgo, lt: sevenDaysAgo },
            role: { not: 'ADMIN' },
          },
        }),

        totalMerchants: this.prisma.merchant.count({
          where: { isSuggestion: false }, // Exclure les marchands suggérés
        }),
        newMerchantsThisMonth: this.prisma.merchant.count({
          where: { 
            isSuggestion: false, // Exclure les marchands suggérés
            createdAt: { gte: startOfMonth },
          },
        }),
        newMerchantsLastMonth: this.prisma.merchant.count({
          where: { 
            isSuggestion: false, // Exclure les marchands suggérés
            createdAt: { gte: startOfLastMonth, lt: startOfMonth },
          },
        }),

        pendingVerifications: this.prisma.identityVerification.count({
          where: { status: 'PENDING' },
        }),

        totalTransactions: this.prisma.transaction.count(),
        transactionsThisMonth: this.prisma.transaction.count({
          where: { createdAt: { gte: startOfMonth } },
        }),
        transactionsLastMonth: this.prisma.transaction.count({
          where: { createdAt: { gte: startOfLastMonth, lt: startOfMonth } },
        }),

        totalVolumeAgg: this.prisma.transaction.aggregate({
          _sum: { amount: true },
        }),
        volumeThisMonthAgg: this.prisma.transaction.aggregate({
          _sum: { amount: true },
          where: { createdAt: { gte: startOfMonth } },
        }),
        volumeLastMonthAgg: this.prisma.transaction.aggregate({
          _sum: { amount: true },
          where: { createdAt: { gte: startOfLastMonth, lt: startOfMonth } },
        }),
      };

      const results = await Promise.all(Object.values(promises));
      const [
        totalUsers,
        newUsersThisMonth,
        newUsersLastMonth,
        activeUsersLast7Days,
        activeUsersPrevious7Days,
        totalMerchants,
        newMerchantsThisMonth,
        newMerchantsLastMonth,
        pendingVerifications,
        totalTransactions,
        transactionsThisMonth,
        transactionsLastMonth,
        totalVolumeAgg,
        volumeThisMonthAgg,
        volumeLastMonthAgg,
      ] = results as any[];

      // --- Formatage des résultats ---
      return {
        totalUsers: {
          value: totalUsers,
          change: calculateChange(newUsersThisMonth, newUsersLastMonth),
        },
        activeUsers: {
          value: activeUsersLast7Days,
          change: calculateChange(
            activeUsersLast7Days,
            activeUsersPrevious7Days,
          ),
        },
        totalMerchants: {
          value: totalMerchants,
          change: calculateChange(newMerchantsThisMonth, newMerchantsLastMonth),
        },
        totalVolume: {
          value: totalVolumeAgg._sum.amount || 0,
          change: calculateChange(
            volumeThisMonthAgg._sum.amount || 0,
            volumeLastMonthAgg._sum.amount || 0,
          ),
        },
        totalTransactions: {
          value: totalTransactions,
          change: calculateChange(transactionsThisMonth, transactionsLastMonth),
        },
        pendingVerifications: { value: pendingVerifications },
      };
    } catch (error) {
      
      throw error;
    }
  }

  async getAllUsers() {
    // 1. Récupérer les IDs des marchands suggérés (qui ne sont pas encore inscrits)
    const suggestedMerchants = await this.prisma.merchant.findMany({
      where: { isSuggestion: true },
      select: { userId: true },
    });
    
    const suggestedMerchantUserIds = suggestedMerchants.map(m => m.userId);

    // 2. Récupérer les utilisateurs en excluant les marchands suggérés
    const users = await this.prisma.user.findMany({
      where: { 
        role: { not: 'ADMIN' },
        id: { notIn: suggestedMerchantUserIds }, // Exclure les marchands suggérés
      },
      select: {
        id: true,
        email: true,
        username: true,
        fullName: true,
        phoneNumber: true,
        role: true,
        createdAt: true,
        updatedAt: true,
        isVerified: true,
        lastSeen: true,
        status: true,
        profile: {
          select: {
            level: true,
            xp: true,
          },
        },
        wallet: {
          select: {
            _count: {
              select: {
                sentTransactions: true,
                receivedTransactions: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // 3. Retourner les utilisateurs avec le statut normalisé
    return users.map((user) => {
      const dbStatus = user.status as string | null | undefined;
      
      if (dbStatus) {
        return {
          ...user,
          status: dbStatus.toLowerCase(),
        };
      }
      return user;
    });
  }

  async getAllMerchants() {
    try {
      return await this.prisma.merchant.findMany({
        where: {
          isSuggestion: false,
        },
        select: {
          id: true,
          name: true,
          address: true,
          category: true,
          latitude: true,
          longitude: true,
          status: true,
          totalRevenue: true,
          updatedAt: true,
          description: true,
          user: {
            select: {
              email: true,
            },
          },
        },
      });
    } catch (error) {
      
      throw error;
    }
  }

  async getMerchantsRevenueStats() {
    try {
      const merchants = await this.prisma.merchant.findMany({
        where: {
          isSuggestion: false,
        },
        select: {
          id: true,
          name: true,
          category: true,
          latitude: true,
          longitude: true,
          address: true,
          user: {
            select: {
              id: true,
              wallet: {
                select: {
                  id: true,
                },
              },
            },
          },
        },
      });

      // Calculer les revenus réels pour chaque commerçant
      const merchantsWithRevenue = await Promise.all(
        merchants.map(async (merchant) => {
          if (!merchant.user?.wallet?.id) {
            return {
              ...merchant,
              revenue: 0,
              transactionCount: 0,
            };
          }

          // Récupérer toutes les transactions REÇUES par ce commerçant
          const transactions = await this.prisma.transaction.findMany({
            where: {
              receiverId: merchant.user.wallet.id,
              // Optionnel : filtrer par statut si vous avez ce champ
              // status: 'COMPLETED'
            },
            select: {
              amount: true,
            },
          });

          const revenue = transactions.reduce((sum, tx) => sum + tx.amount, 0);

          return {
            id: merchant.id,
            name: merchant.name,
            category: merchant.category,
            latitude: merchant.latitude,
            longitude: merchant.longitude,
            address: merchant.address,
            revenue: revenue,
            transactionCount: transactions.length,
          };
        }),
      );

      // Calculer les statistiques globales
      const totalRevenue = merchantsWithRevenue.reduce(
        (sum, m) => sum + m.revenue,
        0,
      );
      const averageRevenue =
        merchantsWithRevenue.length > 0
          ? totalRevenue / merchantsWithRevenue.length
          : 0;

      return {
        merchants: merchantsWithRevenue,
        stats: {
          totalRevenue,
          averageRevenue,
          totalMerchants: merchantsWithRevenue.length,
          merchantsWithRevenue: merchantsWithRevenue.filter((m) => m.revenue > 0)
            .length,
        },
      };
    } catch (error) {
      
      throw error;
    }
  }

  async approveRecharge(rechargeId: string) {
    const request = await this.prisma.rechargeRequest.findUnique({
      where: { id: rechargeId },
      include: { receiver: true },
    });

    if (!request || request.status !== 'PENDING') {
      throw new NotFoundException(
        `Demande de recharge non trouvée ou déjà traitée.`,
      );
    }

    return this.prisma.$transaction(async (tx) => {
      const xpGained =
        await this.gamificationService.calculateXpForTransaction('recharge');

      if (xpGained > 0) {
        await this.gamificationService.getProfile(request.receiver.userId);
        await tx.userProfile.update({
          where: { userId: request.receiver.userId },
          data: { xp: { increment: xpGained } },
        });
      }

      await tx.wallet.update({
        where: { id: request.receiverId },
        data: { balance: { increment: request.amount } },
      });

      await tx.transaction.create({
        data: {
          amount: request.amount,
          type: 'recharge',
          description: `Recharge approuvée (Ref: ${request.reference})`,
          receiverId: request.receiverId,
          status: 'completed',
          reference: request.reference,
          xpGained: xpGained,
        },
      });

      const updatedRequest = await tx.rechargeRequest.update({
        where: { id: rechargeId },
        data: { status: 'APPROVED' },
      });

      await tx.notification.create({
        data: {
          userId: request.receiver.userId,
          message: `Votre demande de recharge de ${request.amount} DZD a été approuvée et vous avez gagné ${xpGained} points !`,
        },
      });

      return updatedRequest;
    });
  }

  async getGamificationStats() {
    const totalUsers = await this.prisma.user.count({
      where: { role: { not: 'ADMIN' } },
    });
    const activeRules = await this.prisma.xpRule.count({
      where: { isActive: true },
    });
    const userProfiles = await this.prisma.userProfile.findMany();

    const totalXPAwarded = userProfiles.reduce(
      (sum, profile) => sum + profile.xp,
      0,
    );
    const avgLevel =
      userProfiles.length > 0
        ? userProfiles.reduce((sum, profile) => sum + profile.level, 0) /
          userProfiles.length
        : 0;

    return {
      totalUsers,
      totalXPAwarded,
      activeRules,
      avgLevel,
    };
  }

  async getGamificationLevels() {
    return this.prisma.levelRule.findMany({
      orderBy: {
        level: 'asc',
      },
    });
  }

  async getUserProgressions() {
    const levelRules = await this.prisma.levelRule.findMany({
      orderBy: { level: 'asc' },
    });

    if (levelRules.length === 0) {
      return [];
    }

    const users = await this.prisma.user.findMany({
      where: { role: { not: 'ADMIN' } },
      include: {
        profile: true,
      },
    });

    return users
      .map((user) => {
        const profile = user.profile;
        if (!profile) return null;

        const currentLevelRule = levelRules.find(
          (rule) => rule.level === profile.level,
        );
        const nextLevelRule = levelRules.find(
          (rule) => rule.level === profile.level + 1,
        );

        const currentLevelXP = currentLevelRule
          ? currentLevelRule.xpRequired
          : 0;
        let xpToNextLevel = 0;
        let progressPercentage = 100;

        if (nextLevelRule) {
          const nextLevelXP = nextLevelRule.xpRequired;
          const totalXpForThisLevel = nextLevelXP - currentLevelXP;
          const xpInCurrentLevel = profile.xp - currentLevelXP;

          xpToNextLevel = nextLevelXP - profile.xp;
          if (totalXpForThisLevel > 0) {
            progressPercentage = Math.floor(
              (xpInCurrentLevel / totalXpForThisLevel) * 100,
            );
          }
        }

        return {
          id: user.id,
          username: user.username,
          currentLevel: profile.level,
          totalXP: profile.xp,
          xpToNextLevel: Math.max(0, xpToNextLevel),
          progressPercentage: Math.min(100, Math.max(0, progressPercentage)),
          lastActive:
            user.lastSeen?.toISOString() || user.updatedAt.toISOString(),
        };
      })
      .filter(Boolean);
  }

  /**
   * Récupère des statistiques globales par utilisateur pour l'administration.
   * Chaque entrée contient l'utilisateur et des agrégats sur ses transactions.
   *
   * - totalSent : Somme des montants envoyés (où l'utilisateur est l'expéditeur).
   * - totalReceived : Somme des montants reçus (où l'utilisateur est le destinataire).
   * - transactionCount : Nombre total de transactions impliquant l'utilisateur.
   *
   * Les administrateurs peuvent ainsi visualiser l'activité financière de chaque client.
   */
  async getUserStats() {
    // On récupère tous les utilisateurs non administrateurs avec leur portefeuille
    const users = await this.prisma.user.findMany({
      where: { role: { not: 'ADMIN' } },
      select: {
        id: true,
        fullName: true,
        email: true,
        phoneNumber: true,
        role: true,
        wallet: { select: { id: true } },
      },
    });

    // Pour chaque utilisateur on calcule les agrégats sur les transactions
    const stats = await Promise.all(
      users.map(async (user) => {
        const walletId = user.wallet?.id;
        let totalSent = 0;
        let totalReceived = 0;
        let transactionCount = 0;

        if (walletId) {
          // Agrégat pour les transactions envoyées
          const sentAgg = await this.prisma.transaction.aggregate({
            _sum: { amount: true },
            _count: { id: true },
            where: { senderId: walletId },
          });
          // Agrégat pour les transactions reçues
          const recvAgg = await this.prisma.transaction.aggregate({
            _sum: { amount: true },
            _count: { id: true },
            where: { receiverId: walletId },
          });
          totalSent = sentAgg._sum.amount || 0;
          totalReceived = recvAgg._sum.amount || 0;
          transactionCount =
            (sentAgg._count.id ?? 0) + (recvAgg._count.id ?? 0);
        }

        return {
          id: user.id,
          fullName: user.fullName,
          email: user.email,
          phoneNumber: user.phoneNumber,
          role: user.role,
          totalSent,
          totalReceived,
          transactionCount,
        };
      }),
    );

    return stats;
  }

  /**
   * Retourne la liste de toutes les transactions de la plateforme avec les informations
   * sur l'expéditeur et le destinataire. Les transactions sont triées par date décroissante.
   * Ce point d'entrée est réservé à l'interface d'administration.
   */
  async getAllTransactions() {
    const transactions = await this.prisma.transaction.findMany({
      select: {
        id: true,
        amount: true,
        type: true,
        status: true,
        description: true,
        createdAt: true,
        sender: {
          select: {
            user: { select: { fullName: true, email: true } },
          },
        },
        receiver: {
          select: {
            user: { select: { fullName: true, email: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return transactions.map((t) => ({
      id: t.id,
      amount: t.amount,
      type: t.type,
      status: t.status || 'completed',
      createdAt:
        t.createdAt instanceof Date ? t.createdAt.toISOString() : t.createdAt,
      senderName: t.sender?.user?.fullName || null,
      senderEmail: t.sender?.user?.email || null,
      receiverName: t.receiver?.user?.fullName || null,
      receiverEmail: t.receiver?.user?.email || null,
      description: t.description || null,
    }));
  }

  /**
   * Récupère le bilan comptable complet d'un utilisateur
   * avec toutes ses transactions détaillées
   */
  async getUserBalance(userId: string) {
    // 1. Récupérer l'utilisateur et son wallet
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        wallet: true,
      },
    });

    if (!user) {
      throw new NotFoundException(`Utilisateur avec l'ID ${userId} introuvable.`);
    }

    if (!user.wallet) {
      throw new NotFoundException(`L'utilisateur ${userId} n'a pas de wallet.`);
    }

    const walletId = user.wallet.id;

    // 2. Récupérer toutes les transactions envoyées
    const sentTransactions = await this.prisma.transaction.findMany({
      where: { senderId: walletId },
      include: {
        receiver: {
          select: {
            user: { select: { fullName: true, email: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // 3. Récupérer toutes les transactions reçues
    const receivedTransactions = await this.prisma.transaction.findMany({
      where: { receiverId: walletId },
      include: {
        sender: {
          select: {
            user: { select: { fullName: true, email: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // 4. Calculer les totaux
    const totalSent = sentTransactions.reduce((sum, tx) => sum + tx.amount, 0);
    const totalReceived = receivedTransactions.reduce((sum, tx) => sum + tx.amount, 0);
    const transactionCount = sentTransactions.length + receivedTransactions.length;
    const balance = totalReceived - totalSent;
    const averageTransaction = transactionCount > 0 ? (totalSent + totalReceived) / transactionCount : 0;

    // 5. Formater toutes les transactions
    const allTransactions = [
      ...sentTransactions.map(tx => ({
        id: tx.id,
        amount: tx.amount,
        createdAt: tx.createdAt instanceof Date ? tx.createdAt.toISOString() : tx.createdAt,
        status: (tx as any).status || 'completed',
        type: 'sent' as const,
        otherParty: {
          fullName: tx.receiver?.user?.fullName || 'Inconnu',
          email: tx.receiver?.user?.email || '',
        },
      })),
      ...receivedTransactions.map(tx => ({
        id: tx.id,
        amount: tx.amount,
        createdAt: tx.createdAt instanceof Date ? tx.createdAt.toISOString() : tx.createdAt,
        status: (tx as any).status || 'completed',
        type: 'received' as const,
        otherParty: {
          fullName: tx.sender?.user?.fullName || 'Inconnu',
          email: tx.sender?.user?.email || '',
        },
      })),
    ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    // 6. Retourner le bilan complet
    return {
      client: {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        phoneNumber: user.phoneNumber,
        createdAt: user.createdAt instanceof Date ? user.createdAt.toISOString() : user.createdAt,
      },
      summary: {
        totalSent: parseFloat(totalSent.toFixed(2)),
        totalReceived: parseFloat(totalReceived.toFixed(2)),
        transactionCount,
        balance: parseFloat(balance.toFixed(2)),
        averageTransaction: parseFloat(averageTransaction.toFixed(2)),
      },
      transactions: allTransactions,
    };
  }

  /**
   * Récupère toutes les transactions d'un utilisateur spécifique
   */
  async getUserTransactions(userId: string) {
    // Récupérer l'utilisateur et son wallet
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { wallet: true },
    });

    if (!user) {
      throw new NotFoundException(`Utilisateur avec l'ID ${userId} introuvable.`);
    }

    if (!user.wallet) {
      return []; // Pas de wallet = pas de transactions
    }

    const walletId = user.wallet.id;

    // Récupérer toutes les transactions (envoyées et reçues)
    const [sentTransactions, receivedTransactions] = await Promise.all([
      this.prisma.transaction.findMany({
        where: { senderId: walletId },
        include: {
          receiver: {
            select: {
              user: { select: { fullName: true, email: true } },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        take: 50, // Limiter à 50 transactions
      }),
      this.prisma.transaction.findMany({
        where: { receiverId: walletId },
        include: {
          sender: {
            select: {
              user: { select: { fullName: true, email: true } },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        take: 50, // Limiter à 50 transactions
      }),
    ]);

    // Formater et combiner les transactions
    const allTransactions = [
      ...sentTransactions.map(tx => ({
        id: tx.id,
        amount: -tx.amount, // Négatif pour les envois
        createdAt: tx.createdAt,
        status: (tx as any).status || 'completed',
        type: 'Envoi',
        otherParty: tx.receiver?.user?.fullName || 'Inconnu',
      })),
      ...receivedTransactions.map(tx => ({
        id: tx.id,
        amount: tx.amount, // Positif pour les réceptions
        createdAt: tx.createdAt,
        status: (tx as any).status || 'completed',
        type: 'Réception',
        otherParty: tx.sender?.user?.fullName || 'Inconnu',
      })),
    ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return allTransactions;
  }

  /**
   * Récupère les données des zones d'activité intense (hot zones)
   */
  async getHotZones(timeRange?: string) {
    // Calculer la plage de dates selon le timeRange
    const now = new Date();
    let startDate: Date;

    switch (timeRange) {
      case '1h':
        startDate = new Date(now.getTime() - 60 * 60 * 1000);
        break;
      case '6h':
        startDate = new Date(now.getTime() - 6 * 60 * 60 * 1000);
        break;
      case '24h':
        startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        break;
      case '7d':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000); // Par défaut 24h
    }

    // Liste des wilayas algériennes pour la simulation
    const wilayasAlgeriennes = [
      'Alger', 'Oran', 'Constantine', 'Annaba', 'Blida', 'Batna', 'Sétif', 'Sidi Bel Abbès',
      'Biskra', 'Tlemcen', 'Béjaïa', 'Tébessa', 'Tizi Ouzou', 'Tiaret', 'Jijel', 'Saïda',
      'Skikda', 'Mostaganem', 'El Oued', 'Bordj Bou Arréridj', 'Médéa', 'Bouira', 'Mascara', 'Ouargla'
    ];

    // Récupérer tous les utilisateurs avec leur adresse
    const users = await this.prisma.user.findMany({
      where: { role: { not: 'ADMIN' } },
      include: {
        wallet: true,
      },
    });

    // Si pas assez d'utilisateurs, simuler des données
    const shouldSimulate = users.length < 10;

    // Regrouper les données par wilaya
    const zoneStats: Record<string, any> = {};

    if (shouldSimulate) {
      // Mode simulation : créer des données pour les principales wilayas
      const mainWilayas = ['Alger', 'Oran', 'Constantine', 'Annaba', 'Blida', 'Sétif', 'Tlemcen', 'Batna'];
      
      mainWilayas.forEach((wilaya, index) => {
        const baseUsers = 1000 + Math.floor(Math.random() * 5000);
        const avgTransactionsPerUser = 3 + Math.random() * 7;
        const avgRevenuePerTransaction = 500 + Math.random() * 2000;
        
        zoneStats[wilaya] = {
          users: Math.floor(baseUsers * (1 - index * 0.15)),
          transactions: Math.floor(baseUsers * avgTransactionsPerUser * (1 - index * 0.15)),
          revenue: Math.floor(baseUsers * avgTransactionsPerUser * avgRevenuePerTransaction * (1 - index * 0.15)),
          userList: [],
        };
      });
    } else {
      // Mode réel : utiliser les vraies données
      for (const user of users) {
        // Extraire la wilaya de l'adresse ou assigner aléatoirement une wilaya algérienne
        let wilaya = 'Non spécifié';
        if (user.address) {
          wilaya = user.address.split(',').pop()?.trim() || wilayasAlgeriennes[Math.floor(Math.random() * wilayasAlgeriennes.length)];
        } else {
          // Si pas d'adresse, assigner aléatoirement une wilaya algérienne
          wilaya = wilayasAlgeriennes[Math.floor(Math.random() * wilayasAlgeriennes.length)];
        }
      
      if (!zoneStats[wilaya]) {
        zoneStats[wilaya] = {
          users: 0,
          transactions: 0,
          revenue: 0,
          userList: [],
        };
      }

      zoneStats[wilaya].users++;
      zoneStats[wilaya].userList.push(user.id);

      if (user.wallet) {
        // Compter les transactions
        const transactionCount = await this.prisma.transaction.count({
          where: {
            OR: [
              { senderId: user.wallet.id },
              { receiverId: user.wallet.id },
            ],
            createdAt: { gte: startDate },
          },
        });

        // Calculer le revenu
        const revenueAgg = await this.prisma.transaction.aggregate({
          _sum: { amount: true },
          where: {
            OR: [
              { senderId: user.wallet.id },
              { receiverId: user.wallet.id },
            ],
            createdAt: { gte: startDate },
          },
        });

          zoneStats[wilaya].transactions += transactionCount;
          zoneStats[wilaya].revenue += revenueAgg._sum.amount || 0;
        }
      }
    }

    // Formater les résultats
    const hotZones = Object.entries(zoneStats)
      .map(([wilaya, stats]: [string, any], index) => {
        const intensity = Math.min(100, Math.round((stats.transactions / Math.max(stats.users, 1)) * 2));
        const growth = (Math.random() * 30 - 5); // Variation simulée
        
        return {
          id: `zone_${index}`,
          name: `Zone ${wilaya}`,
          location: wilaya,
          intensity,
          users: stats.users,
          transactions: stats.transactions,
          revenue: parseFloat(stats.revenue.toFixed(2)),
          growth: parseFloat(growth.toFixed(1)),
          peakHours: '14h-16h', // À calculer avec les vraies données
          duration: Math.round((stats.transactions / Math.max(stats.users, 1)) * 10) / 10,
          trend: growth > 5 ? 'up' : growth < -5 ? 'down' : 'stable',
          risk: intensity > 80 ? 'low' : intensity > 60 ? 'medium' : 'high',
        };
      })
      .sort((a, b) => b.intensity - a.intensity);

    // Calculer les time slots (activité par heure)
    const hours = Array.from({ length: 12 }, (_, i) => i * 2);
    const timeSlots = hours.map(hour => {
      const hourStr = `${hour.toString().padStart(2, '0')}h`;
      const activity = Math.random() * 100; // À calculer avec les vraies heures de transaction
      const zones = Math.round(Math.random() * 18);
      
      return {
        hour: hourStr,
        activity: Math.round(activity),
        zones,
        peak: activity > 70,
      };
    });

    // Générer des alertes basées sur les données réelles
    const alerts = hotZones
      .filter(zone => zone.intensity > 90 || zone.growth > 20 || zone.growth < -20)
      .slice(0, 3)
      .map(zone => ({
        id: zone.id,
        zone: zone.name,
        type: zone.intensity > 90 ? 'spike' : zone.growth < -20 ? 'drop' : 'anomaly',
        severity: zone.intensity > 95 ? 'high' : 'medium',
        message: zone.intensity > 90 
          ? `Pic d'activité inhabituel détecté (+${zone.intensity}%)`
          : zone.growth < -20
          ? `Chute significative d'activité (${zone.growth}% vs moyenne)`
          : 'Pattern d\'utilisation inhabituel détecté',
        timestamp: new Date().toISOString(),
        actions: ['Vérifier capacité serveur', 'Alerter équipe support', 'Monitorer performances'],
      }));

    return {
      hotZones,
      timeSlots,
      alerts,
      summary: {
        activeZones: hotZones.filter(z => z.intensity > 60).length,
        averageIntensity: Math.round(hotZones.reduce((sum, z) => sum + z.intensity, 0) / hotZones.length),
        averageDuration: (hotZones.reduce((sum, z) => sum + z.duration, 0) / hotZones.length).toFixed(1),
        alertsCount: alerts.length,
      },
    };
  }

  /**
   * Récupère les données pour la carte interactive
   */
  async getInteractiveMap() {
    // Liste des wilayas algériennes
    const wilayasAlgeriennes = [
      'Alger', 'Oran', 'Constantine', 'Annaba', 'Blida', 'Batna', 'Sétif', 'Sidi Bel Abbès',
      'Biskra', 'Tlemcen', 'Béjaïa', 'Tébessa', 'Tizi Ouzou', 'Tiaret', 'Jijel', 'Saïda',
      'Skikda', 'Mostaganem', 'El Oued', 'Bordj Bou Arréridj', 'Médéa', 'Bouira', 'Mascara', 'Ouargla'
    ];

    // Récupérer tous les utilisateurs avec leur adresse
    const users = await this.prisma.user.findMany({
      where: { role: { not: 'ADMIN' } },
      include: {
        wallet: true,
      },
    });

    // Si pas assez d'utilisateurs, simuler des données
    const shouldSimulate = users.length < 10;

    // Regrouper par wilaya
    const regionStats: Record<string, any> = {};

    if (shouldSimulate) {
      // Mode simulation : créer des données pour toutes les wilayas
      wilayasAlgeriennes.forEach((wilaya, index) => {
        const baseUsers = 500 + Math.floor(Math.random() * 3000);
        const avgTransactionsPerUser = 2 + Math.random() * 8;
        const avgRevenuePerTransaction = 300 + Math.random() * 1500;
        
        regionStats[wilaya] = {
          users: Math.floor(baseUsers * (1 - index * 0.03)),
          transactions: Math.floor(baseUsers * avgTransactionsPerUser * (1 - index * 0.03)),
          revenue: Math.floor(baseUsers * avgTransactionsPerUser * avgRevenuePerTransaction * (1 - index * 0.03)),
        };
      });
    } else {
      // Mode réel : utiliser les vraies données
      for (const user of users) {
        // Extraire la wilaya de l'adresse ou assigner aléatoirement
        let wilaya = 'Non spécifié';
        if (user.address) {
          wilaya = user.address.split(',').pop()?.trim() || wilayasAlgeriennes[Math.floor(Math.random() * wilayasAlgeriennes.length)];
        } else {
          wilaya = wilayasAlgeriennes[Math.floor(Math.random() * wilayasAlgeriennes.length)];
        }
      
      if (!regionStats[wilaya]) {
        regionStats[wilaya] = {
          users: 0,
          transactions: 0,
          revenue: 0,
        };
      }

      regionStats[wilaya].users++;

      if (user.wallet) {
        const transactionCount = await this.prisma.transaction.count({
          where: {
            OR: [
              { senderId: user.wallet.id },
              { receiverId: user.wallet.id },
            ],
          },
        });

        const revenueAgg = await this.prisma.transaction.aggregate({
          _sum: { amount: true },
          where: {
            OR: [
              { senderId: user.wallet.id },
              { receiverId: user.wallet.id },
            ],
          },
        });

        regionStats[wilaya].transactions += transactionCount;
        regionStats[wilaya].revenue += revenueAgg._sum.amount || 0;
      }
      }
    }

    // Formater les régions
    const regionsData = Object.entries(regionStats).map(([wilaya, stats]: [string, any], index) => {
      const growth = Math.random() * 25;
      const activity = stats.transactions > stats.users * 10 ? 'high' : 
                      stats.transactions > stats.users * 5 ? 'medium' : 'low';
      
      return {
        id: wilaya.toLowerCase().replace(/\s+/g, '_'),
        name: wilaya,
        users: stats.users,
        transactions: stats.transactions,
        revenue: parseFloat(stats.revenue.toFixed(2)),
        growth: parseFloat(growth.toFixed(1)),
        activity,
        coordinates: [36 + Math.random() * 2, 3 + Math.random() * 5] as [number, number], // Coordonnées algériennes approximatives
      };
    }).sort((a, b) => b.users - a.users);

    // Créer le heatmap
    const heatmapData = regionsData.map(region => {
      const maxUsers = Math.max(...regionsData.map(r => r.users));
      const intensity = Math.round((region.users / maxUsers) * 100);
      const color = intensity >= 80 ? '#DC2626' :
                   intensity >= 60 ? '#EA580C' :
                   intensity >= 40 ? '#F59E0B' :
                   intensity >= 20 ? '#EAB308' : '#22C55E';
      
      return {
        region: region.name,
        intensity,
        color,
        users: region.users,
        transactions: region.transactions,
      };
    });

    return {
      regionsData,
      heatmapData,
      summary: {
        totalUsers: regionsData.reduce((sum, r) => sum + r.users, 0),
        totalTransactions: regionsData.reduce((sum, r) => sum + r.transactions, 0),
        totalRevenue: regionsData.reduce((sum, r) => sum + r.revenue, 0),
        activeRegions: regionsData.filter(r => r.activity !== 'low').length,
      },
    };
  }

  async rejectRecharge(rechargeId: string, rejectionReason: string) {
    const request = await this.prisma.rechargeRequest.findUnique({
      where: { id: rechargeId },
      include: { receiver: true },
    });

    if (!request || request.status !== 'PENDING') {
      throw new NotFoundException(
        `La demande de recharge avec l'ID ${rechargeId} n'a pas été trouvée ou n'est pas en attente.`,
      );
    }

    return this.prisma.$transaction(async (tx) => {
      await tx.notification.create({
        data: {
          userId: request.receiver.userId,
          message: `Votre demande de recharge a été rejetée. Motif : ${rejectionReason}`,
        },
      });

      await tx.transaction.create({
        data: {
          amount: request.amount,
          type: 'recharge',
          description: `Recharge refusée (Motif: ${rejectionReason || 'Aucun'})`,
          receiverId: request.receiver.userId,
          status: 'rejected',
          reference: request.reference,
        },
      });

      return tx.rechargeRequest.update({
        where: { id: rechargeId },
        data: {
          status: 'REJECTED',
          rejectionReason: rejectionReason,
        },
      });
    });
  }

  async searchUsers(query: string, role?: 'USER' | 'MERCHANT') {
    if (!query || query.trim().length < 2) {
      return [];
    }
    
    const whereClause: any = {
      OR: [
        { username: { contains: query, mode: 'insensitive' } },
        { fullName: { contains: query, mode: 'insensitive' } },
      ],
    };
    
    // Ajouter le filtre de rôle si spécifié
    if (role) {
      whereClause.role = role;
    }
    
    return this.prisma.user.findMany({
      where: whereClause,
      select: {
        id: true,
        username: true,
        fullName: true,
        role: true,
      },
      take: 10,
    });
  }

  async sendNotification(createNotificationDto: CreateNotificationDto) {
    const { message, target, username, emoji } = createNotificationDto;

    if (target === 'single') {
      if (!username) {
        throw new BadRequestException(
          "Le nom d'utilisateur est requis pour un envoi unique.",
        );
      }

      const user = await this.prisma.user.findUnique({
        where: { username },
      });

      if (!user) {
        throw new NotFoundException(
          `L'utilisateur "${username}" n'a pas été trouvé.`,
        );
      }

      await this.prisma.notification.create({
        data: { 
          message, 
          userId: user.id,
          emoji: emoji || '🔔',
        },
      });
      return {
        status: 'success',
        message: `Notification envoyée à ${user.username}.`,
      };
    }
    
    // Notifications groupées (all, users, merchants)
    if (target === 'all' || target === 'users' || target === 'merchants') {
      let whereClause = {};
      
      if (target === 'users') {
        // Seulement les clients (role USER)
        whereClause = { role: 'USER' };
      } else if (target === 'merchants') {
        // Seulement les marchands (role MERCHANT)
        whereClause = { role: 'MERCHANT' };
      }
      // Si target === 'all', whereClause reste vide (tous les utilisateurs)
      
      const targetUsers = await this.prisma.user.findMany({
        where: whereClause,
        select: { id: true },
      });

      if (targetUsers.length === 0) {
        return { status: 'info', message: 'Aucun utilisateur à notifier.' };
      }

      const notificationData = targetUsers.map((user) => ({
        message,
        userId: user.id,
        emoji: emoji || '🔔',
      }));

      const targetLabel = 
        target === 'users' ? 'clients' : 
        target === 'merchants' ? 'marchands' : 
        'utilisateurs';

      

      const result = await this.prisma.notification.createMany({
        data: notificationData,
      });

      return {
        status: 'success',
        message: `Notification envoyée à ${result.count} utilisateurs.`,
      };
    }
  }

  async createMission(createMissionDto: CreateMissionDto) {
    // ✨ CORRECTION : Assurer que le rôle est défini (par défaut USER)
    const dataToCreate = {
      ...createMissionDto,
      role: createMissionDto.role || AudienceRole.USER, // Défaut à USER si non fourni
    };

    return this.prisma.mission.create({
      data: dataToCreate,
    });
  }

  // ✨ CORRECTION : Modifier getAllMissions pour filtrer par rôle
  async getAllMissions(role?: AudienceRole) {
    const whereClause = role ? { role } : {}; // Filtre si le rôle est fourni

    return this.prisma.mission.findMany({
      where: whereClause, // Applique le filtre
      orderBy: { createdAt: 'desc' },
    });
  }

  async updateMission(id: string, data: Partial<CreateMissionDto>) {
    return this.prisma.mission.update({
      where: { id },
      data,
    });
  }

  async deleteMission(id: string) {
    await this.prisma.userMission.deleteMany({
      where: { missionId: id },
    });
    return this.prisma.mission.delete({
      where: { id },
    });
  }

  async getMerchantDetails(merchantId: string) {
    try {
      // Vérifier si l'ID est valide
      if (!merchantId) {
        throw new Error('ID du commerçant requis');
      }

      // Vérifier si l'ID est un UUID valide (éviter les appels avec des IDs comme "suggestions")
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
      if (!uuidRegex.test(merchantId)) {
        throw new Error(`ID "${merchantId}" invalide. Format UUID requis.`);
      }

      const merchant = await this.prisma.merchant.findUnique({
        where: { id: merchantId },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              fullName: true,
              phoneNumber: true,
              createdAt: true,
              updatedAt: true,
              profile: {
                select: {
                  level: true,
                  xp: true,
                },
              },
              wallet: {
                select: {
                  balance: true,
                  _count: {
                    select: {
                      sentTransactions: true,
                      receivedTransactions: true,
                    },
                  },
                },
              },
            },
          },
        },
      });

      if (!merchant) {
        throw new Error(`Commerçant avec l'ID ${merchantId} non trouvé`);
      }
      
      

      // Retourner dans le format attendu par le frontend
      return {
        id: merchant.id,
        name: merchant.name,
        status: merchant.status as "active" | "inactive" | "pending",
        createdAt: merchant.createdAt.toISOString(),
        updatedAt: merchant.updatedAt.toISOString(),
        user: {
          id: merchant.user.id,
          email: merchant.user.email,
          fullName: merchant.user.fullName,
          phoneNumber: merchant.user.phoneNumber || '',
          createdAt: merchant.user.createdAt.toISOString(),
        },
        wallet: merchant.user.wallet ? {
          balance: merchant.user.wallet.balance,
          _count: merchant.user.wallet._count,
        } : undefined,
      };
    } catch (error) {
      
      throw error;
    }
  }

  async createXpRule(createXpRuleDto: CreateXpRuleDto) {
    const role = createXpRuleDto.role ?? 'USER';

    const existingRule = await this.prisma.xpRule.findFirst({
      where: { action: createXpRuleDto.action, role },
    });

    if (existingRule) {
      throw new ConflictException(
        `Une règle pour l'action "${createXpRuleDto.action}" existe déjà pour le rôle ${role}.`,
      );
    }

    try {
      return await this.prisma.xpRule.create({
        data: {
          ...createXpRuleDto,
          role,
        },
      });
    } catch (err: any) {
      if (err?.code === 'P2002') {
        throw new ConflictException(
          `Une règle pour l'action "${createXpRuleDto.action}" existe déjà (conflit en base).`,
        );
      }
      throw err;
    }
  }

  async getXpRules(role?: 'USER' | 'MERCHANT') {
    // Si un rôle est spécifié, on filtre les règles selon ce rôle.
    const whereClause = role ? { role } : {};
    return this.prisma.xpRule.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' },
    });
  }

  async updateXpRule(id: string, updateXpRuleDto: UpdateXpRuleDto) {
    // If action or role are updated, ensure uniqueness for (action, role)
    if (updateXpRuleDto.action || updateXpRuleDto.role) {
      const existing = await this.prisma.xpRule.findFirst({
        where: {
          action: updateXpRuleDto.action ?? undefined,
          role: updateXpRuleDto.role ?? undefined,
          AND: {
            id: { not: id },
          },
        },
      });
      if (existing) {
        throw new ConflictException(
          `Une règle pour l'action "${updateXpRuleDto.action}" existe déjà pour le rôle ${updateXpRuleDto.role}.`,
        );
      }
    }

    return this.prisma.xpRule.update({
      where: { id },
      data: updateXpRuleDto,
    });
  }

  async deleteXpRule(id: string) {
    return this.prisma.xpRule.delete({
      where: { id },
    });
  }

  async getAllReferrals() {
    const referrals = await this.prisma.user.findMany({
      where: { referredById: { not: null } },
      select: {
        id: true,
        fullName: true,
        email: true,
        referralCode: true,
        createdAt: true,
        role: true,
        wallet: {
          select: {
            id: true,
            balance: true,
          },
        },
        referredBy: {
          select: {
            fullName: true,
            email: true,
            wallet: {
              select: {
                id: true,
              },
            },
          },
        },
      },
    });

    // Récupérer toutes les transactions de bonus pour vérifier les récompenses
    const bonusTransactions = await this.prisma.transaction.findMany({
      where: { type: 'bonus' },
      select: {
        receiverId: true,
        amount: true,
      },
    });

    const bonusMap = new Map<string, number>();
    bonusTransactions.forEach(tx => {
      bonusMap.set(tx.receiverId, (bonusMap.get(tx.receiverId) || 0) + tx.amount);
    });

    return referrals.map((referral) => {
      // Déterminer le statut du parrainage
      let status = 'pending';
      let rewardAmount = 0;
      const baseReward = referral.role === 'MERCHANT' ? 1000 : 500;

      // Si le filleul a un wallet avec un solde > 0, il est actif
      if (referral.wallet && referral.wallet.balance > 0) {
        status = 'completed';
        
        // Vérifier si le parrain a reçu un bonus
        if (referral.referredBy?.wallet?.id) {
          const receivedBonus = bonusMap.get(referral.referredBy.wallet.id) || 0;
          if (receivedBonus > 0) {
            status = 'rewarded';
            rewardAmount = baseReward;
          }
        }
      }

      return {
        id: referral.id,
        referrerName: referral.referredBy?.fullName || 'Inconnu',
        referrerEmail: referral.referredBy?.email || 'Inconnu',
        refereeName: referral.fullName,
        refereeEmail: referral.email,
        referralCode: referral.referralCode,
        dateCreated: referral.createdAt.toISOString(),
        status,
        rewardAmount,
      };
    });
  }

  async getGlobalRanking() {
    const userProfiles = await this.prisma.userProfile.findMany({
      include: {
        user: {
          select: {
            id: true,
            username: true,
            updatedAt: true,
          },
        },
        _count: {
          select: { missions: { where: { isCompleted: true } } },
        },
      },
      orderBy: {
        xp: 'desc',
      },
    });

    // Calculer les XP de la semaine pour chaque utilisateur
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    const weeklyXpData = await this.prisma.transaction.groupBy({
      by: ['receiverId'],
      where: {
        createdAt: { gte: oneWeekAgo },
        xpGained: { gt: 0 },
      },
      _sum: { xpGained: true },
    });

    const weeklyXpMap = new Map(
      weeklyXpData.map((item) => [item.receiverId, item._sum.xpGained || 0]),
    );

    return userProfiles.map((profile, index) => {
      const weeklyXP = weeklyXpMap.get(profile.userId) || 0;
      
      // Calculer le tier basé sur le niveau
      let tier: 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond' = 'bronze';
      if (profile.level >= 20) tier = 'diamond';
      else if (profile.level >= 15) tier = 'platinum';
      else if (profile.level >= 10) tier = 'gold';
      else if (profile.level >= 5) tier = 'silver';

      return {
        id: profile.userId,
        username: profile.user.username,
        level: profile.level,
        totalXP: profile.xp,
        rank: index + 1,
        weeklyXP,
        monthlyXP: 0,
        previousRank: index + 1, // Même rang (pas de changement)
        achievements: profile._count.missions,
        streakDays: 0, // Pas de série
        lastActive: profile.user.updatedAt.toISOString(),
        region: 'Alger',
        tier,
      };
    });
  }

  async getPendingVerifications(role: 'USER' | 'MERCHANT') {
    return this.prisma.identityVerification.findMany({
      where: {
        status: 'PENDING',
        user: {
          role: role,
        },
      },
      include: {
        user: {
          select: {
            fullName: true,
            email: true,
            role: true,
          },
        },
      },
      orderBy: {
        createdAt: 'asc',
      },
    });
  }

  async approveVerification(
    verificationId: string,
    adminId: string,
    sensitiveData?: any,
    notes?: string,
  ) {
    const verification = await this.prisma.identityVerification.findUnique({
      where: { id: verificationId },
      include: { user: { select: { id: true, role: true } } }, // Inclure l'ID et le rôle de l'utilisateur
    });

    if (!verification || verification.status !== 'PENDING') {
      throw new NotFoundException('Demande non trouvée ou déjà traitée.');
    }

    const userId = verification.user.id; // Récupère l'ID de l'utilisateur concerné
    const userRole = verification.user.role; // Récupère le rôle

    // --- Logique de suppression des fichiers dans uploads/documents ---
    const removeFile = (fileUrl?: string | null) => {
      if (!fileUrl) return;
      const relativePath = fileUrl.startsWith('/')
        ? fileUrl.substring(1)
        : fileUrl; // ex: 'documents/xxxx.jpg'

      // Les fichiers d'identité sont stockés sous `uploads/documents/...`
      const uploadsRoot = path.join(process.cwd(), 'uploads');
      const fullPath = path.join(uploadsRoot, relativePath);

      try {
        if (fs.existsSync(fullPath)) {
          fs.unlinkSync(fullPath);
          
        } else {
          
        }
      } catch (err) {
        
      }
    };

    // --- ✨ CORRECTION : AJOUT DE L'APPEL AU SERVICE DE GAMIFICATION ---
    let xpToAdd = 0;
    try {
      // Calcule l'XP en passant l'ID (pour déterminer le rôle si besoin)
      xpToAdd = await this.gamificationService.calculateXpForTransaction(
        'VERIFY_IDENTITY', // L'identifiant de ton action
        userId,
      );
      if (xpToAdd > 0) {
        await this.gamificationService.addXp(userId, xpToAdd);
      }
      // Met à jour la mission associée
      await this.gamificationService.updateMissionProgress(
        userId,
        'VERIFY_IDENTITY',
      );
    } catch (gamificationError) {
      
    }
    // --- FIN CORRECTION ---

    // 🔐 Crée TOUJOURS une archive chiffrée (même si les données sensibles sont vides)
    try {
      const dataToArchive = sensitiveData || {};
      await this.verificationArchivesService.createArchive(
        userId,
        verification.documentType,
        dataToArchive,
        adminId,
        notes,
      );
      
    } catch (archiveError) {
      
      throw new BadRequestException(
        `Erreur lors de la création de l'archive: ${archiveError instanceof Error ? archiveError.message : 'Erreur inconnue'}`
      );
    }

    // 🗑️  Supprime les fichiers physiques
    removeFile(verification.frontImageUrl);
    removeFile(verification.backImageUrl);
    removeFile(verification.selfieImageUrl);

    // Met à jour la vérification (sans les fichiers)
    const finalTaxNumber = sensitiveData?.taxNumber?.trim() || verification.taxNumber?.trim() || null;
    const updatedVerification = await this.prisma.identityVerification.update({
      where: { id: verificationId },
      data: {
        status: 'VERIFIED',
        // Efface les URLs des fichiers (ils sont supprimés et archivés)
        frontImageUrl: 'ARCHIVED',
        backImageUrl: verification.backImageUrl ? 'ARCHIVED' : null,
        selfieImageUrl: verification.selfieImageUrl ? 'ARCHIVED' : null,
        // Conserver le numéro d'impôt s'il a été saisi dans le formulaire
        taxNumber: finalTaxNumber,
      },
    });

    // Si c'est un marchand et qu'un numéro d'impôt est disponible, mettre à jour le profil marchand
    if (userRole === 'MERCHANT' && finalTaxNumber) {
      await this.prisma.merchant.updateMany({
        where: { userId },
        data: { taxNumber: finalTaxNumber },
      });
    }

    // Notification
    await this.prisma.notification.create({
      data: {
        userId: userId,
        message: `🎉 Bonne nouvelle ! Votre identité a été vérifiée. ${xpToAdd > 0 ? `Vous avez gagné ${xpToAdd} XP !` : ''}`,
      },
    });

    return updatedVerification;
  }

  async rejectVerification(verificationId: string, reason: string) {
    const verification = await this.prisma.identityVerification.findUnique({
      where: { id: verificationId },
    });

    if (!verification || verification.status !== 'PENDING') {
      throw new NotFoundException('Demande non trouvée ou déjà traitée.');
    }

    // Supprimer également les fichiers physiques en cas de rejet
    const removeFile = (fileUrl?: string | null) => {
      if (!fileUrl) return;
      const relativePath = fileUrl.startsWith('/')
        ? fileUrl.substring(1)
        : fileUrl; // ex: 'documents/xxxx.jpg'
      const uploadsRoot = path.join(process.cwd(), 'uploads');
      const fullPath = path.join(uploadsRoot, relativePath);
      try {
        if (fs.existsSync(fullPath)) {
          fs.unlinkSync(fullPath);
        }
      } catch (err) {
        
      }
    };

    removeFile(verification.frontImageUrl);
    removeFile(verification.backImageUrl);
    removeFile(verification.selfieImageUrl);

    await this.prisma.notification.create({
      data: {
        userId: verification.userId,
        message: `Votre vérification d'identité a été rejetée. Motif : ${reason}`,
      },
    });

    return this.prisma.identityVerification.update({
      where: { id: verificationId },
      data: {
        status: 'REJECTED',
        rejectionReason: reason,
      },
    });
  }

  async getWeeklyRanking() {
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    const weeklyXpGains = await this.prisma.transaction.groupBy({
      by: ['receiverId'],
      where: {
        createdAt: {
          gte: oneWeekAgo,
        },
        xpGained: {
          gt: 0,
        },
      },
      _sum: {
        xpGained: true,
      },
      orderBy: {
        _sum: {
          xpGained: 'desc',
        },
      },
    });

    if (weeklyXpGains.length === 0) return [];

    const userIds = weeklyXpGains
      .map((gain) => gain.receiverId)
      .filter((id) => id !== null) as string[];

    const users = await this.prisma.user.findMany({
      where: { wallet: { id: { in: userIds } } },
      include: { 
        profile: {
          include: {
            _count: {
              select: { missions: { where: { isCompleted: true } } },
            },
          },
        },
        wallet: true,
      },
    });

    return weeklyXpGains
      .map((gain, index) => {
        const user = users.find((u) => u.wallet?.id === gain.receiverId);
        if (!user || !user.profile) return null;

        // Calculer le tier basé sur le niveau
        let tier: 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond' = 'bronze';
        if (user.profile.level >= 20) tier = 'diamond';
        else if (user.profile.level >= 15) tier = 'platinum';
        else if (user.profile.level >= 10) tier = 'gold';
        else if (user.profile.level >= 5) tier = 'silver';

        return {
          id: user.id,
          username: user.username,
          level: user.profile.level,
          totalXP: user.profile.xp,
          weeklyXP: gain._sum.xpGained || 0,
          rank: index + 1,
          monthlyXP: 0,
          previousRank: index + 1, // Même rang
          achievements: user.profile._count?.missions || 0,
          streakDays: 0, // Pas de série
          lastActive: user.updatedAt.toISOString(),
          region: 'Alger',
          tier,
        };
      })
      .filter(Boolean);
  }

  /**
   * Calcule des indicateurs de churn à partir des données présentes en base de données.
   * Les métriques renvoyées sont dynamiques et reposent sur les dates d'inscription et
   * d'activité des utilisateurs (transactions). Les segments regroupent les utilisateurs
   * selon leur ancienneté et leur activité. Les raisons de churn sont estimées à partir
   * d'indices simples comme l'inactivité, un solde bas ou des transactions échouées.
   * @param query - Paramètres de filtrage optionnels (period, riskLevel, churnRate, segment)
   */
  async getChurnStats(query?: ChurnStatsQueryDto) {
    // Calculer la plage de dates selon le paramètre period
    const { startDate, endDate } = this.getDateRangeFromPeriod(query?.period);
    
    // Récupération de tous les utilisateurs non administrateurs avec leurs dates de création,
    // leur rôle, leur parrain éventuel et leur wallet pour accéder au solde.
    // Filtrer par date de création si une période est spécifiée
    const users = await this.prisma.user.findMany({
      where: { 
        role: { not: 'ADMIN' },
        createdAt: { lte: endDate }, // Seulement les utilisateurs créés avant la fin de la période
      },
      select: {
        id: true,
        fullName: true,
        email: true,
        createdAt: true as any,
        role: true,
        referredById: true,
        wallet: { select: { id: true, balance: true } },
      },
    });
    const now = endDate;
    // Variables d'agrégation
    let churnedCount = 0;
    let churnedCountPrev = 0;
    let earlyChurnCount = 0;
    let earlyTotal = 0;
    let monthlyChurnCount = 0;
    let premiumChurn = 0;
    let premiumTotal = 0;
    let timeBeforeChurnSum = 0;
    let churnedUserCount = 0;
    // Counters pour les raisons de churn
    let inactivityUsers = 0;
    let lowBalanceUsers = 0;
    let failedUsers = new Set<string>();
    // Segments intermédiaires
    const segmentsAgg: Record<
      string,
      {
        totalUsers: number;
        churned: number;
        lifeSum: number;
        revenueSum: number;
      }
    > = {
      newUsers: { totalUsers: 0, churned: 0, lifeSum: 0, revenueSum: 0 },
      active: { totalUsers: 0, churned: 0, lifeSum: 0, revenueSum: 0 },
      inactive: { totalUsers: 0, churned: 0, lifeSum: 0, revenueSum: 0 },
      premium: { totalUsers: 0, churned: 0, lifeSum: 0, revenueSum: 0 },
    };
    for (const user of users) {
      const createdAt =
        user.createdAt instanceof Date
          ? user.createdAt
          : new Date(user.createdAt);
      // Récupération de la dernière activité en tant qu'expéditeur ou destinataire
      let lastActivity: Date | null = null;
      if (user.wallet?.id) {
        const sent = await this.prisma.transaction.findFirst({
          where: { senderId: user.wallet.id },
          orderBy: { createdAt: 'desc' },
        });
        const received = await this.prisma.transaction.findFirst({
          where: { receiverId: user.wallet.id },
          orderBy: { createdAt: 'desc' },
        });
        const sentDate = sent?.createdAt
          ? new Date(sent.createdAt as any)
          : null;
        const recvDate = received?.createdAt
          ? new Date(received.createdAt as any)
          : null;
        lastActivity =
          [sentDate, recvDate]
            .filter(Boolean)
            .sort((a, b) => b!.getTime() - a!.getTime())[0] || null;
      }
      const lastActivityDate = lastActivity ?? createdAt;
      const daysSinceLast = Math.floor(
        (now.getTime() - lastActivityDate.getTime()) / (1000 * 60 * 60 * 24),
      );
      const daysSinceSignup = Math.floor(
        (now.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24),
      );
      // Estimation du revenu généré par cet utilisateur
      let totalRevenue = 0;
      if (user.wallet?.id) {
        const agg = await this.prisma.transaction.aggregate({
          _sum: { amount: true },
          where: {
            OR: [{ senderId: user.wallet.id }, { receiverId: user.wallet.id }],
          },
        });
        totalRevenue = agg._sum.amount || 0;
      }
      // Détermination de l'état de churn (inactive depuis plus de 30 jours ou aucune transaction)
      const isChurned = !lastActivity || daysSinceLast > 30;
      const wasChurnedPrev =
        !lastActivity || (daysSinceLast > 30 && daysSinceLast <= 60);
      if (isChurned) {
        churnedCount++;
        if (wasChurnedPrev) churnedCountPrev++;
        churnedUserCount++;
        // Temps avant churn = différence entre la dernière activité et la création
        timeBeforeChurnSum += Math.max(
          0,
          Math.floor(
            (lastActivityDate.getTime() - createdAt.getTime()) /
              (1000 * 60 * 60 * 24),
          ),
        );
      }
      // Churn précoce : utilisateurs créés il y a moins de 7 jours sans activité
      if (daysSinceSignup <= 7) {
        earlyTotal++;
        if (isChurned) earlyChurnCount++;
      }
      // Churn mensuel : utilisateurs inactifs depuis plus de 30 jours
      if (isChurned) monthlyChurnCount++;
      // Churn premium : rôle MERCHANT
      if (user.role === 'MERCHANT') {
        premiumTotal++;
        if (isChurned) premiumChurn++;
      }
      // Raisons : inactivité, solde faible (< 100), transactions échouées
      if (isChurned) inactivityUsers++;
      if (user.wallet && user.wallet.balance < 100) lowBalanceUsers++;
      if (user.wallet?.id) {
        const failed = await this.prisma.transaction.findMany({
          where: {
            OR: [{ senderId: user.wallet.id }, { receiverId: user.wallet.id }],
            status: { in: ['failed', 'cancelled'] },
          },
          select: { id: true },
        });
        if (failed.length > 0) failedUsers.add(user.id);
      }
      // Segmentation selon l'activité
      let segmentKey: keyof typeof segmentsAgg;
      if (daysSinceSignup <= 30) {
        segmentKey = 'newUsers';
      } else if (!isChurned) {
        segmentKey = 'active';
      } else {
        segmentKey = 'inactive';
      }
      if (user.role === 'MERCHANT') {
        segmentsAgg.premium.totalUsers++;
        if (isChurned) segmentsAgg.premium.churned++;
        segmentsAgg.premium.lifeSum +=
          Math.max(0, lastActivityDate.getTime() - createdAt.getTime()) /
          (1000 * 60 * 60 * 24);
        segmentsAgg.premium.revenueSum += totalRevenue;
      }
      segmentsAgg[segmentKey].totalUsers++;
      if (isChurned) segmentsAgg[segmentKey].churned++;
      segmentsAgg[segmentKey].lifeSum +=
        Math.max(0, lastActivityDate.getTime() - createdAt.getTime()) /
        (1000 * 60 * 60 * 24);
      segmentsAgg[segmentKey].revenueSum += totalRevenue;
    }
    const totalUsers = users.length;
    // Fonction utilitaire pour calculer tendances et cibles
    const buildMetric = (
      name: string,
      current: number,
      previous: number,
      target: number,
    ) => {
      let trend: 'up' | 'down' | 'stable' = 'stable';
      if (current > previous) trend = 'up';
      if (current < previous) trend = 'down';
      // Déterminer le niveau de risque en fonction du taux actuel
      let risk: 'low' | 'medium' | 'high' = 'low';
      if (current >= 20) risk = 'high';
      else if (current >= 10) risk = 'medium';
      return { name, current, previous, target, trend, risk };
    };
    // Calcul des métriques de churn
    const churnGlobalCurrent =
      totalUsers > 0 ? (churnedCount / totalUsers) * 100 : 0;
    const churnGlobalPrevious =
      totalUsers > 0 ? (churnedCountPrev / totalUsers) * 100 : 0;
    const churnGlobalTarget = churnGlobalCurrent * 0.9;
    const earlyChurnRate =
      earlyTotal > 0 ? (earlyChurnCount / earlyTotal) * 100 : 0;
    // Estimation d'un taux précédent sur une période équivalente (8–14 jours avant aujourd'hui)
    let earlyPrevCount = 0;
    let earlyPrevTotal = 0;
    for (const user of users) {
      const createdAt =
        user.createdAt instanceof Date
          ? user.createdAt
          : new Date(user.createdAt);
      const daysSinceSignup = Math.floor(
        (now.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24),
      );
      if (daysSinceSignup > 7 && daysSinceSignup <= 14) {
        earlyPrevTotal++;
        // Vérifier l'activité pendant cette période
        let lastActivity: Date | null = null;
        if (user.wallet?.id) {
          const sent = await this.prisma.transaction.findFirst({
            where: { senderId: user.wallet.id },
            orderBy: { createdAt: 'desc' },
          });
          const received = await this.prisma.transaction.findFirst({
            where: { receiverId: user.wallet.id },
            orderBy: { createdAt: 'desc' },
          });
          const sentDate = sent?.createdAt
            ? new Date(sent.createdAt as any)
            : null;
          const recvDate = received?.createdAt
            ? new Date(received.createdAt as any)
            : null;
          lastActivity =
            [sentDate, recvDate]
              .filter(Boolean)
              .sort((a, b) => b!.getTime() - a!.getTime())[0] || null;
        }
        const daysSinceLast = lastActivity
          ? Math.floor(
              (now.getTime() - lastActivity.getTime()) / (1000 * 60 * 60 * 24),
            )
          : daysSinceSignup;
        if (!lastActivity || daysSinceLast > 30) earlyPrevCount++;
      }
    }
    const earlyChurnPrev =
      earlyPrevTotal > 0 ? (earlyPrevCount / earlyPrevTotal) * 100 : 0;
    const earlyChurnTarget = earlyChurnRate * 0.9;
    const monthlyChurnRate =
      totalUsers > 0 ? (monthlyChurnCount / totalUsers) * 100 : 0;
    // Estimation précédente : utilisateurs inactifs entre 31 et 60 jours
    let monthlyPrev = 0;
    for (const user of users) {
      const createdAt =
        user.createdAt instanceof Date
          ? user.createdAt
          : new Date(user.createdAt);
      let lastActivity: Date | null = null;
      if (user.wallet?.id) {
        const sent = await this.prisma.transaction.findFirst({
          where: { senderId: user.wallet.id },
          orderBy: { createdAt: 'desc' },
        });
        const received = await this.prisma.transaction.findFirst({
          where: { receiverId: user.wallet.id },
          orderBy: { createdAt: 'desc' },
        });
        const sentDate = sent?.createdAt
          ? new Date(sent.createdAt as any)
          : null;
        const recvDate = received?.createdAt
          ? new Date(received.createdAt as any)
          : null;
        lastActivity =
          [sentDate, recvDate]
            .filter(Boolean)
            .sort((a, b) => b!.getTime() - a!.getTime())[0] || null;
      }
      const lastActivityDate = lastActivity ?? createdAt;
      const daysSinceLast = Math.floor(
        (now.getTime() - lastActivityDate.getTime()) / (1000 * 60 * 60 * 24),
      );
      if (daysSinceLast > 60 && daysSinceLast <= 90) monthlyPrev++;
    }
    const monthlyChurnPrevRate =
      totalUsers > 0 ? (monthlyPrev / totalUsers) * 100 : 0;
    const monthlyChurnTarget = monthlyChurnRate * 0.9;
    const premiumChurnRate =
      premiumTotal > 0 ? (premiumChurn / premiumTotal) * 100 : 0;
    const premiumPrevRate = premiumTotal > 0 ? premiumChurnRate * 1.1 : 0;
    const premiumTarget = premiumChurnRate * 0.9;
    // Récupération des métriques de récupération (difference entre churn précédent et actuel)
    const recoveredCount = churnedCountPrev - churnedCount;
    const recoveryRate =
      churnedCountPrev > 0 ? (recoveredCount / churnedCountPrev) * 100 : 0;
    const recoveryPrev = recoveryRate * 0.8;
    const recoveryTarget = recoveryRate * 1.1;
    const avgTimeBeforeChurn =
      churnedUserCount > 0 ? timeBeforeChurnSum / churnedUserCount : 0;
    const timePrev = avgTimeBeforeChurn * 0.95;
    const timeTarget = avgTimeBeforeChurn * 1.1;
    const churnMetrics = [
      buildMetric(
        'Taux de Churn Global',
        parseFloat(churnGlobalCurrent.toFixed(1)),
        parseFloat(churnGlobalPrevious.toFixed(1)),
        parseFloat(churnGlobalTarget.toFixed(1)),
      ),
      buildMetric(
        'Churn Précoce (7j)',
        parseFloat(earlyChurnRate.toFixed(1)),
        parseFloat(earlyChurnPrev.toFixed(1)),
        parseFloat(earlyChurnTarget.toFixed(1)),
      ),
      buildMetric(
        'Churn Mensuel',
        parseFloat(monthlyChurnRate.toFixed(1)),
        parseFloat(monthlyChurnPrevRate.toFixed(1)),
        parseFloat(monthlyChurnTarget.toFixed(1)),
      ),
      buildMetric(
        'Churn Premium',
        parseFloat(premiumChurnRate.toFixed(1)),
        parseFloat(premiumPrevRate.toFixed(1)),
        parseFloat(premiumTarget.toFixed(1)),
      ),
      buildMetric(
        'Récupération Churn',
        parseFloat(recoveryRate.toFixed(1)),
        parseFloat(recoveryPrev.toFixed(1)),
        parseFloat(recoveryTarget.toFixed(1)),
      ),
      buildMetric(
        'Temps Avant Churn',
        parseFloat(avgTimeBeforeChurn.toFixed(1)),
        parseFloat(timePrev.toFixed(1)),
        parseFloat(timeTarget.toFixed(1)),
      ),
    ];
    // Calcul des segments
    const segmentList: any[] = [];
    const segmentDefs: { key: keyof typeof segmentsAgg; label: string }[] = [
      { key: 'newUsers', label: 'Nouveaux Utilisateurs' },
      { key: 'active', label: 'Utilisateurs Actifs' },
      { key: 'inactive', label: 'Utilisateurs Inactifs' },
      { key: 'premium', label: 'Utilisateurs Premium' },
    ];
    for (const def of segmentDefs) {
      const data = segmentsAgg[def.key];
      const churnRate =
        data.totalUsers > 0 ? (data.churned / data.totalUsers) * 100 : 0;
      const avgLifetime =
        data.totalUsers > 0 ? data.lifeSum / data.totalUsers : 0;
      const revenueImpact = data.revenueSum;
      let riskLevel: 'low' | 'medium' | 'high' = 'low';
      if (churnRate >= 20) riskLevel = 'high';
      else if (churnRate >= 10) riskLevel = 'medium';
      segmentList.push({
        segment: def.label,
        totalUsers: data.totalUsers,
        churned: data.churned,
        churnRate: parseFloat(churnRate.toFixed(1)),
        avgLifetime: parseFloat(avgLifetime.toFixed(1)),
        revenueImpact: parseFloat(revenueImpact.toFixed(2)),
        riskLevel,
      });
    }
    // Calcul des raisons (Inactivité, Solde faible, Transactions échouées, Autres)
    const reasonsList = [] as any[];
    const totalReasonsUsers =
      inactivityUsers + lowBalanceUsers + failedUsers.size;
    const pushReason = (reason: string, count: number, actionable: boolean) => {
      const percentage =
        totalReasonsUsers > 0 ? (count / totalReasonsUsers) * 100 : 0;
      reasonsList.push({
        reason,
        percentage: parseFloat(percentage.toFixed(1)),
        users: count,
        impact: 0,
        actionable,
      });
    };
    pushReason('Inactivité', inactivityUsers, true);
    pushReason('Solde Faible', lowBalanceUsers, true);
    pushReason('Transactions Échouées', failedUsers.size, true);
    const otherCount = Math.max(
      0,
      totalUsers - (inactivityUsers + lowBalanceUsers + failedUsers.size),
    );
    pushReason('Autres', otherCount, false);
    // Sélection des utilisateurs à risque (les plus susceptibles de churn)
    const atRiskUsers: any[] = [];
    for (const user of users) {
      const createdAt =
        user.createdAt instanceof Date
          ? user.createdAt
          : new Date(user.createdAt);
      let lastActivity: Date | null = null;
      if (user.wallet?.id) {
        const sent = await this.prisma.transaction.findFirst({
          where: { senderId: user.wallet.id },
          orderBy: { createdAt: 'desc' },
        });
        const received = await this.prisma.transaction.findFirst({
          where: { receiverId: user.wallet.id },
          orderBy: { createdAt: 'desc' },
        });
        const sentDate = sent?.createdAt
          ? new Date(sent.createdAt as any)
          : null;
        const recvDate = received?.createdAt
          ? new Date(received.createdAt as any)
          : null;
        lastActivity =
          [sentDate, recvDate]
            .filter(Boolean)
            .sort((a, b) => b!.getTime() - a!.getTime())[0] || null;
      }
      const lastActivityDate = lastActivity ?? createdAt;
      const daysSinceLast = Math.floor(
        (now.getTime() - lastActivityDate.getTime()) / (1000 * 60 * 60 * 24),
      );
      let riskScore = Math.min(100, daysSinceLast * 2);
      if (user.wallet && user.wallet.balance < 100) riskScore += 10;
      let totalRevenue = 0;
      if (user.wallet?.id) {
        const agg = await this.prisma.transaction.aggregate({
          _sum: { amount: true },
          where: {
            OR: [{ senderId: user.wallet.id }, { receiverId: user.wallet.id }],
          },
        });
        totalRevenue = agg._sum.amount || 0;
      }
      const lifetime = Math.max(
        0,
        Math.floor(
          (lastActivityDate.getTime() - createdAt.getTime()) /
            (1000 * 60 * 60 * 24),
        ),
      );
      const predictedChurn = Math.max(
        0,
        Math.min(100, Math.round(riskScore / 2)),
      );
      atRiskUsers.push({
        id: user.id,
        name: user.fullName,
        email: user.email,
        riskScore: parseFloat(riskScore.toFixed(1)),
        lastActivity: lastActivityDate.toISOString().split('T')[0],
        lifetime,
        revenue: parseFloat(totalRevenue.toFixed(2)),
        predictedChurn,
      });
    }
    atRiskUsers.sort((a, b) => b.riskScore - a.riskScore);
    let filteredAtRiskUsers = atRiskUsers;
    let filteredSegments = segmentList;
    let filteredMetrics = churnMetrics;

    // Appliquer les filtres si présents
    if (query) {
      // Filtrer par niveau de risque
      if (query.riskLevel) {
        const riskThresholds = { low: 40, medium: 70, high: 100 };
        const minRisk = query.riskLevel === 'low' ? 0 : query.riskLevel === 'medium' ? 40 : 70;
        const maxRisk = riskThresholds[query.riskLevel];
        filteredAtRiskUsers = filteredAtRiskUsers.filter(
          u => u.riskScore >= minRisk && u.riskScore < maxRisk
        );
      }

      // Filtrer par taux de churn minimum
      if (query.churnRate !== undefined) {
        filteredSegments = filteredSegments.filter(
          s => s.churnRate >= query.churnRate!
        );
      }

      // Filtrer par segment spécifique
      if (query.segment) {
        filteredSegments = filteredSegments.filter(
          s => s.segment.toLowerCase().includes(query.segment!.toLowerCase())
        );
      }
    }

    const topAtRisk = filteredAtRiskUsers.slice(0, 10);
    
    return {
      metrics: filteredMetrics,
      segments: filteredSegments,
      reasons: reasonsList,
      atRiskUsers: topAtRisk,
    };
  }

  /**
   * Calcule des statistiques de conversion basées sur l'entonnoir d'inscription et d'activité.
   * Les données retournées permettent de visualiser le parcours des utilisateurs depuis
   * l'inscription jusqu'à des usages répétés et leur contribution au chiffre d'affaires.
   * @param query - Paramètres de filtrage optionnels (period, userType, conversionRate, segment)
   */
  async getConversionStats(query?: ConversionStatsQueryDto) {
    // Calculer la plage de dates selon le paramètre period
    const { startDate, endDate } = this.getDateRangeFromPeriod(query?.period);

    const users = await this.prisma.user.findMany({
      where: { 
        role: { not: 'ADMIN' },
        createdAt: { gte: startDate, lte: endDate }, // Filtrer par période
      },
      select: {
        id: true,
        fullName: true,
        createdAt: true as any,
        role: true,
        referredById: true,
        wallet: { select: { id: true } },
      },
    });
    const totalUsers = users.length;
    let stage1 = 0;
    let stage2 = 0;
    let stage3 = 0;
    let stage4 = 0;
    let totalFirstDiff = 0;
    let totalFirstCount = 0;
    let totalAmount = 0;
    let totalTxCount = 0;
    const segAgg: Record<
      string,
      { users: string[]; conversions: number; revenue: number }
    > = {
      nouveaux: { users: [], conversions: 0, revenue: 0 },
      actifs: { users: [], conversions: 0, revenue: 0 },
      recurrents: { users: [], conversions: 0, revenue: 0 },
      referres: { users: [], conversions: 0, revenue: 0 },
      merchants: { users: [], conversions: 0, revenue: 0 },
    };
    const now = new Date();
    for (const user of users) {
      stage1++;
      const createdAt =
        user.createdAt instanceof Date
          ? user.createdAt
          : new Date(user.createdAt);
      let txCount = 0;
      let firstTxDate: Date | null = null;
      let revenue = 0;
      if (user.wallet?.id) {
        const txs = await this.prisma.transaction.findMany({
          where: {
            OR: [{ senderId: user.wallet.id }, { receiverId: user.wallet.id }],
          },
          orderBy: { createdAt: 'asc' },
        });
        txCount = txs.length;
        if (txCount > 0) {
          stage2++;
          firstTxDate = new Date(txs[0].createdAt as any);
          if (txCount > 1) stage3++;
          if (txCount > 5) stage4++;
        }
        for (const tx of txs) {
          totalAmount += tx.amount;
        }
        totalTxCount += txCount;
        revenue = txs.reduce((sum, t) => sum + t.amount, 0);
      }
      if (firstTxDate) {
        const diff = Math.floor(
          (firstTxDate.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24),
        );
        totalFirstDiff += diff;
        totalFirstCount++;
      }
      const daysSinceSignup = Math.floor(
        (now.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24),
      );
      if (daysSinceSignup <= 30) {
        segAgg.nouveaux.users.push(user.id);
        segAgg.nouveaux.conversions += txCount > 0 ? 1 : 0;
        segAgg.nouveaux.revenue += revenue;
      }
      if (txCount > 0) {
        const lastTx = firstTxDate ? firstTxDate : createdAt;
        const daysSinceFirst = Math.floor(
          (now.getTime() - lastTx.getTime()) / (1000 * 60 * 60 * 24),
        );
        if (daysSinceFirst <= 30) {
          segAgg.actifs.users.push(user.id);
          segAgg.actifs.conversions += txCount > 1 ? 1 : 0;
          segAgg.actifs.revenue += revenue;
        }
      }
      if (txCount > 1) {
        segAgg.recurrents.users.push(user.id);
        segAgg.recurrents.conversions += txCount > 5 ? 1 : 0;
        segAgg.recurrents.revenue += revenue;
      }
      if (user.referredById) {
        segAgg.referres.users.push(user.id);
        segAgg.referres.conversions += txCount > 0 ? 1 : 0;
        segAgg.referres.revenue += revenue;
      }
      if (user.role === 'MERCHANT') {
        segAgg.merchants.users.push(user.id);
        segAgg.merchants.conversions += txCount > 0 ? 1 : 0;
        segAgg.merchants.revenue += revenue;
      }
    }
    const globalConv = totalUsers > 0 ? (stage2 / totalUsers) * 100 : 0;
    const globalPrev = globalConv * 0.9;
    const globalTarget = globalConv * 1.1;
    const convSignup = totalUsers > 0 ? (stage2 / totalUsers) * 100 : 0;
    const convSignupPrev = convSignup * 0.9;
    const convSignupTarget = convSignup * 1.1;
    const convFirst = stage2 > 0 ? (stage3 / stage2) * 100 : 0;
    const convFirstPrev = convFirst * 0.9;
    const convFirstTarget = convFirst * 1.1;
    let retain30 = 0;
    for (const user of users) {
      if (!user.wallet?.id) continue;
      const tx = await this.prisma.transaction.findMany({
        where: {
          OR: [{ senderId: user.wallet.id }, { receiverId: user.wallet.id }],
        },
        orderBy: { createdAt: 'desc' },
      });
      if (tx.length === 0) continue;
      const lastDate = new Date(tx[0].createdAt as any);
      const days = Math.floor(
        (now.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24),
      );
      if (days <= 30) retain30++;
    }
    const retention30 = stage2 > 0 ? (retain30 / stage2) * 100 : 0;
    const retention30Prev = retention30 * 0.95;
    const retention30Target = retention30 * 1.05;
    const avgConvTime =
      totalFirstCount > 0 ? totalFirstDiff / totalFirstCount : 0;
    const avgConvPrev = avgConvTime * 1.1;
    const avgConvTarget = avgConvTime * 0.9;
    const avgBasket = totalTxCount > 0 ? totalAmount / totalTxCount : 0;
    const avgBasketPrev = avgBasket * 0.95;
    const avgBasketTarget = avgBasket * 1.05;
    const buildMetricConv = (
      name: string,
      current: number,
      previous: number,
      target: number,
    ) => {
      let trend: 'up' | 'down' | 'stable' = 'stable';
      if (current > previous) trend = 'up';
      if (current < previous) trend = 'down';
      return {
        name,
        current: parseFloat(current.toFixed(1)),
        previous: parseFloat(previous.toFixed(1)),
        target: parseFloat(target.toFixed(1)),
        trend,
      };
    };
    const metrics = [
      buildMetricConv(
        'Taux de Conversion Global',
        globalConv,
        globalPrev,
        globalTarget,
      ),
      buildMetricConv(
        'Conversion Inscription',
        convSignup,
        convSignupPrev,
        convSignupTarget,
      ),
      buildMetricConv(
        'Première Transaction',
        convFirst,
        convFirstPrev,
        convFirstTarget,
      ),
      buildMetricConv(
        'Rétention 30j',
        retention30,
        retention30Prev,
        retention30Target,
      ),
      buildMetricConv(
        'Temps Moyen Conversion',
        avgConvTime,
        avgConvPrev,
        avgConvTarget,
      ),
      buildMetricConv(
        'Valeur Moyenne Panier',
        avgBasket,
        avgBasketPrev,
        avgBasketTarget,
      ),
    ];
    const funnel = [
      {
        stage: 'Inscription',
        users: stage1,
        conversionRate: 100,
        dropOffRate: 0,
      },
      {
        stage: 'Première Transaction',
        users: stage2,
        conversionRate:
          stage1 > 0 ? parseFloat(((stage2 / stage1) * 100).toFixed(1)) : 0,
        dropOffRate:
          stage1 > 0
            ? parseFloat((100 - (stage2 / stage1) * 100).toFixed(1))
            : 0,
      },
      {
        stage: 'Transaction Récurrente',
        users: stage3,
        conversionRate:
          stage2 > 0 ? parseFloat(((stage3 / stage2) * 100).toFixed(1)) : 0,
        dropOffRate:
          stage2 > 0
            ? parseFloat((100 - (stage3 / stage2) * 100).toFixed(1))
            : 0,
      },
      {
        stage: 'Utilisateur Fidèle',
        users: stage4,
        conversionRate:
          stage3 > 0 ? parseFloat(((stage4 / stage3) * 100).toFixed(1)) : 0,
        dropOffRate:
          stage3 > 0
            ? parseFloat((100 - (stage4 / stage3) * 100).toFixed(1))
            : 0,
      },
    ];
    const segLabels: { key: keyof typeof segAgg; label: string }[] = [
      { key: 'nouveaux', label: 'Nouveaux Utilisateurs' },
      { key: 'actifs', label: 'Utilisateurs Actifs' },
      { key: 'recurrents', label: 'Utilisateurs Récurrents' },
      { key: 'referres', label: 'Parrainages' },
      { key: 'merchants', label: 'Commerçants' },
    ];

    type SegmentRow = {
      segment: string;
      users: number;
      conversions: number;
      rate: number;
      revenue: number;
    };
    const segList: SegmentRow[] = []; // ✅ typé

    for (const def of segLabels) {
      const data = segAgg[def.key];
      const userCount = data.users.length;
      const convCount = data.conversions;
      const rate = userCount > 0 ? (convCount / userCount) * 100 : 0;
      segList.push({
        segment: def.label,
        users: userCount,
        conversions: convCount,
        rate: parseFloat(rate.toFixed(1)),
        revenue: parseFloat(data.revenue.toFixed(2)),
      });
    }

    let filteredFunnel = funnel;
    let filteredSegments = segList;
    let filteredMetrics = metrics;

    // Appliquer les filtres si présents
    if (query) {
      // Filtrer par type d'utilisateur
      if (query.userType) {
        const typeMap: Record<string, string> = {
          'new': 'Nouveaux Utilisateurs',
          'active': 'Utilisateurs Actifs',
          'recurring': 'Utilisateurs Récurrents',
          'referred': 'Parrainages',
          'merchant': 'Commerçants'
        };
        const targetSegment = typeMap[query.userType];
        if (targetSegment) {
          filteredSegments = filteredSegments.filter(s => s.segment === targetSegment);
        }
      }

      // Filtrer par taux de conversion minimum
      if (query.conversionRate !== undefined) {
        filteredSegments = filteredSegments.filter(
          s => s.rate >= query.conversionRate!
        );
      }

      // Filtrer par segment spécifique
      if (query.segment) {
        filteredSegments = filteredSegments.filter(
          s => s.segment.toLowerCase().includes(query.segment!.toLowerCase())
        );
      }
    }

    return { funnel: filteredFunnel, metrics: filteredMetrics, segments: filteredSegments };
  }

  /**
   * Calcule des statistiques de rétention pour les 6 derniers mois. Les données retournées
   * incluent le nombre de nouveaux utilisateurs par mois, la rétention (utilisateurs encore
   * actifs), le churn et la durée de vie moyenne. Une analyse de cohortes fournit un aperçu
   * de la fidélité sur différentes périodes (jour 1, 7, 30, 90 et 365).
   * @param query - Paramètres de filtrage optionnels (period, retentionRate, cohortSize)
   */
  async getRetentionStats(query?: RetentionStatsQueryDto) {
    // Calculer la plage de dates selon le paramètre period
    const { startDate, endDate } = this.getDateRangeFromPeriod(query?.period);
    const now = endDate;
    const months: { start: Date; end: Date; label: string }[] = [];
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const start = new Date(date.getFullYear(), date.getMonth(), 1);
      const end = new Date(
        date.getFullYear(),
        date.getMonth() + 1,
        0,
        23,
        59,
        59,
      );
      const label = start.toLocaleString('fr-FR', {
        month: 'long',
        year: 'numeric',
      });

      months.push({ start, end, label });
    }
    const retentionData: any[] = [];
    const cohortData: any[] = [];
    let kpiRetained = 0;
    let kpiNew = 0;
    let kpiLifetimeSum = 0;
    let kpiUsersWithLifetime = 0;
    for (const m of months) {
      const newUsers = await this.prisma.user.findMany({
        where: {
          role: { not: 'ADMIN' },
          createdAt: { gte: m.start, lte: m.end },
        },
        select: { id: true, createdAt: true, wallet: { select: { id: true } } },
      });
      const newCount = newUsers.length;
      let retainedCount = 0;
      let lifetimeSum = 0;
      let cohortDay1 = 0;
      let cohortDay7 = 0;
      let cohortDay30 = 0;
      let cohortDay90 = 0;
      let cohortDay365 = 0;
      for (const user of newUsers) {
        const createdAt =
          user.createdAt instanceof Date
            ? user.createdAt
            : new Date(user.createdAt);
        let txs: any[] = [];
        if (user.wallet?.id) {
          txs = await this.prisma.transaction.findMany({
            where: {
              OR: [
                { senderId: user.wallet.id },
                { receiverId: user.wallet.id },
              ],
            },
            orderBy: { createdAt: 'asc' },
          });
        }
        if (txs.length > 0) {
          retainedCount++;
          const lastTx = new Date(txs[txs.length - 1].createdAt as any);
          lifetimeSum += Math.floor(
            (lastTx.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24),
          );
          for (const tx of txs) {
            const txDate = new Date(tx.createdAt as any);
            const diff = Math.floor(
              (txDate.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24),
            );
            if (diff <= 1) cohortDay1++;
            if (diff <= 7) cohortDay7++;
            if (diff <= 30) cohortDay30++;
            if (diff <= 90) cohortDay90++;
            if (diff <= 365) cohortDay365++;
          }
        }
      }
      const retentionRate = newCount > 0 ? (retainedCount / newCount) * 100 : 0;
      const churnRate = 100 - retentionRate;
      const avgLifetime = retainedCount > 0 ? lifetimeSum / retainedCount : 0;
      retentionData.push({
        period: m.label,
        newUsers: newCount,
        retained: retainedCount,
        retentionRate: parseFloat(retentionRate.toFixed(1)),
        churnRate: parseFloat(churnRate.toFixed(1)),
        avgLifetime: parseFloat(avgLifetime.toFixed(1)),
      });
      cohortData.push({
        cohort: m.label,
        users: newCount,
        day1:
          newCount > 0
            ? parseFloat(((cohortDay1 / newCount) * 100).toFixed(1))
            : 0,
        day7:
          newCount > 0
            ? parseFloat(((cohortDay7 / newCount) * 100).toFixed(1))
            : 0,
        day30:
          newCount > 0
            ? parseFloat(((cohortDay30 / newCount) * 100).toFixed(1))
            : 0,
        day90:
          newCount > 0
            ? parseFloat(((cohortDay90 / newCount) * 100).toFixed(1))
            : 0,
        day365:
          newCount > 0
            ? parseFloat(((cohortDay365 / newCount) * 100).toFixed(1))
            : 0,
      });
      kpiRetained += retainedCount;
      kpiNew += newCount;
      kpiLifetimeSum += lifetimeSum;
      kpiUsersWithLifetime += retainedCount;
    }
    const kpiRetentionRate = kpiNew > 0 ? (kpiRetained / kpiNew) * 100 : 0;
    const kpiChurnRate = 100 - kpiRetentionRate;
    const kpiAvgLifetime =
      kpiUsersWithLifetime > 0 ? kpiLifetimeSum / kpiUsersWithLifetime : 0;

    let filteredRetentionData = retentionData;
    let filteredCohortData = cohortData;

    // Appliquer les filtres si présents
    if (query) {
      // Filtrer par taux de rétention minimum
      if (query.retentionRate !== undefined) {
        filteredRetentionData = filteredRetentionData.filter(
          r => r.retentionRate >= query.retentionRate!
        );
      }

      // Filtrer par taille de cohorte minimum
      if (query.cohortSize !== undefined) {
        filteredCohortData = filteredCohortData.filter(
          c => c.users >= query.cohortSize!
        );
      }
    }

    return {
      retentionData: filteredRetentionData,
      cohortData: filteredCohortData,
      kpi: {
        retentionRate: parseFloat(kpiRetentionRate.toFixed(1)),
        churnRate: parseFloat(kpiChurnRate.toFixed(1)),
        avgLifetime: parseFloat(kpiAvgLifetime.toFixed(1)),
        newUsers: kpiNew,
      },
    };
  }
  async listSuggestions() {
    return this.prisma.merchantSuggestion.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        address: true,
        category: true,
        latitude: true,
        longitude: true,
        contactName: true,    // ✅ Infos du marchand suggéré
        contactPhone: true,   // ✅ Infos du marchand suggéré
        notes: true,
        status: true,
        createdAt: true,
        suggestionCode: true,
        suggestedBy: {
          select: {
            id: true,
            fullName: true,
            phoneNumber: true,
            email: true,
          },
        },
      },
    });
  }
  async deleteSuggestion(id: string) {
    const suggestion = await this.prisma.merchantSuggestion.findUnique({
      where: { id },
    });
    if (!suggestion) {
      throw new NotFoundException('Suggestion introuvable');
    }
    return this.prisma.merchantSuggestion.delete({ where: { id } });
  }

  async approveSuggestion(id: string) {
    const suggestion = await this.prisma.merchantSuggestion.findUnique({
      where: { id },
    });
    if (!suggestion) throw new NotFoundException('Suggestion introuvable');
    if (suggestion.status !== 'pending') {
      throw new ConflictException('Cette suggestion a déjà été traitée.');
    }

    // 1. Générer un code unique pour cette suggestion
    const suggestionCode = `DINS-${nanoid(8).toUpperCase()}`;

    // 2. Mettre à jour la suggestion avec le statut 'approved' et le code
    const updatedSuggestion = await this.prisma.merchantSuggestion.update({
      where: { id },
      data: {
        status: 'approved',
        suggestionCode: suggestionCode,
      },
      include: {
        // Inclure l'utilisateur qui a suggéré pour la notification
        suggestedBy: { select: { id: true, fullName: true } },
      },
    });

    // 3. Créer un marchand suggéré temporaire
    const merchant = await this.prisma.merchant.create({
      data: {
        name: suggestion.name,
        category: suggestion.category || 'Autre',
        address: suggestion.address,
        latitude: suggestion.latitude,
        longitude: suggestion.longitude,
        isSuggestion: true,
        status: 'pending',
        // On crée un compte utilisateur temporaire pour le marchand suggéré
        user: {
          create: {
            email: `suggestion_${suggestionCode.toLowerCase()}@temp.dinary.app`,
            username: `suggestion_${suggestionCode.toLowerCase()}`,
            fullName: suggestion.name,
            phoneNumber: `SUGGESTION_${suggestionCode}`,
            hashedPassword: 'temporary', // Ne sera jamais utilisé
            role: 'MERCHANT',
          },
        },
      },
    });

    // 4. Lier le marchand à la suggestion
    await this.prisma.merchantSuggestion.update({
      where: { id: suggestion.id },
      data: {
        claimedByMerchantId: merchant.id,
      },
    });

    // 5. Notifier l'utilisateur qui a fait la suggestion
    if (updatedSuggestion.suggestedById) {
      await this.prisma.notification.create({
        data: {
          userId: updatedSuggestion.suggestedById,
          message: `Votre suggestion pour "${suggestion.name}" a été approuvée ! Un code (${suggestionCode}) a été généré. Partagez-le avec le commerçant.`,
        },
      });
      // Donner des points XP pour la suggestion approuvée
      try {
        const xpAmount =
          await this.gamificationService.calculateXpForTransaction(
            'SUGGEST_MERCHANT_APPROVED',
          );
        if (xpAmount > 0) {
          await this.gamificationService.addXp(
            updatedSuggestion.suggestedById,
            xpAmount,
          );
        }
      } catch (error) {
        
      }
    }

    
    return updatedSuggestion;
  }

  async rejectSuggestion(id: string, reason?: string) {
    const suggestion = await this.prisma.merchantSuggestion.findUnique({
      where: { id },
    });
    if (!suggestion) throw new NotFoundException('Suggestion introuvable');

    return this.prisma.merchantSuggestion.update({
      where: { id },
      data: {
        status: 'rejected',
        // Si tu veux stocker la raison, ajoute un champ `rejectionReason` dans Prisma
        // rejectionReason: reason,
      },
    });
  }

  /**
   * Liste toutes les conversations entre l'admin et les utilisateurs. Chaque entrée
   * renvoie les informations de l'utilisateur, l'aperçu du dernier message et le
   * nombre de messages non lus.
   */
  async getMessagesConversations() {
    // Récupérer tous les utilisateurs non-admin
    const users = await this.prisma.user.findMany({
      where: { role: { not: 'ADMIN' } },
      select: {
        id: true,
        fullName: true,
        email: true,
        phoneNumber: true,
        address: true,
        role: true,
        createdAt: true,
        lastSeen: true,
        wallet: { select: { id: true } },
        merchantProfile: {
          select: {
            name: true,
            category: true,
            isApproved: true,
          },
        },
      },
    });

    const now = new Date();
    const convs: any[] = [];

    for (const user of users) {
      // Récupérer le dernier message de cette conversation
      const lastMessage = await this.prisma.adminMessage.findFirst({
        where: { userId: user.id },
        orderBy: { createdAt: 'desc' },
      });

      // Compter les messages non lus envoyés par l'utilisateur
      const unreadCount = await this.prisma.adminMessage.count({
        where: {
          userId: user.id,
          senderId: user.id,
          read: false,
        },
      });

      // Déterminer le statut en ligne
      const lastSeen = user.lastSeen || user.createdAt;
      const diffMinutes = (now.getTime() - new Date(lastSeen).getTime()) / (1000 * 60);
      let status: 'online' | 'away' | 'offline' = 'offline';
      if (diffMinutes <= 5) status = 'online';
      else if (diffMinutes <= 30) status = 'away';

      convs.push({
        id: user.id,
        user: {
          id: user.id,
          name: user.fullName,
          email: user.email,
          phoneNumber: user.phoneNumber,
          address: user.address,
          avatar: '',
          status,
          lastSeen,
          isBusiness: user.role === 'MERCHANT',
          merchantProfile: user.merchantProfile,
        },
        lastMessage: lastMessage ? {
          id: lastMessage.id,
          senderId: lastMessage.senderId,
          content: lastMessage.content,
          timestamp: lastMessage.createdAt.toISOString(),
          read: lastMessage.read,
          fileUrl: lastMessage.fileUrl,
          fileName: lastMessage.fileName,
        } : null,
        unreadCount,
      });
    }

    // Trier par date du dernier message (plus récent en premier)
    convs.sort((a, b) => {
      const aDate = a.lastMessage ? new Date(a.lastMessage.timestamp).getTime() : 0;
      const bDate = b.lastMessage ? new Date(b.lastMessage.timestamp).getTime() : 0;
      return bDate - aDate;
    });

    return convs;
  }

  /**
   * Récupère les messages échangés entre l'admin et un utilisateur donné.
   * Les messages sont retournés triés par date ascendant et marqués comme lus.
   */
  async getMessagesByUser(userId: string) {
    // Marquer d'abord les messages de l'utilisateur comme lus (SEULEMENT ceux sans ticket)
    await this.prisma.adminMessage.updateMany({
      where: {
        userId,
        senderId: userId,
        receiverId: 'admin',
        read: false,
        ticketId: null, // Exclure les messages de tickets
      },
      data: { read: true },
    });

    // Récupérer tous les messages de cette conversation APRÈS le marquage (SANS les tickets)
    const messages = await this.prisma.adminMessage.findMany({
      where: { 
        userId,
        ticketId: null, // Exclure les messages de tickets
      },
      orderBy: { createdAt: 'asc' },
    });

    // Retourner les messages formatés
    return messages.map(msg => ({
      id: msg.id,
      senderId: msg.senderId,
      content: msg.content,
      timestamp: msg.createdAt.toISOString(),
      read: msg.read,
      fileUrl: msg.fileUrl,
      fileName: msg.fileName,
      fileType: msg.fileType,
    }));
  }

  /**
   * Pour un utilisateur (non-admin), récupère l'historique de conversation avec l'admin.
   * Les messages sont triés par date ascendant. Marque les messages de l'admin comme lus.
   * EXCLUT les messages de tickets (messageries séparées).
   */
  async getConversationForUser(userId: string) {
    const messages = await this.prisma.adminMessage.findMany({
      where: { 
        userId,
        ticketId: null, // Exclure les messages de tickets
      },
      orderBy: { createdAt: 'asc' },
    });

    // Marquer les messages de l'admin comme lus (SEULEMENT ceux sans ticket)
    await this.prisma.adminMessage.updateMany({
      where: {
        userId,
        senderId: 'admin',
        read: false,
        ticketId: null, // Exclure les messages de tickets
      },
      data: { read: true },
    });

    return messages.map(msg => ({
      id: msg.id,
      senderId: msg.senderId,
      content: msg.content,
      timestamp: msg.createdAt.toISOString(),
      read: msg.read,
      fileUrl: msg.fileUrl,
      fileName: msg.fileName,
      fileType: msg.fileType,
    }));
  }

  /**
   * Permet à un utilisateur d'envoyer un message à l'admin. Le message est stocké
   * en base de données avec l'identifiant de l'utilisateur comme expéditeur et est marqué
   * comme non lu côté admin.
   */
  async sendMessageFromUser(userId: string, content: string, fileUrl?: string, fileName?: string, fileType?: string) {
    if (!content || content.trim() === '') {
      throw new BadRequestException('Le contenu du message est requis.');
    }

    const message = await this.prisma.adminMessage.create({
      data: {
        userId,
        senderId: userId,
        receiverId: 'admin',
        content: content.trim(),
        fileUrl,
        fileName,
        fileType,
        read: false,
      },
    });

    return {
      id: message.id,
      senderId: message.senderId,
      content: message.content,
      timestamp: message.createdAt.toISOString(),
      read: message.read,
      fileUrl: message.fileUrl,
      fileName: message.fileName,
      fileType: message.fileType,
    };
  }

  /**
   * Compte le nombre de messages non lus par l'admin
   */
  async getUnreadMessagesCount() {
    const count = await this.prisma.adminMessage.count({
      where: {
        receiverId: 'admin',
        read: false,
        ticketId: null, // Exclure les messages de tickets
      },
    });
    
    return { count };
  }

  /**
   * Envoie un message à un utilisateur depuis l'admin. Le message est stocké en base de données
   * et renvoyé au client. L'admin est identifié par l'identifiant 'admin'.
   */
  async sendMessageToUser(userId: string, content: string, fileUrl?: string, fileName?: string, fileType?: string) {
    if (!content || content.trim() === '') {
      throw new BadRequestException('Le contenu du message est requis.');
    }

    const message = await this.prisma.adminMessage.create({
      data: {
        userId,
        senderId: 'admin',
        receiverId: userId,
        content: content.trim(),
        fileUrl,
        fileName,
        fileType,
        read: false, // Le message n'est lu que lorsque l'utilisateur ouvre la conversation
      },
    });

    // Créer une notification pour l'utilisateur
    try {
      await this.prisma.notification.create({
        data: {
          userId: userId,
          message: `💬 Nouveau message de l'admin: ${content.substring(0, 50)}${content.length > 50 ? '...' : ''}`,
        },
      });
      
    } catch (error) {
      
      // On ne bloque pas l'envoi du message si la notification échoue
    }

    return {
      id: message.id,
      senderId: message.senderId,
      content: message.content,
      timestamp: message.createdAt.toISOString(),
      read: message.read,
      fileUrl: message.fileUrl,
      fileName: message.fileName,
      fileType: message.fileType,
    };
  }

  // ===================================
  // 🎯 GESTION DES RÈGLES DE PARRAINAGE
  // ===================================

  /**
   * Récupère toutes les règles de parrainage
   */
  async getReferralRules() {
    return this.prisma.referralRule.findMany({
      orderBy: [
        { referrerType: 'asc' },
        { refereeType: 'asc' },
      ],
    });
  }

  /**
   * Crée une nouvelle règle de parrainage
   */
  async createReferralRule(data: {
    referrerType: 'USER' | 'MERCHANT';
    refereeType: 'USER' | 'MERCHANT';
    requiredAction: string;
    referrerReward: number;
    refereeReward: number;
    isActive?: boolean;
    description?: string;
  }) {
    // Vérifier qu'une règle n'existe pas déjà pour cette combinaison
    const existing = await this.prisma.referralRule.findUnique({
      where: {
        referrerType_refereeType: {
          referrerType: data.referrerType,
          refereeType: data.refereeType,
        },
      },
    });

    if (existing) {
      throw new ConflictException(
        `Une règle existe déjà pour ${data.referrerType} → ${data.refereeType}`
      );
    }

    return this.prisma.referralRule.create({
      data: {
        referrerType: data.referrerType,
        refereeType: data.refereeType,
        requiredAction: data.requiredAction as any,
        referrerReward: data.referrerReward,
        refereeReward: data.refereeReward,
        isActive: data.isActive ?? true,
        description: data.description,
      },
    });
  }

  /**
   * Met à jour une règle de parrainage existante
   */
  async updateReferralRule(
    id: string,
    data: {
      requiredAction?: string;
      referrerReward?: number;
      refereeReward?: number;
      isActive?: boolean;
      description?: string;
    }
  ) {
    const rule = await this.prisma.referralRule.findUnique({
      where: { id },
    });

    if (!rule) {
      throw new NotFoundException('Règle de parrainage introuvable');
    }

    return this.prisma.referralRule.update({
      where: { id },
      data: {
        ...(data.requiredAction && { requiredAction: data.requiredAction as any }),
        ...(data.referrerReward !== undefined && { referrerReward: data.referrerReward }),
        ...(data.refereeReward !== undefined && { refereeReward: data.refereeReward }),
        ...(data.isActive !== undefined && { isActive: data.isActive }),
        ...(data.description !== undefined && { description: data.description }),
      },
    });
  }

  /**
   * Supprime une règle de parrainage
   */
  async deleteReferralRule(id: string) {
    const rule = await this.prisma.referralRule.findUnique({
      where: { id },
    });

    if (!rule) {
      throw new NotFoundException('Règle de parrainage introuvable');
    }

    return this.prisma.referralRule.delete({
      where: { id },
    });
  }

  /**
   * Initialise les règles par défaut si elles n'existent pas
   */
  async initializeDefaultReferralRules() {
    const existingRules = await this.prisma.referralRule.count();

    if (existingRules > 0) {
      return { message: 'Les règles existent déjà' };
    }

    // Créer les 4 règles par défaut
    const defaultRules = [
      {
        referrerType: 'USER' as const,
        refereeType: 'USER' as const,
        requiredAction: 'FIRST_TRANSACTION',
        referrerReward: 500,
        refereeReward: 100,
        description: 'Client parraine Client',
      },
      {
        referrerType: 'USER' as const,
        refereeType: 'MERCHANT' as const,
        requiredAction: 'FIRST_SALE',
        referrerReward: 1000,
        refereeReward: 0,
        description: 'Client parraine Marchand',
      },
      {
        referrerType: 'MERCHANT' as const,
        refereeType: 'USER' as const,
        requiredAction: 'FIRST_TRANSACTION',
        referrerReward: 500,
        refereeReward: 100,
        description: 'Marchand parraine Client',
      },
      {
        referrerType: 'MERCHANT' as const,
        refereeType: 'MERCHANT' as const,
        requiredAction: 'FIRST_SALE',
        referrerReward: 1500,
        refereeReward: 500,
        description: 'Marchand parraine Marchand',
      },
    ];

    await Promise.all(
      defaultRules.map((rule) =>
        this.prisma.referralRule.create({
          data: {
            ...rule,
            requiredAction: rule.requiredAction as any,
          },
        })
      )
    );

    return { message: 'Règles par défaut initialisées avec succès', count: 4 };
  }

  /**
   * Récupère les règles actives pour un type d'utilisateur (affichage public côté client/marchand)
   */
  async getPublicReferralRules(userRole: 'USER' | 'MERCHANT') {
    // Récupère toutes les règles où l'utilisateur est le parrain
    const rulesAsReferrer = await this.prisma.referralRule.findMany({
      where: {
        referrerType: userRole,
        isActive: true,
      },
      select: {
        id: true,
        refereeType: true,
        requiredAction: true,
        referrerReward: true,
        refereeReward: true,
        description: true,
      },
    });

    // Formater la réponse pour l'affichage
    return {
      userRole,
      rewards: rulesAsReferrer.map((rule) => ({
        id: rule.id,
        type: `${userRole}_TO_${rule.refereeType}`, // USER_TO_USER, USER_TO_MERCHANT, etc.
        targetType: rule.refereeType,
        yourReward: rule.referrerReward, // Ce que vous gagnez en parrainant
        friendReward: rule.refereeReward, // Ce que votre filleul gagne
        requiredAction: rule.requiredAction,
        description: rule.description,
      })),
    };
  }

  /**
   * Vérifie et distribue automatiquement les récompenses de parrainage
   * À appeler après une transaction, recharge ou vente
   */
  async checkAndRewardReferral(params: {
    userId: string;
    actionType: 'TRANSACTION' | 'RECHARGE' | 'SALE';
  }) {
    const { userId, actionType } = params;

    // Récupérer l'utilisateur avec ses infos de parrainage
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        wallet: true,
        referredBy: {
          include: {
            wallet: true,
          },
        },
      },
    });

    // Si l'utilisateur n'a pas été parrainé, on arrête
    if (!user || !user.referredById || !user.referredBy) {
      return null;
    }

    // Récupérer la règle de parrainage appropriée
    const rule = await this.prisma.referralRule.findUnique({
      where: {
        referrerType_refereeType: {
          referrerType: user.referredBy.role === 'MERCHANT' ? 'MERCHANT' : 'USER',
          refereeType: user.role === 'MERCHANT' ? 'MERCHANT' : 'USER',
        },
      },
    });

    // Si pas de règle ou règle inactive, on arrête
    if (!rule || !rule.isActive) {
      return null;
    }

    // Vérifier si l'action correspond à la règle
    let actionMatches = false;
    switch (rule.requiredAction) {
      case 'FIRST_TRANSACTION':
        actionMatches = actionType === 'TRANSACTION';
        break;
      case 'FIRST_RECHARGE':
        actionMatches = actionType === 'RECHARGE';
        break;
      case 'FIRST_SALE':
        actionMatches = actionType === 'SALE';
        break;
      case 'ACCOUNT_CREATED':
        actionMatches = true; // Déjà validé à l'inscription
        break;
      default:
        actionMatches = false;
    }

    if (!actionMatches) {
      return null;
    }

    // Vérifier si le parrain a déjà reçu une récompense pour ce filleul
    const existingBonus = await this.prisma.transaction.findFirst({
      where: {
        type: 'bonus',
        receiverId: user.referredBy.wallet?.id,
        // On peut stocker une référence au filleul dans les métadonnées (si disponible)
      },
    });

    if (existingBonus) {
      // Déjà récompensé, on ne fait rien
      return null;
    }

    const results: Array<{
      type: 'referrer' | 'referee';
      userId: string;
      amount: number;
      transactionId: string;
    }> = [];

    // Créer un wallet système si nécessaire
    let systemWallet = await this.prisma.wallet.findFirst({
      where: { user: { role: 'ADMIN' } },
    });

    if (!systemWallet) {
      // Créer un admin système s'il n'existe pas
      const adminUser = await this.prisma.user.findFirst({
        where: { role: 'ADMIN' },
      });

      if (adminUser) {
        systemWallet = await this.prisma.wallet.findFirst({
          where: { userId: adminUser.id },
        });
      }
    }

    if (!systemWallet) {
      throw new Error('Wallet système introuvable pour distribuer les bonus');
    }

    // Récompenser le parrain
    if (rule.referrerReward > 0 && user.referredBy.wallet) {
      const bonusTransaction = await this.prisma.transaction.create({
        data: {
          type: 'bonus',
          amount: rule.referrerReward,
          senderId: systemWallet.id,
          receiverId: user.referredBy.wallet.id,
          status: 'completed',
        },
      });

      // Mettre à jour le solde du parrain
      await this.prisma.wallet.update({
        where: { id: user.referredBy.wallet.id },
        data: {
          balance: {
            increment: rule.referrerReward,
          },
        },
      });

      results.push({
        type: 'referrer',
        userId: user.referredBy.id,
        amount: rule.referrerReward,
        transactionId: bonusTransaction.id,
      });
    }

    // Récompenser le filleul si configuré
    if (rule.refereeReward > 0 && user.wallet) {
      const bonusTransaction = await this.prisma.transaction.create({
        data: {
          type: 'bonus',
          amount: rule.refereeReward,
          senderId: systemWallet.id,
          receiverId: user.wallet.id,
          status: 'completed',
        },
      });

      // Mettre à jour le solde du filleul
      await this.prisma.wallet.update({
        where: { id: user.wallet.id },
        data: {
          balance: {
            increment: rule.refereeReward,
          },
        },
      });

      results.push({
        type: 'referee',
        userId: user.id,
        amount: rule.refereeReward,
        transactionId: bonusTransaction.id,
      });
    }

    return {
      success: true,
      rule: {
        id: rule.id,
        description: rule.description,
      },
      rewards: results,
    };
  }

  // --- 👥 GESTION DE LA CRÉATION D'UTILISATEURS ---

  /**
   * Vérifie si un email est déjà utilisé
   */
  async checkEmailExists(email: string) {
    const userExists = await this.prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    return {
      exists: !!userExists,
      email,
    };
  }

  /**
   * Crée un nouveau compte client (USER)
   */
  async createUserAccount(userData: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    password: string;
    address?: string;
    city?: string;
    wilaya?: string;
    sendWelcomeEmail?: boolean;
    requireEmailVerification?: boolean;
    initialStatus?: 'active' | 'pending' | 'suspended';
  }) {
    // Vérifier si l'email existe déjà
    const emailCheck = await this.checkEmailExists(userData.email);
    if (emailCheck.exists) {
      throw new Error(`L'email ${userData.email} est déjà utilisé`);
    }

    // Hasher le mot de passe
    const hashedPassword = await bcrypt.hash(userData.password, 10);

    // Générer un username unique à partir de l'email
    const username = userData.email.split('@')[0] + '_' + Date.now();
    
    // Créer l'utilisateur
    const user = await this.prisma.user.create({
      data: {
        fullName: `${userData.firstName} ${userData.lastName}`,
        username: username,
        email: userData.email.toLowerCase(),
        phoneNumber: userData.phone,
        hashedPassword: hashedPassword,
        role: 'USER',
        status: userData.initialStatus || 'active',
        isVerified: !userData.requireEmailVerification,
        address: userData.address ? `${userData.address}, ${userData.city || ''}, ${userData.wilaya || ''}`.trim() : null,
      },
    });

    // Créer automatiquement un wallet pour l'utilisateur
    const wallet = await this.prisma.wallet.create({
      data: {
        userId: user.id,
        balance: 0,
      },
    });

    // TODO: Envoyer l'email de bienvenue si sendWelcomeEmail est true
    // if (userData.sendWelcomeEmail) {
    //   await this.sendWelcomeEmail(user.email, userData.firstName);
    // }

    return {
      success: true,
      user: {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        phoneNumber: user.phoneNumber,
        role: user.role,
        status: user.status,
        isVerified: user.isVerified,
        createdAt: user.createdAt,
      },
      wallet: {
        id: wallet.id,
        balance: wallet.balance,
      },
    };
  }

  /**
   * Crée un nouveau compte marchand (MERCHANT)
   */
  async createMerchantAccount(merchantData: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    password: string;
    businessName: string;
    businessType: string;
    registrationNumber?: string;
    taxNumber?: string;
    address?: string;
    city?: string;
    wilaya?: string;
    sendWelcomeEmail?: boolean;
    requireEmailVerification?: boolean;
    initialStatus?: 'active' | 'pending' | 'suspended';
  }) {
    // Vérifier si l'email existe déjà
    const emailCheck = await this.checkEmailExists(merchantData.email);
    if (emailCheck.exists) {
      throw new Error(`L'email ${merchantData.email} est déjà utilisé`);
    }

    // Hasher le mot de passe
    const hashedPassword = await bcrypt.hash(merchantData.password, 10);

    // Générer un username unique à partir de l'email
    const username = merchantData.email.split('@')[0] + '_' + Date.now();
    
    // Créer l'utilisateur marchand
    const user = await this.prisma.user.create({
      data: {
        fullName: `${merchantData.firstName} ${merchantData.lastName}`,
        username: username,
        email: merchantData.email.toLowerCase(),
        phoneNumber: merchantData.phone,
        hashedPassword: hashedPassword,
        role: 'MERCHANT',
        status: merchantData.initialStatus || 'pending',
        isVerified: !merchantData.requireEmailVerification,
        address: merchantData.address ? `${merchantData.address}, ${merchantData.city || ''}, ${merchantData.wilaya || ''}`.trim() : null,
      },
    });

    // Créer le profil marchand associé
    const merchantProfile = await this.prisma.merchant.create({
      data: {
        userId: user.id,
        name: merchantData.businessName,
        category: merchantData.businessType,
        address: merchantData.address || null,
        isApproved: merchantData.initialStatus === 'active',
        status: merchantData.initialStatus || 'pending',
        description: `Marchand créé par l'admin - ${merchantData.registrationNumber || 'N/A'}`,
        taxNumber: merchantData.taxNumber || null,
      },
    });

    // Créer automatiquement un wallet pour le marchand
    const wallet = await this.prisma.wallet.create({
      data: {
        userId: user.id,
        balance: 0,
      },
    });

    // TODO: Envoyer l'email de bienvenue si sendWelcomeEmail est true
    // if (merchantData.sendWelcomeEmail) {
    //   await this.sendWelcomeEmail(user.email, merchantData.firstName);
    // }

    return {
      success: true,
      merchant: {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        phoneNumber: user.phoneNumber,
        role: user.role,
        status: user.status,
        isVerified: user.isVerified,
        createdAt: user.createdAt,
        profile: {
          id: merchantProfile.id,
          businessName: merchantProfile.name,
          businessType: merchantProfile.category,
          isApproved: merchantProfile.isApproved,
        },
      },
      wallet: {
        id: wallet.id,
        balance: wallet.balance,
      },
    };
  }
}
