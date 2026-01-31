import {
  Injectable,
  ConflictException,
  InternalServerErrorException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateMerchantDto } from './dto/create-merchant.dto';
import { SuggestMerchantDto } from './dto/suggest-merchant.dto';
import { NearbyMerchantsDto } from './dto/nearby-merchants.dto';
import { UpdateMerchantDto } from './dto/update-merchant.dto';
import { GamificationService } from 'src/gamification/gamification.service';
import { Prisma } from '@prisma/client';
import { NotificationsService } from 'src/notifications/notifications.service';
import { fetch } from 'undici';

function clean<T extends Record<string, any>>(obj: T) {
  return Object.fromEntries(
    Object.entries(obj).filter(([, v]) => v !== undefined),
  ) as Partial<T>;
}

// Interface pour le type Commerce utilisé dans les requêtes nearby
interface Commerce {
  id: string;
  name: string;
  description?: string | null;
  category: string;
  address?: string | null;
  latitude: number;
  longitude: number;
  distance?: number;
  suggestionCode?: string;
  isSuggestion?: boolean;
}

// ==================== STATISTIQUES COMMERÇANT ====================

export interface MerchantStats {
  totalRevenue: number;
  totalTransactions: number;
  newCustomers: number;
  loyalCustomers: number;
  popularProducts: Array<{
    id: string; // Garder l'id
    name: string;
    sales: number;
    revenue: number;
  }>;
  monthlyRevenue: Array<{
    month: string;
    revenue: number;
    transactions: number;
  }>;
  recentTransactions: Array<{
    id: string;
    amount: number;
    customerName: string; // Renommé
    date: string;
    type: string;
  }>;
  // Champs ajoutés pour l'objectif
  currentSalesGoal?: number | null;
  currentSalesProgress?: number | null;
  goalPeriod?: string | null;
}

// ---------- Geocoding helpers (OpenStreetMap / Nominatim) ----------
async function geocodeAddress(
  address: string,
): Promise<{ lat: number; lng: number } | null> {
  if (!address?.trim()) return null;
  try {
    const url = `https://nominatim.openstreetmap.org/search?format=jsonv2&limit=1&q=${encodeURIComponent(
      address,
    )}`;
    const res = await fetch(url, {
      headers: { 'User-Agent': 'dinary-merchant/1.0 (support@dinary.app)' },
    });
    if (!res.ok) return null;
    const list = (await res.json()) as Array<{ lat: string; lon: string }>;
    if (!list?.length) return null;
    return { lat: parseFloat(list[0].lat), lng: parseFloat(list[0].lon) };
  } catch {
    return null;
  }
}

