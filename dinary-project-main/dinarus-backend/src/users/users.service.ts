// src/users/users.service.ts

import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { User, Prisma, Role } from '@prisma/client';
import { GamificationService } from 'src/gamification/gamification.service';

@Injectable()
export class UsersService {
  constructor(
    private prisma: PrismaService,
    private gamificationService: GamificationService,
  ) {}

  async createUser(data: Prisma.UserCreateInput): Promise<User> {
    try {
      const user = await this.prisma.$transaction(async (tx) => {
        const newUser = await tx.user.create({ data });
        await tx.wallet.create({ data: { userId: newUser.id } });
        await tx.userProfile.create({ data: { userId: newUser.id } });
        return newUser;
      });
      
      // Après la création réussie, donner de l'XP et notifier (seulement pour les clients)
      if (user.role === 'USER') {
        try {
          const xpToAdd = await this.gamificationService.calculateXpForTransaction(
            'ACCOUNT_CREATED',
            user.id,
          );
          if (xpToAdd > 0) {
            await this.gamificationService.addXp(user.id, xpToAdd);
            // Créer une notification
            await this.prisma.notification.create({
              data: {
                userId: user.id,
                message: `👍 Bienvenue sur Dinary ! Votre compte a été créé avec succès. Vous avez gagné ${xpToAdd} XP !`,
              },
            });
          }
          // Mettre à jour les missions si nécessaire
          await this.gamificationService.updateMissionProgress(
            user.id,
            'ACCOUNT_CREATED',
          );
        } catch (gamificationError) {
          
          // On ne bloque pas la création si la gamification échoue
        }
      }
      
      return user;
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ConflictException(
          'Un utilisateur avec ces informations existe déjà.',
        );
      }
      throw error;
    }
  }
  async updateActivity(userId: string): Promise<void> {
    await this.prisma.user.update({
      where: { id: userId },
      data: { lastSeen: new Date() },
    });
  }

  async findOneByEmail(email: string): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { email } });
  }

  async findOneByUsername(username: string): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { username } });
  }

  async findOneById(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: {
        identityVerification: {
          select: {
            status: true,
          },
        },
        wallet: {
          // 👈 AJOUTEZ CET OBJET
          select: {
            id: true, // On a juste besoin de l'ID du wallet
          },
        },
      },
    });
    if (!user) {
      throw new NotFoundException('Utilisateur non trouvé.');
    }
    return user;
  }

  async findOneByReferralCode(code: string): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { referralCode: code } });
  }

  async getReferralDetails(userId: string) {
    const userWithReferrals = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        referralCode: true,
        referrals: {
          // La liste de vos filleuls
          select: {
            id: true,
            fullName: true,
            username: true, // On a besoin du username pour la vérification
            createdAt: true,
          },
          orderBy: { createdAt: 'desc' },
        },
        wallet: { select: { id: true } }, // Le portefeuille du parrain
      },
    });

    if (!userWithReferrals || !userWithReferrals.wallet) {
      throw new NotFoundException('Utilisateur ou portefeuille non trouvé.');
    }

    // Calcul du total gagné (déjà correct)
    const referralEarnings = await this.prisma.transaction.aggregate({
      _sum: { amount: true },
      where: {
        receiverId: userWithReferrals.wallet.id,
        type: 'bonus',
      },
    });
    const totalEarned = referralEarnings._sum.amount || 0;

    // --- NOUVELLE LOGIQUE POUR LE STATUT ---
    const referralsWithStatus = await Promise.all(
      userWithReferrals.referrals.map(async (referral) => {
        // Pour chaque filleul, on vérifie s'il existe une transaction "bonus"
        // qui correspond à son parrainage.
        const bonusTransaction = await this.prisma.transaction.findFirst({
          where: {
            receiverId: userWithReferrals.wallet!.id,
            type: 'bonus',
            description: {
              contains: referral.username, // La description contient le nom du filleul
            },
          },
        });

        return {
          id: referral.id,
          name: referral.fullName,
          date: new Date(referral.createdAt).getTime(),
          // Si une transaction bonus est trouvée, le statut est "completed"
          status: bonusTransaction ? 'completed' : 'pending',
        };
      }),
    );
    // --- FIN DE LA NOUVELLE LOGIQUE ---

    return {
      referralCode: userWithReferrals.referralCode,
      referrals: referralsWithStatus, // On renvoie la liste avec les statuts
      totalEarned: totalEarned,
    };
  }

  async searchUsers(query: string, currentUserId: string) {
    if (!query || query.trim().length < 2) {
      return [];
    }
    return this.prisma.user.findMany({
      where: {
        // --- MODIFICATION 1 : Exclure les marchands ET soi-même ---
        id: { not: currentUserId },
        role: Role.USER, // On ne cherche que les utilisateurs normaux

        // --- MODIFICATION 2 : Ajouter la recherche par numéro de téléphone ---
        OR: [
          { username: { contains: query, mode: 'insensitive' } },
          { fullName: { contains: query, mode: 'insensitive' } },
          { phoneNumber: { contains: query, mode: 'insensitive' } }, // Ajouté
        ],
      },
      select: {
        id: true,
        username: true,
        fullName: true,
      },
      take: 10,
    });
  }

  async findAll(excludeUserId: string) {
    return this.prisma.user.findMany({
      where: { id: { not: excludeUserId } },
      select: { id: true, fullName: true, username: true },
    });
  }
  async getRewardsDetails(userId: string) {
    // On utilise le service de gamification pour récupérer les missions de l'utilisateur
    const missions =
      await this.gamificationService.getUserMissionsWithProgress(userId);

    // La page frontend s'attend à recevoir des "badges", nous formatons donc les missions
    // pour qu'elles correspondent à ce que la page attend.
    const badges = missions.map((mission) => ({
      id: mission.id,
      name: mission.title,
      icon: mission.icon,
      color: mission.isCompleted ? 'bg-green-100' : 'bg-gray-100', // Logique de couleur simple
      description: mission.description,
      earned: mission.isCompleted,
      date: mission.completedAt
        ? new Date(mission.completedAt).toLocaleDateString('fr-FR')
        : undefined,
      progress: mission.progress,
      total: mission.goal,
      category: 'badges',
    }));

    // On retourne un objet avec une clé "badges", exactement comme le frontend s'y attend
    return { badges };
  }
}
