// src/gamification/gamification.service.ts

import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { MissionStatus, Role } from '@prisma/client';
import { getXpForLevel } from './level.constants'; // Assurez-vous que ce fichier de secours existe

@Injectable()
export class GamificationService {
  constructor(private prisma: PrismaService) {}

  async getProfile(userId: string) {
    // CORRECTION : On récupère aussi le rôle de l'utilisateur
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { role: true, profile: true }, // On a besoin du rôle
    });

    if (!user) {
      throw new NotFoundException(`Utilisateur ${userId} non trouvé.`);
    }

    let profile = user.profile;
    const userRole = user.role === Role.MERCHANT ? 'MERCHANT' : 'USER'; // Détermine le rôle pour les règles

    if (!profile) {
      profile = await this.prisma.userProfile.create({
        data: { userId },
      });
    }

    const nextLevelNumber = profile.level + 1;

    // CORRECTION : On cherche la règle pour le bon rôle
    const nextLevelRule = await this.prisma.levelRule.findFirst({
      where: { level: nextLevelNumber, role: userRole }, // Utilise userRole
      orderBy: { level: 'asc' }, // Assure l'ordre si plusieurs règles existent (ne devrait pas arriver avec @@unique)
    });

    // Utilise la règle trouvée ou la formule de secours
    const xpToNextLevel = nextLevelRule
      ? nextLevelRule.xpRequired
      : getXpForLevel(profile.level); // Garde la formule de secours au cas où

    // Calcule le XP nécessaire pour le niveau actuel
    const currentLevelRule = await this.prisma.levelRule.findFirst({
      where: { level: profile.level, role: userRole },
    });
    const xpCurrentLevelBase = currentLevelRule
      ? currentLevelRule.xpRequired
      : 0;
    const xpNeededForNextLevelTotal = xpToNextLevel - xpCurrentLevelBase;
    const xpEarnedInCurrentLevel = profile.xp - xpCurrentLevelBase;

    // Calcul du pourcentage (évite division par zéro)
    const xpPercentage =
      xpNeededForNextLevelTotal > 0
        ? Math.min(
            100,
            Math.max(
              0,
              Math.round(
                (xpEarnedInCurrentLevel / xpNeededForNextLevelTotal) * 100,
              ),
            ),
          )
        : 100; // Si 0 XP requis, on est à 100%

    return {
      ...profile,
      // Renvoie directement le XP nécessaire *depuis 0* pour atteindre le prochain niveau
      nextLevelXP: xpToNextLevel,
      // Renvoie le XP requis pour le niveau actuel (utile pour le calcul du pourcentage)
      currentLevelXPBase: xpCurrentLevelBase,
      // Renvoie le pourcentage calculé
      xpPercentage: xpPercentage,
      // Renvoie le nombre de XP *restants* à gagner pour le prochain niveau
      xpRemainingToNextLevel: Math.max(0, xpToNextLevel - profile.xp),
    };
  }

  /**
   * S'assure que les règles de niveaux existent pour les commerçants
   */
  async ensureMerchantLevelRules() {
    const merchantLevels = [
      { level: 1, name: 'Commerçant Débutant', xpRequired: 0, icon: '🔰' },
      { level: 2, name: 'Vendeur Actif', xpRequired: 100, icon: '📈' },
      { level: 3, name: 'Commerçant Confirmé', xpRequired: 300, icon: '⭐' },
      { level: 4, name: 'Expert Vendeur', xpRequired: 600, icon: '🏆' },
      { level: 5, name: 'Maître Commerçant', xpRequired: 1000, icon: '👑' },
      { level: 6, name: 'Légende du Commerce', xpRequired: 1500, icon: '🌟' },
    ];

    for (const levelData of merchantLevels) {
      // findFirst with role to respect the composite unique (level + role)
      const existingRule = await this.prisma.levelRule.findFirst({
        where: { level: levelData.level, role: 'MERCHANT' },
      });

      if (!existingRule) {
        await this.prisma.levelRule.create({
          data: {
            level: levelData.level,
            name: levelData.name,
            xpRequired: levelData.xpRequired,
            icon: levelData.icon,
            role: 'MERCHANT',
          },
        });
      }
    }
  }

  /**
   * S'assure que les règles XP de base existent
   */
  async ensureBasicXpRules() {
    const defaultRules = [
      { action: 'transfer', xpValue: 10, description: 'Envoyer de l\'argent', role: 'USER' as const },
      { action: 'payment', xpValue: 15, description: 'Payer un marchand', role: 'USER' as const },
      { action: 'recharge', xpValue: 20, description: 'Recharger son compte', role: 'USER' as const },
      { action: 'referral', xpValue: 50, description: 'Parrainer un ami', role: 'USER' as const },
      { action: 'verify_identity', xpValue: 100, description: 'Vérifier son identité', role: 'USER' as const },
      { action: 'ACCOUNT_CREATED', xpValue: 50, description: 'Créer son compte', role: 'USER' as const },
      { action: 'RECEIVE_PAYMENT', xpValue: 25, description: 'Recevoir un paiement', role: 'MERCHANT' as const },
      { action: 'ADD_PRODUCT', xpValue: 10, description: 'Ajouter un produit', role: 'MERCHANT' as const },
      { action: 'COMPLETE_PROFILE', xpValue: 30, description: 'Compléter son profil', role: 'MERCHANT' as const },
      { action: 'VERIFY_IDENTITY', xpValue: 200, description: 'Vérifier son identité (Marchand)', role: 'MERCHANT' as const },
      { action: 'FIRST_SALE', xpValue: 50, description: 'Première vente réalisée', role: 'MERCHANT' as const },
      { action: 'RECHARGE_CLIENT', xpValue: 15, description: 'Recharger un client', role: 'MERCHANT' as const },
    ];

    for (const ruleData of defaultRules) {
      const existingRule = await this.prisma.xpRule.findFirst({
        where: { action: ruleData.action, role: ruleData.role },
      });

      if (!existingRule) {
        await this.prisma.xpRule.create({
          data: ruleData,
        });
        
      }
    }
  }

  /**
   * S'assure que les règles de niveaux existent pour les utilisateurs
   */
  async ensureUserLevelRules() {
    const userLevels = [
      { level: 1, name: 'Utilisateur Débutant', xpRequired: 0, icon: '🔰' },
      { level: 2, name: 'Utilisateur Actif', xpRequired: 50, icon: '📱' },
      { level: 3, name: 'Client Fidèle', xpRequired: 150, icon: '💎' },
      { level: 4, name: 'Expert Dinary', xpRequired: 300, icon: '⭐' },
      { level: 5, name: 'Ambassadeur', xpRequired: 500, icon: '🏆' },
      { level: 6, name: 'Légende Dinary', xpRequired: 800, icon: '🌟' },
    ];

    for (const levelData of userLevels) {
      // findFirst with role to respect the composite unique (level + role)
      const existingRule = await this.prisma.levelRule.findFirst({
        where: { level: levelData.level, role: 'USER' },
      });

      if (!existingRule) {
        await this.prisma.levelRule.create({
          data: {
            level: levelData.level,
            name: levelData.name,
            xpRequired: levelData.xpRequired,
            icon: levelData.icon,
            role: 'USER',
          },
        });
      }
    }
  }

  /**
   * Ajoute de l'XP à un utilisateur et vérifie s'il doit monter de niveau.
   * PREND MAINTENANT EN COMPTE LE ROLE.
   */
  async addXp(userId: string, xp: number) {
    // D'abord, on s'assure que le profil existe
    await this.getProfile(userId); // Crée le profil si nécessaire

    // Ensuite, on met à jour l'XP
    const updatedProfile = await this.prisma.userProfile.update({
      where: { userId },
      data: { xp: { increment: xp } },
    });

    // On vérifie la montée de niveau
    await this.checkLevelUp(userId, updatedProfile.xp);
    return updatedProfile;
  }

  /**
   * Vérifie et applique la montée de niveau en se basant sur les règles de l'admin
   * pour le RÔLE de l'utilisateur.
   */
  async checkLevelUp(userId: string, currentXp: number): Promise<boolean> {
    // CORRECTION : On récupère l'utilisateur pour connaître son rôle
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { profile: true },
    });

    if (!user || !user.profile) return false;

    const profile = user.profile;
    const userRole = user.role === Role.MERCHANT ? 'MERCHANT' : 'USER'; // Détermine le rôle

    const nextLevelNumber = profile.level + 1;

    // CORRECTION : On cherche la règle pour le bon rôle
    const nextLevelRule = await this.prisma.levelRule.findFirst({
      where: { level: nextLevelNumber, role: userRole }, // Utilise userRole
      orderBy: { level: 'asc' },
    });

    // Utilise la règle trouvée ou la formule de secours
    const xpForNextLevel = nextLevelRule
      ? nextLevelRule.xpRequired
      : getXpForLevel(profile.level); // Formule de secours

    if (currentXp >= xpForNextLevel) {
      // XP restant après passage de niveau (peut être négatif si on saute des niveaux sans règle)
      // Pour être sûr, on prend 0 comme minimum.
      const remainingXp = Math.max(0, currentXp - xpForNextLevel);

      await this.prisma.userProfile.update({
        where: { userId },
        data: {
          level: { increment: 1 },
          // On met à jour l'XP avec le reste
          xp: remainingXp,
        },
      });

      // Notifier l'utilisateur
      const newLevelRule = await this.prisma.levelRule.findFirst({
        where: { level: profile.level + 1, role: userRole },
      });
      const levelName = newLevelRule?.name ? ` (${newLevelRule.name})` : '';

      await this.prisma.notification.create({
        data: {
          userId: userId,
          message: `🎉 Félicitations ! Vous avez atteint le niveau ${profile.level + 1}${levelName} !`,
        },
      });

      // Appel récursif pour gérer les montées de plusieurs niveaux
      // On passe le XP *restant* pour vérifier le niveau suivant
      await this.checkLevelUp(userId, remainingXp);
      return true;
    }
    return false;
  }

  /**
   * Calcule les XP pour une transaction selon les règles de l'admin pour le RÔLE approprié.
   */
  async calculateXpForTransaction(
    transactionType: string,
    userId?: string, // Ajoutez userId en optionnel pour déterminer le rôle
    amount?: number, // Ajoutez amount en optionnel si les règles en dépendent
  ): Promise<number> {
    let userRole: 'USER' | 'MERCHANT' = 'USER'; // Défaut USER

    if (userId) {
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        select: { role: true },
      });
      if (user && user.role === Role.MERCHANT) {
        userRole = 'MERCHANT';
      }
    }

    // CORRECTION : On cherche la règle pour le bon rôle
    const rule = await this.prisma.xpRule.findFirst({
      where: {
        action: { equals: transactionType, mode: 'insensitive' },
        isActive: true,
        role: userRole, // Filtre par rôle
      },
      orderBy: { createdAt: 'desc' }, // Prend la règle la plus récente si doublon
    });
    return rule ? rule.xpValue : 0;
  }

  /**
   * Récupère le classement.
   */
  async getLeaderboard() {
    // CORRECTION : On utilise "userProfile"
    return this.prisma.userProfile.findMany({
      orderBy: { xp: 'desc' },
      take: 10,
      include: {
        user: {
          select: {
            username: true,
            fullName: true,
          },
        },
      },
    });
  }

  /**
   * Met à jour la progression d'une mission.
   * Doit aussi filtrer par RÔLE.
   */
  async updateMissionProgress(
    userId: string,
    missionType: string,
    progressToAdd: number = 1,
  ) {
    const userProfile = await this.getProfile(userId); // getProfile crée le profil s'il n'existe pas
    if (!userProfile) return;

    // ✨ CORRECTION : On récupère le rôle de l'utilisateur
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { role: true },
    });
    const userRole = user?.role === Role.MERCHANT ? 'MERCHANT' : 'USER';

    const missions = await this.prisma.mission.findMany({
      where: {
        type: { equals: missionType, mode: 'insensitive' },
        status: MissionStatus.ACTIVE,
        role: userRole, // 👈 FILTRE PAR RÔLE AJOUTÉ ICI
      },
    });

    if (!missions.length) return;

    for (const mission of missions) {
      // ... (le reste de la logique pour mettre à jour la progression est correct)
      let userMission = await this.prisma.userMission.findUnique({
        where: {
          userProfileId_missionId: {
            userProfileId: userProfile.id,
            missionId: mission.id,
          },
        },
      });

      if (!userMission) {
        userMission = await this.prisma.userMission.create({
          data: {
            userProfileId: userProfile.id,
            missionId: mission.id,
            progress: 0,
          },
        });
      }

      if (userMission.isCompleted) continue;

      const newProgress = Math.min(
        mission.goal,
        userMission.progress + progressToAdd,
      );

      if (newProgress >= mission.goal) {
        // Mission complétée
        await this.prisma.userMission.update({
          where: { id: userMission.id },
          data: {
            progress: mission.goal,
            isCompleted: true,
            completedAt: new Date(),
          },
        });
        await this.addXp(userId, mission.xpReward);
        await this.prisma.notification.create({
          data: {
            userId,
            message: `🎉 Mission accomplie : "${mission.title}" ! Vous avez gagné ${mission.xpReward} XP.`,
          },
        });
      } else {
        // Met simplement à jour la progression
        await this.prisma.userMission.update({
          where: { id: userMission.id },
          data: { progress: newProgress },
        });
      }
    }
  }

  /**
   * Récupère toutes les missions POUR LE ROLE de l'utilisateur et la progression associée.
   */
  async getUserMissionsWithProgress(userId: string) {
    // 1. Récupérer le profil ET le rôle
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { profile: true },
    });

    if (!user) {
      throw new NotFoundException(`Utilisateur ${userId} non trouvé.`);
    }

    // S'assure que le profil existe (utilise getProfile pour le créer au besoin)
    // getProfile est déjà role-aware
    const userProfile = user.profile
      ? user.profile
      : await this.getProfile(userId);
    const userRole = user.role === Role.MERCHANT ? 'MERCHANT' : 'USER';

    // 2. Récupérer les missions FILTRÉES PAR RÔLE
    const allMissionsForRole = await this.prisma.mission.findMany({
      where: {
        role: userRole, // 👈 LE FILTRE IMPORTANT
        status: 'ACTIVE', // On ne montre que les missions actives
      },
      orderBy: {
        createdAt: 'desc', // Optionnel : pour afficher les plus récentes en premier
      },
    });

    // 3. Récupérer la progression de l'utilisateur pour ces missions
    const userMissions = await this.prisma.userMission.findMany({
      where: {
        userProfileId: userProfile.id,
        missionId: { in: allMissionsForRole.map((m) => m.id) }, // Optimisation
      },
    });

    // 4. Combiner les deux listes
    return allMissionsForRole.map((mission) => {
      const userProgress = userMissions.find(
        (um) => um.missionId === mission.id,
      );
      return {
        ...mission, // Contient id, title, description, xpReward, goal, type, icon, role
        progress: userProgress?.progress || 0,
        isCompleted: userProgress?.isCompleted || false,
        completedAt: userProgress?.completedAt || null,
      };
    });
  }
  async getLevelRules() {
    return this.prisma.levelRule.findMany({
      orderBy: {
        level: 'asc',
      },
    });
  }

  // New helper: get level rules optionally filtered by audience role
  async getLevelRulesForRole(role?: 'USER' | 'MERCHANT') {
    const where = role ? { role } : {};
    return this.prisma.levelRule.findMany({
      where,
      orderBy: { level: 'asc' },
    });
  }

  async getXpHistory(userId: string) {
    // Récupérer le profil utilisateur
    const userProfile = await this.prisma.userProfile.findUnique({
      where: { userId },
      select: { id: true },
    });

    if (!userProfile) {
      return [];
    }

    // Récupérer les XP des missions complétées
    const missionsXp = await this.prisma.userMission.findMany({
      where: {
        userProfileId: userProfile.id,
        isCompleted: true,
      },
      include: {
        mission: {
          select: {
            title: true,
            description: true,
            xpReward: true,
          },
        },
      },
      orderBy: { completedAt: 'desc' },
    });

    // Récupérer les XP des transactions
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { wallet: { select: { id: true } } },
    });

    let transactionsXp: any[] = [];
    if (user?.wallet) {
      transactionsXp = await this.prisma.transaction.findMany({
        where: {
          OR: [{ senderId: user.wallet.id }, { receiverId: user.wallet.id }],
          xpGained: { gt: 0 },
        },
        include: {
          sender: {
            select: {
              user: {
                select: {
                  fullName: true,
                },
              },
            },
          },
          receiver: {
            select: {
              user: {
                select: {
                  fullName: true,
                },
              },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      });
    }

    // Combiner et formater les résultats
    const xpHistory = [
      // XP des missions
      ...missionsXp.map((um) => ({
        id: um.id,
        source: 'mission',
        description: `Mission: ${um.mission.title}`,
        amount: um.mission.xpReward,
        createdAt: um.completedAt || new Date(),
        details: um.mission.description,
      })),
      // XP des transactions
      ...transactionsXp.map((tx) => {
        // Déterminer le nom à afficher
        const isSender = user?.wallet ? tx.senderId === user.wallet.id : false;
        let displayName = '';
        
        if (tx.type === 'payment') {
          if (isSender) {
            // Paiement envoyé
            displayName = `Paiement à ${tx.receiver?.user?.fullName || 'un commerçant'}`;
          } else {
            // Paiement reçu
            displayName = `Paiement de ${tx.sender?.user?.fullName || 'un client'}`;
          }
        } else if (tx.type === 'transfer') {
          if (isSender) {
            displayName = `Virement à ${tx.receiver?.user?.fullName || 'un utilisateur'}`;
          } else {
            displayName = `Virement de ${tx.sender?.user?.fullName || 'un utilisateur'}`;
          }
        } else if (tx.type === 'recharge') {
          displayName = 'Recharge de compte';
        } else if (tx.type === 'refund') {
          displayName = isSender ? 'Remboursement envoyé' : 'Remboursement reçu';
        } else {
          displayName = tx.description || `Transaction ${tx.type}`;
        }

        return {
          id: tx.id,
          source: tx.type === 'payment' ? 'payment' : 'transaction',
          description: displayName,
          amount: tx.xpGained,
          createdAt: tx.createdAt,
          details: null,
        };
      }),
    ];

    // Trier par date décroissante
    return xpHistory.sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
  }
}