// reverse geocoding simple (Nominatim)
async function reverseGeocode(
  lat: number,
  lon: number,
): Promise<string | null> {
  try {
    const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lon}&accept-language=fr`;
    const res = await fetch(url, { headers: { 'User-Agent': 'dinary/1.0' } });
    if (!res.ok) return null;
    const json = (await res.json()) as { display_name?: string };
    return json.display_name ?? null;
  } catch {
    return null;
  }
}

@Injectable()
export class MerchantsService {
  constructor(
    private prisma: PrismaService,
    private gamificationService: GamificationService,
    private notificationsService: NotificationsService,
  ) {}

  // ---------- NEARBY ----------
  async findNearby(nearbyMerchantsDto: NearbyMerchantsDto) {
    const { latitude, longitude, radius } = nearbyMerchantsDto;
    if (
      typeof latitude !== 'number' ||
      typeof longitude !== 'number' ||
      typeof radius !== 'number'
    ) {
      throw new BadRequestException(
        'latitude, longitude et radius sont requis et doivent être des nombres.',
      );
    }

    const radiusInMeters = radius * 1000;

    // 1. Trouver les marchands officiels à proximité (votre logique existante avec PostGIS ou Haversine)
    // Assurez-vous que cette requête ne renvoie PAS les suggestions approuvées
    const officialMerchants = await this.prisma.$queryRaw<any[]>`
      SELECT id, name, description, category, address, latitude, longitude,
             ST_Distance(
               ST_MakePoint(longitude, latitude)::geography,
               ST_MakePoint(${longitude}, ${latitude})::geography
             ) AS distance
      FROM "Merchant"
      WHERE longitude IS NOT NULL AND latitude IS NOT NULL
        AND status = 'active' -- Seulement les actifs
        AND "isSuggestion" IS DISTINCT FROM TRUE -- Exclure ceux créés temporairement (ancienne logique)
        AND ST_DWithin(
            ST_MakePoint(longitude, latitude)::geography,
            ST_MakePoint(${longitude}, ${latitude})::geography,
            ${radiusInMeters}
        )
      ORDER BY distance;
  `; // Adaptez cette requête à votre implémentation (PostGIS ou Haversine)

    // 2. Trouver les SUGGESTIONS APPROUVÉES à proximité
    const approvedSuggestions = await this.prisma.$queryRaw<any[]>`
      SELECT id, name, null as description, category, address, latitude, longitude,
             "suggestionCode",
             ST_Distance(
               ST_MakePoint(longitude, latitude)::geography,
               ST_MakePoint(${longitude}, ${latitude})::geography
             ) AS distance
      FROM "MerchantSuggestion"
      WHERE longitude IS NOT NULL AND latitude IS NOT NULL
        AND status = 'approved' -- SEULEMENT les suggestions approuvées
        AND ST_DWithin(
            ST_MakePoint(longitude, latitude)::geography,
            ST_MakePoint(${longitude}, ${latitude})::geography,
            ${radiusInMeters}
        )
      ORDER BY distance;
  `;

    // 3. Fusionner les deux listes en marquant les suggestions
    const allNearby = [
      ...officialMerchants.map((m) => ({ 
        ...m, 
        isSuggestion: false,
        suggestionCode: undefined, // Les merchants officiels n'ont pas de suggestionCode
      })), // Marquer les officiels
      ...approvedSuggestions.map((s) => ({
        ...s,
        isSuggestion: true,
      })), // Marquer les suggestions - suggestionCode est déjà dans le spread
    ];

    // 4. Trier par distance finale
    allNearby.sort(
      (a, b) => (a.distance ?? Infinity) - (b.distance ?? Infinity),
    );

    return allNearby;
  }
  // ---------- CREATE ----------
  async create(userId: string, createMerchantDto: CreateMerchantDto) {
    const { name, category, description, address } = createMerchantDto;

    const existing = await this.prisma.merchant.findUnique({
      where: { userId },
    });
    if (existing) {
      throw new ConflictException(
        'Cet utilisateur a déjà un profil de commerçant.',
      );
    }

    let latitude: number | null = null;
    let longitude: number | null = null;

    if (address) {
      const c = await geocodeAddress(address);
      if (c) {
        latitude = c.lat;
        longitude = c.lng;
      }
    }

    try {
      return await this.prisma.merchant.create({
        data: {
          name,
          category,
          description,
          address,
          latitude,
          longitude,
          userId,
        },
      });
    } catch (error) {
      
      throw new InternalServerErrorException(
        'Une erreur est survenue lors de la création du commerçant.',
      );
    }
  }

  // ---------- ME ----------
  async findMe(userId: string) {
    const merchant = await this.prisma.merchant.findUnique({
      where: { userId },
      include: {
        // <--- AJOUTEZ CETTE SECTION
        products: {
          orderBy: { createdAt: 'desc' }, // Optionnel: pour trier les produits
          take: 10, // Optionnel: Limiter le nombre de produits pour l'aperçu
        },
      }, // <--- FIN DE L'AJOUT
    });
    if (!merchant) {
      throw new NotFoundException(
        'Profil de commerçant non trouvé pour cet utilisateur.',
      );
    }
    return merchant; // Maintenant, merchant contient aussi 'products'
  }

  async updateMerchant(userId: string, dto: UpdateMerchantDto) {
    const merchant = await this.prisma.merchant.findUnique({
      where: { userId },
    });
    if (!merchant) {
      throw new NotFoundException('Profil commerçant non trouvé.');
    }
    return this.prisma.merchant.update({
      where: { id: merchant.id },
      data: dto, // Le DTO contient les champs à mettre à jour
    });
  }

  // PATCH /merchants/me
  async updateByUserId(userId: string, dto: UpdateMerchantDto) {
    const merchant = await this.prisma.merchant.findUnique({
      where: { userId },
    });
    if (!merchant) throw new NotFoundException('Profil commerçant non trouvé.');

    // --- ✨ LOGIQUE POUR COMPLETE_PROFILE ---
    // Vérifier si le profil était "incomplet" *avant* cette mise à jour
    // Un profil est incomplet si la description OU l'adresse est manquante (par exemple)
    const wasIncomplete = !merchant.description || !merchant.address;
    // --- FIN LOGIQUE ---

    const data: Prisma.MerchantUpdateInput = { ...dto };

    if (typeof dto.address === 'string' && dto.address.trim().length > 0) {
      // ... (géocodage inchangé) ...
      const c = await geocodeAddress(dto.address);
      if (c) {
        (data as any).latitude = c.lat;
        (data as any).longitude = c.lng;
      }
    }

    // Met à jour le profil marchand
    const updatedMerchant = await this.prisma.merchant.update({
      where: { id: merchant.id },
      data,
    });

    // --- ✨ CORRECTION : Donner l'XP si le profil devient complet ---
    // Vérifier si le profil est maintenant "complet" *après* la mise à jour
    const isNowComplete =
      updatedMerchant.description && updatedMerchant.address;

    if (wasIncomplete && isNowComplete) {
      // Si on est passé d'incomplet à complet
      try {
        const xpToAdd =
          await this.gamificationService.calculateXpForTransaction(
            'COMPLETE_PROFILE', // L'identifiant de ton action
            userId,
          );
        if (xpToAdd > 0) {
          await this.gamificationService.addXp(userId, xpToAdd);
          // Notifier ?
          await this.prisma.notification.create({
            data: {
              userId: userId,
              message: `👍 Profil complété ! Vous avez gagné ${xpToAdd} XP.`,
            },
          });
        }
        // Mettre à jour mission
        await this.gamificationService.updateMissionProgress(
          userId,
          'COMPLETE_PROFILE',
        );
      } catch (gamificationError) {
        
      }
    }
    // --- FIN CORRECTION ---

    return updatedMerchant;
  }

  async updateLocation(
    userId: string,
    latitude: number,
    longitude: number,
    address?: string, // L'adresse est optionnelle
  ) {
    const merchant = await this.prisma.merchant.findUnique({
      where: { userId },
    });
    if (!merchant) {
      throw new NotFoundException('Profil commerçant non trouvé.');
    }

    // Le backend se charge de trouver l'adresse si elle n'est pas fournie
    const finalAddress =
      address ||
      (await reverseGeocode(latitude, longitude)) ||
      merchant.address;

    return this.prisma.merchant.update({
      where: { id: merchant.id },
      data: {
        latitude,
        longitude,
        address: finalAddress,
      },
    });
  }
  // ---------- Suggestions ----------
  async suggest(userId: string, suggestMerchantDto: SuggestMerchantDto) {
    const { address } = suggestMerchantDto;

    let latitude: number | null = null;
    let longitude: number | null = null;

    // Si une adresse est fournie, on essaie de la géocoder
    if (address) {
      const coordinates = await geocodeAddress(address);
      if (coordinates) {
        latitude = coordinates.lat;
        longitude = coordinates.lng;
      }
    }

    return this.prisma.merchantSuggestion.create({
      data: {
        ...suggestMerchantDto,
        suggestedById: userId,
        latitude, // 👈 On sauvegarde la latitude
        longitude, // 👈 On sauvegarde la longitude
      },
    });
  }

  async findMySuggestions(userId: string) {
    return this.prisma.merchantSuggestion.findMany({
      where: { suggestedById: userId },
      orderBy: { createdAt: 'desc' },
    });
  }
  async findAllOfficial() {
    // Le filtre "where" a été supprimé car userId est un champ
    // obligatoire et ne peut jamais être null.
    // Cette fonction récupère donc tous les commerçants officiels.
    return this.prisma.merchant.findMany({
      include: {
        user: {
          select: { email: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  // MODIFICATION : Renommez et clarifiez la fonction des suggestions
  async findAllSuggestions() {
    return this.prisma.merchantSuggestion.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        suggestedBy: {
          select: {
            id: true,
            fullName: true,
            email: true,
          },
        },
      },
    });
  }
  async getDashboardData(userId: string) {
    const merchant = await this.prisma.merchant.findUnique({
      where: { userId },
      include: {
        user: {
          include: {
            wallet: true,
            // profile: true, // N'est plus nécessaire, gamificationService s'en charge
          },
        },
      },
    });

    if (!merchant || !merchant.user.wallet) {
      throw new NotFoundException(
        'Profil commerçant ou portefeuille introuvable.',
      );
    }

    // --- On récupère les données de gamification (Niveau, XP, etc.) ---
    const gamificationProfile = await this.gamificationService.getProfile(
      merchant.user.id,
    );

    // --- On récupère les missions ---
    const allMissions =
      await this.gamificationService.getUserMissionsWithProgress(
        merchant.user.id,
      );

    // On cherche la première mission *non complétée*
    const firstActiveMission = allMissions.find((m) => !m.isCompleted) || null;

    // On compte le nombre total de missions complétées
    const completedMissionsCount = allMissions.filter(
      (m) => m.isCompleted,
    ).length;

    // ... (calculs pour revenueToday, transactionsTodayCount, etc. inchangés) ...
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const transactionsToday = await this.prisma.transaction.findMany({
      where: {
        receiverId: merchant.user.wallet.id,
        createdAt: { gte: today, lt: tomorrow },
        status: 'completed',
        type: 'payment',
      },
    });

    const revenueToday = transactionsToday.reduce(
      (sum, tx) => sum + tx.amount,
      0,
    );
    const transactionsTodayCount = transactionsToday.length;
    const distinctSendersToday = new Set(
      transactionsToday.map((tx) => tx.senderId).filter(Boolean),
    );
    const newCustomersToday = distinctSendersToday.size;

    const recentTransactions = await this.prisma.transaction.findMany({
      where: { receiverId: merchant.user.wallet.id },
      orderBy: { createdAt: 'desc' },
      take: 5,
      include: {
        sender: {
          include: { user: { select: { fullName: true } } },
        },
      },
    });

    return {
      balance: merchant.user.wallet.balance,

      // Données de niveau
      xp: gamificationProfile.xp,
      level: gamificationProfile.level,
      nextLevelXP: gamificationProfile.nextLevelXP,
      xpPercentage: gamificationProfile.xpPercentage,

      // --- ✨ VÉRIFIE CES LIGNES TRÈS ATTENTIVEMENT ---
      // "500 points" vient d'ici. Si c'est faux, le problème est dans ton XP en base de données.
      totalPoints: gamificationProfile.xp,

      // "1 défi complété" vient d'ici.
      badgesUnlocked: completedMissionsCount,

      // "Aucun défi en cours" vient d'ici.
      missionTitle: firstActiveMission?.title || 'Aucun défi en cours',

      // "3" vient d'ici. Doit être 0 si firstActiveMission est null.
      missionProgress: firstActiveMission?.progress || 0,

      // "5" vient d'ici. Doit être 0 si firstActiveMission est null.
      missionTotal: firstActiveMission?.goal || 0,
      // --- FIN DE LA VÉRIFICATION ---

      revenueToday,
      transactionsToday: transactionsTodayCount,
      newCustomersToday,
      recentTransactions: recentTransactions.map((tx) => ({
        id: tx.id,
        amount: tx.amount,
        user: tx.sender?.user?.fullName || 'Client Inconnu',
        type: tx.type,
        date: tx.createdAt.toISOString(),
      })),
    };
  }

  /**
   * Récupère les statistiques détaillées du commerçant
   * UTILISE MAINTENANT LE salesGoal dynamique
   */
  async getMerchantStats(merchantId: string): Promise<MerchantStats> {
    const merchant = await this.prisma.merchant.findUnique({
      where: { id: merchantId },
      include: {
        user: { include: { wallet: true } },
        products: true,
      },
    });

    if (!merchant || !merchant.user.wallet) {
      // Vérifie aussi le wallet ici
      throw new NotFoundException('Commerçant ou portefeuille non trouvé');
    }

    // Assure l'existence du profil de gamification
    await this.gamificationService.getProfile(merchant.user.id);

    // --- Calculs de stats existants (totalRevenue, totalTransactions, customers, products, monthly, recent) ---
    // ... (votre code existant pour ces calculs) ...
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    // Revenus totaux (sur toute la période)
    const totalRevenueResult = await this.prisma.transaction.aggregate({
      _sum: { amount: true },
      where: {
        receiverId: merchant.user.wallet.id,
        type: 'payment',
        status: 'completed',
      },
    });

    // Nombre total de transactions (sur toute la période)
    const totalTransactions = await this.prisma.transaction.count({
      where: {
        receiverId: merchant.user.wallet.id,
        type: 'payment',
        status: 'completed',
      },
    });

    // Nouveaux clients (actifs 30j)
    const newCustomersGroup = await this.prisma.transaction.groupBy({
      by: ['senderId'],
      where: {
        receiverId: merchant.user.wallet.id,
        type: 'payment',
        status: 'completed',
        createdAt: { gte: thirtyDaysAgo },
        senderId: { not: null },
      },
    });
    const newCustomers = newCustomersGroup.length;

    // Clients fidèles (>3 transactions)
    const loyalCustomersGroup = await this.prisma.transaction.groupBy({
      by: ['senderId'],
      where: {
        receiverId: merchant.user.wallet.id,
        type: 'payment',
        status: 'completed',
        senderId: { not: null },
      },
      _count: { id: true },
      having: { id: { _count: { gt: 3 } } },
    });
    const loyalCustomers = loyalCustomersGroup.length;

    // Produits populaires (exemple basé sur les produits liés au marchand)
    const popularProducts = merchant.products
      .sort((a, b) => (b.stock ?? 0) - (a.stock ?? 0)) // Exemple simple: tri par stock descendant
      .slice(0, 5)
      .map((product) => ({
        id: product.id,
        name: product.name,
        sales: product.stock !== null ? 100 - product.stock : 0, // Simulation de ventes basées sur stock restant
        revenue:
          product.stock !== null ? (100 - product.stock) * product.price : 0, // Simulation revenu
      }));

    // Revenus mensuels (6 derniers mois)
    const monthlyRevenue: Array<{
      month: string;
      revenue: number;
      transactions: number;
    }> = [];
    for (let i = 5; i >= 0; i--) {
      const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthEnd = new Date(
        now.getFullYear(),
        now.getMonth() - i + 1,
        0,
        23,
        59,
        59,
      );
      const monthData = await this.prisma.transaction.aggregate({
        _sum: { amount: true },
        _count: { id: true },
        where: {
          receiverId: merchant.user.wallet.id,
          type: 'payment',
          status: 'completed',
          createdAt: { gte: monthStart, lte: monthEnd },
        },
      });
      monthlyRevenue.push({
        month: monthStart.toISOString().slice(0, 7),
        revenue: monthData._sum.amount || 0,
        transactions: monthData._count.id || 0,
      });
    }

    // Transactions récentes
    const recentTransactions = await this.prisma.transaction.findMany({
      where: { receiverId: merchant.user.wallet.id },
      orderBy: { createdAt: 'desc' },
      take: 10, // Prend les 10 plus récentes
      include: {
        sender: { include: { user: { select: { fullName: true } } } },
      },
    });

    return {
      totalRevenue: totalRevenueResult._sum.amount || 0,
      totalTransactions,
      newCustomers,
      loyalCustomers,
      popularProducts, // Assurez-vous que le format correspond à l'interface
      monthlyRevenue,
      recentTransactions: recentTransactions.map((tx) => ({
        id: tx.id,
        amount: tx.amount,
        customerName: tx.sender?.user?.fullName || 'Système/Inconnu',
        date: tx.createdAt.toISOString(),
        type: tx.type,
      })), // Assurez-vous que le format correspond
      // 👇 Utiliser les valeurs de la base de données pour l'objectif
      currentSalesGoal: merchant.salesGoal,
      currentSalesProgress: merchant.currentSales,
      goalPeriod: merchant.goalPeriod,
    };
  }
  // --- NOUVELLES MÉTHODES ---

  /**
   * Met à jour l'objectif de vente du marchand.
   */
  async updateSalesGoal(userId: string, newGoal: number) {
    if (typeof newGoal !== 'number' || newGoal <= 0) {
      throw new BadRequestException("L'objectif doit être un nombre positif.");
    }
    const merchant = await this.findMe(userId); // Réutilise findMe pour vérifier l'existence

    // Optionnel : Ajouter une logique pour suggérer un objectif basé sur l'historique ?
    // Pour l'instant, on prend la valeur fournie.

    // On met à jour l'objectif. On pourrait aussi réinitialiser currentSales et goalStartDate ici
    // si la mise à jour manuelle doit démarrer une nouvelle période immédiatement.
    // Pour l'instant, on change juste l'objectif pour la période en cours.
    return this.prisma.merchant.update({
      where: { id: merchant.id },
      data: {
        salesGoal: newGoal,
        // Optionnel: Réinitialiser si besoin
        // currentSales: 0,
        // goalStartDate: new Date(),
      },
      select: { id: true, salesGoal: true }, // Retourne l'ID et le nouvel objectif
    });
  }
  /**
   * Vérifie si l'objectif de vente est atteint après une transaction
   * et déclenche les actions nécessaires (XP, notif, nouvel objectif).
   * Appelé par WalletService après un paiement réussi.
   */
  async checkSalesGoalAchievement(
    merchantUserId: string,
    transactionAmount: number,
  ) {
    try {
      const merchant = await this.prisma.merchant.findUnique({
        where: { userId: merchantUserId },
      });

      // Si pas de marchand, pas d'objectif ou objectif <= 0, on arrête.
      if (!merchant || !merchant.salesGoal || merchant.salesGoal <= 0) {
        return;
      }

      const now = new Date();
      const goalStart = merchant.goalStartDate
        ? new Date(merchant.goalStartDate)
        : new Date(now.getFullYear(), now.getMonth(), 1); // Date de début ou début du mois actuel par défaut
      let goalEnd = new Date(goalStart);
      let needsReset = false;
      let nextGoalStartDate = new Date(goalStart); // Initialisation

      // Déterminer la fin de période et si on doit réinitialiser
      if (merchant.goalPeriod === 'monthly') {
        goalEnd.setMonth(goalStart.getMonth() + 1);
        goalEnd.setDate(0); // Dernier jour du mois de début
        goalEnd.setHours(23, 59, 59, 999);

        if (now > goalEnd) {
          needsReset = true;
          // Prochaine période commence au début du mois actuel
          nextGoalStartDate = new Date(now.getFullYear(), now.getMonth(), 1);
        }
      } else {
        // Gérer 'weekly' ou autres si besoin
        return;
      }

      // --- MODIFICATION PRINCIPALE ---
      // 1. Déterminer les ventes actuelles AVANT l'incrément
      const salesBeforeThisTransaction = merchant.currentSales ?? 0;

      // 2. Calculer les nouvelles ventes (soit en incrémentant, soit en partant de 0 si reset)
      const currentSalesForUpdate = needsReset
        ? transactionAmount
        : salesBeforeThisTransaction + transactionAmount;

      // 3. Préparer les données de mise à jour (incluant potentiellement le reset)
      const updateData: Prisma.MerchantUpdateInput = {
        currentSales: currentSalesForUpdate,
      };
      if (needsReset) {
        updateData.goalStartDate = nextGoalStartDate;
        
      }

      // 4. Mettre à jour la base de données
      const updatedMerchant = await this.prisma.merchant.update({
        where: { userId: merchantUserId },
        data: updateData,
      });

      const currentSalesAfterUpdate = updatedMerchant.currentSales ?? 0; // Ventes après cette transaction

      // 5. Vérifier si l'objectif est atteint DANS LA PERIODE INITIALE (avant un éventuel reset)
      //    ET que ce n'était pas déjà atteint avant cette transaction.
      //    Ne pas déclencher l'atteinte si on vient juste de réinitialiser (needsReset = true).
      if (
        !needsReset &&
        currentSalesAfterUpdate >= merchant.salesGoal &&
        salesBeforeThisTransaction < merchant.salesGoal
      ) {
        // --- OBJECTIF ATTEINT ! ---
        

        // --- 👇 DÉCOMMENTÉ ET COMPLET 👇 ---
        // Donner XP
        try {
          const xpToAdd =
            await this.gamificationService.calculateXpForTransaction(
              'REACH_SALES_GOAL',
              merchantUserId,
            );
           // Log pour vérifier
          if (xpToAdd > 0) {
            await this.gamificationService.addXp(merchantUserId, xpToAdd);
          }
          // Mettre à jour la mission associée si elle existe
          await this.gamificationService.updateMissionProgress(
            merchantUserId,
            'REACH_SALES_GOAL',
          );
        } catch (xpError) {
          
        }

        // Envoyer Notif
        try {
          await this.notificationsService.create({
            user: { connect: { id: merchantUserId } }, // Utiliser la connexion Prisma
            message: `🎉 Félicitations ! Vous avez atteint votre objectif de ventes de ${merchant.salesGoal.toLocaleString('fr-DZ')} DA pour cette période !`,
          });
        } catch (notifError) {
          
        }
        // --- ✅ FIN DÉCOMMENTÉ ---

        // Définir Nouvel Objectif et Réinitialiser pour la PROCHAINE période
        const nextGoal = Math.round(merchant.salesGoal * 1.1);
        // La date de début de la prochaine période est calculée comme avant
        let nextPeriodStartDate = new Date(goalEnd);
        nextPeriodStartDate.setDate(nextPeriodStartDate.getDate() + 1);
        nextPeriodStartDate.setHours(0, 0, 0, 0);
        if (merchant.goalPeriod === 'monthly') {
          nextPeriodStartDate.setDate(1); // 1er du mois suivant
        }

        await this.prisma.merchant.update({
          where: { userId: merchantUserId },
          data: {
            salesGoal: nextGoal,
            currentSales: 0, // Réinitialise pour la prochaine période
            goalStartDate: nextPeriodStartDate,
          },
        });
        
      }
      // --- FIN MODIFICATION ---
    } catch (error) {
      
    }
  }
  /**
   * Récupère les notifications du commerçant
   */
  async getMerchantNotifications(merchantId: string) {
    const merchant = await this.prisma.merchant.findUnique({
      where: { id: merchantId },
      include: {
        user: {
          include: {
            notifications: {
              orderBy: { createdAt: 'desc' },
              take: 20,
            },
          },
        },
      },
    });

    if (!merchant) {
      throw new NotFoundException('Commerçant non trouvé');
    }

    return merchant.user.notifications;
  }

  /**
   * Marque une notification comme lue
   */
  async markNotificationAsRead(merchantId: string, notificationId: string) {
    const merchant = await this.prisma.merchant.findUnique({
      where: { id: merchantId },
      include: { user: true },
    });

    if (!merchant) {
      throw new NotFoundException('Commerçant non trouvé');
    }

    await this.prisma.notification.update({
      where: {
        id: notificationId,
        userId: merchant.user.id,
      },
      data: { isRead: true },
    });

    return { success: true };
  }

  /**
   * Marque toutes les notifications du commerçant comme lues
   */
  async markAllNotificationsAsRead(merchantId: string) {
    const merchant = await this.prisma.merchant.findUnique({
      where: { id: merchantId },
      include: { user: true },
    });

    if (!merchant) {
      throw new NotFoundException('Commerçant non trouvé');
    }

    await this.prisma.notification.updateMany({
      where: {
        userId: merchant.user.id,
        isRead: false,
      },
      data: { isRead: true },
    });

    return { success: true, message: 'Toutes les notifications ont été marquées comme lues' };
  }

  /**
   * Supprime toutes les notifications du commerçant
   */
  async deleteAllNotifications(merchantId: string) {
    const merchant = await this.prisma.merchant.findUnique({
      where: { id: merchantId },
      include: { user: true },
    });

    if (!merchant) {
      throw new NotFoundException('Commerçant non trouvé');
    }

    await this.prisma.notification.deleteMany({
      where: {
        userId: merchant.user.id,
      },
    });

    return { success: true, message: 'Toutes les notifications ont été supprimées' };
  }

  /**
   * Crée une notification pour le commerçant
   */
  async createMerchantNotification(merchantId: string, message: string) {
    const merchant = await this.prisma.merchant.findUnique({
      where: { id: merchantId },
      include: { user: true },
    });

    if (!merchant) {
      throw new NotFoundException('Commerçant non trouvé');
    }

    return this.prisma.notification.create({
      data: {
        message,
        userId: merchant.user.id,
      },
    });
  }
}
