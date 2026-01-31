import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
  UnauthorizedException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { SendMoneyDto } from './dto/send-money.dto';
import { GamificationService } from 'src/gamification/gamification.service';
import { CommissionService } from './commission.service';
import { CommissionsService } from '../commissions/commissions.service';
import { RechargeDto } from './dto/recharge.dto';
import { PayQrDto } from './dto/pay-qr.dto';
import PDFDocument from 'pdfkit';
import * as QRCode from 'qrcode';
import { RechargeByMerchantDto } from './dto/recharge-by-merchant.dto';
import { NotificationsService } from '../notifications/notifications.service';
import { Prisma, AudienceRole } from '@prisma/client';
import { RefundItemsDto } from './dto/refund-items.dto';
import { ProductsService } from '../products/products.service';
import { MerchantsService } from 'src/merchants/merchants.service';
@Injectable()
export class WalletService {
  private paymentStatuses = new Map<
    string,
    'pending' | 'completed' | 'failed'
  >();
  private rechargeStatuses = new Map<
    string,
    { status: 'pending' | 'completed' | 'failed'; merchantName?: string }
  >();
  constructor(
    private readonly prisma: PrismaService,
    private readonly gamificationService: GamificationService,
    private readonly commissionService: CommissionService,
    private readonly commissionsService: CommissionsService,
    private readonly notificationsService: NotificationsService,
    private readonly productsService: ProductsService,
    private readonly merchantsService: MerchantsService,
  ) {}

  // ... (le reste de votre service)
  private async checkAndApplyReferralBonus(userId: string) {
    // 1. On récupère l'utilisateur et son parrain
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { referredBy: { include: { wallet: true } } }, // On inclut le portefeuille du parrain
    });

    // 2. On vérifie si l'utilisateur a bien un parrain et un portefeuille
    if (!user || !user.referredById || !user.referredBy?.wallet) {
      return; // Pas de parrain ou portefeuille du parrain introuvable, on arrête
    }

    const referrerId = user.referredById;
    const referrerWalletId = user.referredBy.wallet.id;

    // 3. On vérifie si une récompense a DÉJÀ été donnée pour ce parrainage
    const existingBonus = await this.prisma.transaction.findFirst({
      where: {
        receiverId: referrerWalletId,
        type: 'bonus',
        description: { contains: user.username },
      },
    });

    if (existingBonus) {
      return; // Une récompense a déjà été donnée, on ne fait rien
    }

    // 4. On compte uniquement les transactions où le filleul est l'EXPÉDITEUR
    //    et qui sont des transferts ou des paiements.
    const actionTransactionCount = await this.prisma.transaction.count({
      where: {
        sender: { userId: userId }, // L'utilisateur est celui qui envoie
        type: { in: ['transfer', 'payment'] }, // Seuls les transferts et paiements comptent
      },
    });

    // 5. On vérifie si c'est bien la PREMIÈRE action de ce type
    if (actionTransactionCount === 1) {
      const rewardAmount = user.role === 'MERCHANT' ? 1000 : 500;
      const rewardDescription = `Bonus de parrainage pour ${user.username}`;

      // On procède au paiement et à la notification (inchangé)
      await this.prisma.wallet.update({
        where: { id: referrerWalletId },
        data: { balance: { increment: rewardAmount } },
      });

      await this.prisma.transaction.create({
        data: {
          amount: rewardAmount,
          type: 'bonus',
          description: rewardDescription,
          receiverId: referrerWalletId,
        },
      });

      await this.gamificationService.addXp(referrerId, 100);

      await this.prisma.notification.create({
        data: {
          userId: referrerId,
          message: `🎉 Félicitations ! Votre filleul ${user.fullName} a fait sa première transaction. Vous avez gagné ${rewardAmount} DA !`,
        },
      });
    }
  }
  getRechargeStatus(rechargeId: string) {
    const statusInfo = this.rechargeStatuses.get(rechargeId);
    if (statusInfo?.status === 'completed') {
      this.rechargeStatuses.delete(rechargeId); // Nettoyer après la lecture
      return statusInfo;
    }
    return statusInfo || { status: 'pending' };
  }
  async rechargeClientByMerchant(
    merchantId: string, // ID de l'utilisateur marchand
    dto: RechargeByMerchantDto,
  ): Promise<{ message: string }> {
    const { userId: clientId, amount, rechargeRequestId } = dto;

    this.rechargeStatuses.set(rechargeRequestId, { status: 'pending' });

    const merchant = await this.prisma.user.findUnique({
      where: { id: merchantId },
      include: { wallet: true, merchantProfile: true },
    });

    const client = await this.prisma.user.findUnique({
      where: { id: clientId },
      include: { wallet: true },
    });

    if (!merchant || !merchant.wallet || !merchant.merchantProfile) {
      this.rechargeStatuses.set(rechargeRequestId, {
        status: 'failed',
        merchantName: 'Erreur Marchand',
      });
      throw new NotFoundException('Profil commerçant introuvable.');
    }
    if (!client || !client.wallet) {
      this.rechargeStatuses.set(rechargeRequestId, {
        status: 'failed',
        merchantName: merchant.merchantProfile.name,
      });
      throw new NotFoundException('Client introuvable.');
    }
    if (merchant.wallet.balance < amount) {
      this.rechargeStatuses.set(rechargeRequestId, {
        status: 'failed',
        merchantName: merchant.merchantProfile.name,
      });
      throw new BadRequestException(
        'Solde insuffisant pour effectuer cette recharge.',
      );
    }

    // --- ✨ CORRECTION : Calcul XP pour le marchand ---
    const xpToAward = await this.gamificationService.calculateXpForTransaction(
      'RECHARGE_CLIENT', // L'identifiant de ton action
      merchantId, // ID du marchand
    );
    // --- FIN CORRECTION ---

    try {
      await this.prisma.$transaction(async (tx) => {
        // 1. Débiter le commerçant
        await tx.wallet.update({
          where: { id: merchant.wallet!.id },
          data: { balance: { decrement: amount } },
        });
        // 2. Créditer le client
        await tx.wallet.update({
          where: { id: client.wallet!.id },
          data: { balance: { increment: amount } },
        });

        // 3 & 4. Enregistrer les transactions (inchangé)
        await tx.transaction.create({
          data: {
            amount,
            type: 'MERCHANT_RECHARGE_DEBIT',
            description: `Recharge du client ${client.username}`,
            status: 'completed',
            senderId: merchant.wallet!.id,
            receiverId: client.wallet!.id,
          },
        }); // Statut complété
        await tx.transaction.create({
          data: {
            amount,
            type: 'RECHARGE_FROM_MERCHANT',
            description: `Recharge par ${merchant.merchantProfile!.name}`,
            status: 'completed',
            senderId: merchant.wallet!.id,
            receiverId: client.wallet!.id,
          },
        }); // Statut complété
      });

      // Mise à jour statut pour polling
      this.rechargeStatuses.set(rechargeRequestId, {
        status: 'completed',
        merchantName: merchant.merchantProfile!.name,
      });

      // 5. Notifications
      await this.notificationsService.create({
        user: { connect: { id: merchant.id } },
        message: `✅ Recharge client réussie ! Vous avez rechargé ${client.username} de ${amount} DA.`,
      });
      await this.notificationsService.create({
        user: { connect: { id: client.id } },
        message: `💰 Votre compte a été rechargé de ${amount} DA par ${merchant.merchantProfile.name}.`,
      });

      // --- ✨ CORRECTION : Donner l'XP au marchand ---
      if (xpToAward > 0) {
        await this.gamificationService.addXp(merchantId, xpToAward);
        await this.gamificationService.updateMissionProgress(
          merchantId,
          'RECHARGE_CLIENT',
        );
      }
      // --- FIN CORRECTION ---

      return { message: 'Recharge effectuée avec succès.' };
    } catch (error) {
      this.rechargeStatuses.set(rechargeRequestId, {
        status: 'failed',
        merchantName: merchant.merchantProfile.name,
      });
      void 0;
      // Rethrow pour une gestion globale des erreurs par NestJS
      throw new BadRequestException("La recharge n'a pas pu être complétée.");
    }
  }
  async generateHistoryPdf(
    userId: string,
    from?: Date,
    to?: Date,
  ): Promise<Buffer> {
    const wallet = await this.findOneByUserId(userId);
    if (!wallet) throw new NotFoundException('Portefeuille non trouvé.');

    // 1. Construire la clause "where" pour les dates
    const dateFilter: Prisma.DateTimeFilter = {};
    if (from) dateFilter.gte = from;
    if (to) {
      // S'assurer que 'to' inclut toute la journée
      const toEndOfDay = new Date(to);
      toEndOfDay.setHours(23, 59, 59, 999);
      dateFilter.lte = toEndOfDay;
    }

    // 2. Récupérer les transactions filtrées
    const txs = await this.prisma.transaction.findMany({
      where: {
        OR: [{ senderId: wallet.id }, { receiverId: wallet.id }],
        ...(from || to ? { createdAt: dateFilter } : {}),
      },
      include: {
        sender: {
          select: { user: { select: { username: true, fullName: true } } },
        },
        receiver: {
          select: { user: { select: { username: true, fullName: true } } },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // 3. Calculer les totaux (logique similaire à votre frontend)
    let totalEntrees = 0;
    let totalSorties = 0;

    const formattedTxs = txs.map((tx) => {
      const isIncome = tx.receiverId === wallet.id && tx.senderId !== wallet.id;
      const isOutcome =
        tx.senderId === wallet.id && tx.receiverId !== wallet.id;
      let direction: 'in' | 'out' | 'self' = 'self';

      if (isIncome) direction = 'in';
      else if (isOutcome) direction = 'out';

      let amount = tx.amount;
      if (direction === 'in' || tx.type === 'recharge' || tx.type === 'bonus') {
        totalEntrees += tx.amount;
      } else if (direction === 'out' || tx.type === 'withdrawal') {
        totalSorties += tx.amount;
        amount = -tx.amount;
      } else {
        // Self-transactions (comme un retrait)
        if (tx.type === 'withdrawal') {
          amount = -tx.amount;
        }
      }

      const description = tx.description || tx.type;
      const date = new Date(tx.createdAt).toLocaleDateString('fr-FR');
      return { date, description, amount };
    });

    // 4. Générer le PDF avec pdfkit
    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFDocument({ size: 'A4', margin: 50 });
        const buffers: Buffer[] = [];
        doc.on('data', buffers.push.bind(buffers));
        doc.on('end', () => resolve(Buffer.concat(buffers)));

        // --- En-tête ---
        doc
          .fontSize(18)
          .font('Helvetica-Bold')
          .text('Historique des Transactions', { align: 'center' });
        doc.fontSize(10).font('Helvetica').moveDown(0.5);

        const dateRange =
          from || to
            ? `Période du ${from ? from.toLocaleDateString('fr-FR') : 'début'} au ${to ? to.toLocaleDateString('fr-FR') : "aujourd'hui"}`
            : 'Historique complet';
        doc.text(dateRange, { align: 'center' });
        doc.moveDown(2);

        // --- Totaux ---
        doc.fontSize(12).font('Helvetica-Bold');
        doc.text(`Total Entrées: `, { continued: true });
        doc
          .font('Helvetica')
          .fillColor('green')
          .text(`+${totalEntrees.toLocaleString('fr-DZ')} DA`);

        doc
          .font('Helvetica-Bold')
          .fillColor('black')
          .text(`Total Sorties: `, { continued: true });
        doc
          .font('Helvetica')
          .fillColor('red')
          .text(`-${totalSorties.toLocaleString('fr-DZ')} DA`);
        doc.moveDown(1);

        // Ligne de séparation
        doc
          .strokeColor('#aaaaaa')
          .lineWidth(0.5)
          .moveTo(50, doc.y)
          .lineTo(545, doc.y)
          .stroke();
        doc.moveDown(1);

        // --- En-têtes du tableau ---
        doc.fontSize(10).font('Helvetica-Bold');
        doc.text('Date', 50, doc.y);
        doc.text('Description', 150, doc.y);
        doc.text('Montant', 450, doc.y, { align: 'right' });
        doc.moveDown(0.5);

        // --- Lignes de transactions ---
        doc.font('Helvetica').fontSize(10);
        formattedTxs.forEach((tx) => {
          const y = doc.y;
          doc.text(tx.date, 50, y, { width: 90 });
          doc.text(tx.description, 150, y, { width: 280 });

          const isPositive = tx.amount >= 0;
          doc.fillColor(isPositive ? 'green' : 'red');
          doc.text(
            `${isPositive ? '+' : ''}${tx.amount.toLocaleString('fr-DZ')} DA`,
            450,
            y,
            { align: 'right', width: 95 },
          );
          doc.fillColor('black'); // Revenir au noir
          doc.moveDown(0.5);
        });

        doc.end();
      } catch (error) {
        reject(error);
      }
    });
  }
  async payQr(senderUserId: string, payQrDto: PayQrDto) {
    const { merchantUserId, amount, paymentRequestId, cart } = payQrDto; // merchantUserId est déjà là
    // ... (calcul xp, début transaction Prisma) ...
    const xpForSender =
      await this.gamificationService.calculateXpForTransaction(
        'payment', // Action du client
        senderUserId,
      );
    const xpForMerchant =
      await this.gamificationService.calculateXpForTransaction(
        'RECEIVE_PAYMENT', // Action du marchand
        merchantUserId,
      );
    // --- FIN CORRECTION ---

    try {
      await this.prisma.$transaction(async (tx) => {
        // ... (logique pour trouver les wallets et mettre à jour les soldes) ...
        const senderWallet = await tx.wallet.findUnique({
          where: { userId: senderUserId },
        });
        
        // Calculate commission for merchant_payment action
        const clientCommission =
          await this.commissionsService.calculateCommission(
            'merchant_payment_client',
            amount,
            AudienceRole.USER,
          );
        const merchantCommission =
          await this.commissionsService.calculateCommission(
            'merchant_payment',
            amount,
            AudienceRole.MERCHANT,
          );
        const totalCommission = clientCommission + merchantCommission;
        const totalToDeduct = amount + clientCommission;
        const netToMerchant = amount - merchantCommission;

        if (netToMerchant < 0) {
          throw new BadRequestException(
            'La commission ne peut pas dépasser le montant de la transaction.',
          );
        }

        if (!senderWallet || senderWallet.balance < totalToDeduct) {
          throw new BadRequestException('Solde insuffisant.');
        }
        const receiverWallet = await tx.wallet.findUnique({
          where: { userId: merchantUserId },
        });
        if (!receiverWallet) {
          throw new NotFoundException('Portefeuille du commerçant non trouvé.');
        }
        
        // Deduct total (amount + commission) from sender
        await tx.wallet.update({
          where: { id: senderWallet.id },
          data: { balance: { decrement: totalToDeduct } },
        });
        // Credit amount to merchant
        await tx.wallet.update({
          where: { id: receiverWallet.id },
          data: { balance: { increment: netToMerchant } },
        });
        
        // Credit commission to system/admin wallet if commission > 0
        if (totalCommission > 0) {
          const adminWallet = await tx.wallet.findUnique({
            where: { userId: 'admin' },
          });
          if (adminWallet) {
            await tx.wallet.update({
              where: { id: adminWallet.id },
              data: { balance: { increment: totalCommission } },
            });
          }
        }

        // 1. Préparation des données de transaction
        const transactionData: Prisma.TransactionCreateInput = {
          amount,
          type: 'payment',
          description: `Paiement QR à ${receiverWallet.id}`, // Ou mieux, nom du marchand si récupéré
          sender: { connect: { id: senderWallet.id } },
          receiver: { connect: { id: receiverWallet.id } },
          // --- ✨ CORRECTION : Mettre l'XP du SENDER ici ---
          xpGained: xpForSender,
          status: 'completed', // Assurer que le statut est défini
          commission: totalCommission, // Enregistrer la commission
        };

        // 2. Ajout du panier si fourni
        if (cart && cart.length > 0) {
          transactionData.cart = cart as any;
        }

        // 3. Création de la transaction
        await tx.transaction.create({ data: transactionData });
      }); // Fin de la transaction Prisma

      // Déduction du stock (si panier)
      if (cart && cart.length > 0) {
        try {
          const itemsToDecrease = cart.map((item) => ({
            id: item.id,
            quantity: item.quantity,
          }));
          // ✨ MODIFICATION ICI : Passer merchantUserId
          await this.productsService.decreaseStock(
            merchantUserId,
            itemsToDecrease,
          );
        } catch (stockError) {
          void 0;
          // Si l'erreur est BadRequestException (stock insuffisant), il faut l'envoyer au client
          if (stockError instanceof BadRequestException) {
            if (paymentRequestId) {
              this.paymentStatuses.set(paymentRequestId, 'failed');
            }
            throw stockError; // Relance l'erreur pour informer le client
          }
          // Pour les autres erreurs de stock, on log mais on ne bloque pas forcément le paiement déjà fait
        }
      }
      await this.merchantsService.checkSalesGoalAchievement(
        merchantUserId,
        amount,
      );

      // ... (Mise à jour statut polling, bonus parrainage, gamification, etc.) ...
      if (paymentRequestId) {
        this.paymentStatuses.set(paymentRequestId, 'completed');
      }

      // Vérification bonus parrainage
      await this.checkAndApplyReferralBonus(senderUserId);
      await this.checkAndApplyReferralBonus(merchantUserId); // Important : vérifier aussi le marchand

      // --- ✨ CORRECTION : Donner l'XP calculé au CLIENT et au MARCHAND ---
      if (xpForSender > 0) {
        await this.gamificationService.addXp(senderUserId, xpForSender);
        // Mettre à jour les missions du client si nécessaire
        await this.gamificationService.updateMissionProgress(
          senderUserId,
          'payment',
        );
      }
      if (xpForMerchant > 0) {
        await this.gamificationService.addXp(merchantUserId, xpForMerchant);
        // Mettre à jour les missions du marchand pour RECEIVE_PAYMENT
        await this.gamificationService.updateMissionProgress(
          merchantUserId,
          'RECEIVE_PAYMENT',
        );
      }
      // --- FIN CORRECTION ---

      // TODO: Ajouter des notifications pour sender et receiver

      return { message: 'Paiement effectué avec succès.' };
    } catch (error) {
      if (paymentRequestId) {
        this.paymentStatuses.set(paymentRequestId, 'failed');
      }
      // Rethrow l'erreur pour que NestJS la gère
      throw error;
    }
  }
  async refundItemsFromTransaction(
    merchantUserId: string,
    refundDto: RefundItemsDto,
  ) {
    const { transactionId, items: itemsToRefund = [], manualAmount } = refundDto;

    return this.prisma.$transaction(async (tx) => {
      const originalTransaction = await tx.transaction.findUnique({
        where: { id: transactionId },
        include: { sender: true, receiver: true },
      });

      if (!originalTransaction) {
        throw new NotFoundException('Transaction originale non trouvée.');
      }
      if (originalTransaction.receiver?.userId !== merchantUserId) {
        throw new UnauthorizedException('Action non autorisée.');
      }
      if (originalTransaction.status === 'refunded' && !manualAmount) {
        throw new ConflictException(
          'Cette transaction a déjà été entièrement remboursée.',
        );
      }

      const cart = originalTransaction.cart as any[];
      if (!cart && !manualAmount) {
        throw new BadRequestException(
          'Cette transaction ne contient aucun article à rembourser.',
        );
      }

      let refundAmount = 0;
      let updatedCart = cart || [];
      
      if (manualAmount !== undefined) {
        // Utiliser le montant manuel si fourni
        refundAmount = manualAmount;
        
        // Vérifier que le montant est positif
        if (refundAmount <= 0) {
          throw new BadRequestException('Le montant du remboursement doit être supérieur à zéro.');
        }
        
        // Vérifier que le montant ne dépasse pas le montant total de la transaction
        if (refundAmount > originalTransaction.amount) {
          throw new BadRequestException(
            `Le montant du remboursement (${refundAmount} DA) ne peut pas dépasser le montant total de la transaction (${originalTransaction.amount} DA).`,
          );
        }
      } else {
        // Logique de remboursement par articles
        updatedCart = cart.map((item) => {
          // Initialiser refundedQuantity s'il n'existe pas
          const refundedQty = item.refundedQuantity || 0;

          const itemToRefund = itemsToRefund.find((i) => i.id === item.id);
          if (itemToRefund) {
            const maxRefundable = item.quantity - refundedQty;
            if (itemToRefund.quantity > maxRefundable) {
              throw new BadRequestException(
                `Vous ne pouvez pas rembourser plus de ${maxRefundable} pour l'article "${item.name}".`,
              );
            }

            refundAmount += item.price * itemToRefund.quantity;
            return {
              ...item,
              refundedQuantity: refundedQty + itemToRefund.quantity,
            };
          }
          return item;
        });

        if (refundAmount <= 0) {
          throw new BadRequestException('Aucun article valide à rembourser.');
        }
      }

      const merchantWallet = await tx.wallet.findUnique({
        where: { userId: merchantUserId },
      });
      if (!merchantWallet || merchantWallet.balance < refundAmount) {
        throw new BadRequestException(
          'Solde insuffisant pour le remboursement.',
        );
      }

      // Mouvements d'argent
      await tx.wallet.update({
        where: { id: merchantWallet.id },
        data: { balance: { decrement: refundAmount } },
      });
      await tx.wallet.update({
        where: { id: originalTransaction.senderId! },
        data: { balance: { increment: refundAmount } },
      });

      const allRefunded = updatedCart.every(
        (item) => (item.refundedQuantity || 0) === item.quantity,
      );

      // Mettre à jour la transaction originale
      await tx.transaction.update({
        where: { id: transactionId },
        data: {
          cart: updatedCart as any,
          status: allRefunded ? 'refunded' : 'partially_refunded',
        },
      });

      // Créer une transaction de type "refund"
      await tx.transaction.create({
        data: {
          amount: refundAmount,
          type: 'refund',
          description: `Remboursement de ${itemsToRefund.length} article(s)`,
          senderId: merchantWallet.id,
          receiverId: originalTransaction.senderId!,
          status: 'completed',
          reference: transactionId,
          cart: itemsToRefund as any,
        },
      });

      return { message: 'Remboursement effectué avec succès.' };
    });
  }

  async sendMoney(senderUserId: string, sendMoneyDto: SendMoneyDto) {
    const {
      amount,
      receiverId,
      scheduleType = 'now',
      plannedDate,
    } = sendMoneyDto;

    // --- CORRECTION 2 : Calculer les XP avant la transaction ---
    const xpToAward =
      await this.gamificationService.calculateXpForTransaction('transfer');

    if (scheduleType === 'now') {
      // Immediate transfer with commission
      const result = await this.prisma.$transaction(async (tx) => {
        const senderWallet = await tx.wallet.findUnique({
          where: { userId: senderUserId },
        });
        if (!senderWallet)
          throw new NotFoundException(
            "Portefeuille de l'expéditeur non trouvé.",
          );

        // Calculate commission for send_money action using new CommissionsService
        const commission = await this.commissionsService.calculateCommission(
          'send_money',
          amount,
          AudienceRole.USER,
        );
        const totalToDeduct = amount + commission;

        if (senderWallet.balance < totalToDeduct)
          throw new BadRequestException('Solde insuffisant.');

        const receiverWallet = await tx.wallet.findUnique({
          where: { userId: receiverId },
        });
        if (!receiverWallet)
          throw new NotFoundException(
            'Portefeuille du destinataire non trouvé.',
          );
        if (senderWallet.id === receiverWallet.id)
          throw new BadRequestException(
            "Vous ne pouvez pas vous envoyer de l'argent à vous-même.",
          );

        // Deduct total (amount + commission) from sender
        await tx.wallet.update({
          where: { id: senderWallet.id },
          data: { balance: { decrement: totalToDeduct } },
        });
        // Credit amount to receiver
        await tx.wallet.update({
          where: { id: receiverWallet.id },
          data: { balance: { increment: amount } },
        });

        // Credit commission to system/admin wallet (assume userId = 'admin' for now)
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

        const receiver = await tx.user.findUnique({
          where: { id: receiverId },
        });
        if (!receiver)
          throw new NotFoundException('Utilisateur destinataire introuvable.');

        await (tx.transaction as any).create({
          data: {
            amount,
            type: 'transfer',
            description: `Transfert à ${receiver.username}`,
            senderId: senderWallet.id,
            receiverId: receiverWallet.id,
            xpGained: xpToAward,
            scheduledType: 'now',
            commission,
          },
        });
        return { message: 'Transfert effectué avec succès.', commission };
      });

      await this.checkAndApplyReferralBonus(senderUserId);
      await this.checkAndApplyReferralBonus(receiverId);

      await this.gamificationService.addXp(senderUserId, xpToAward);
      await this.gamificationService.updateMissionProgress(
        senderUserId,
        'TRANSFER',
      );

      return result;
    } else if (scheduleType === 'deferred' || scheduleType === 'planned') {
      // Save a planned/deferred transfer (not executed yet)
      await this.prisma.scheduledTransfer.create({
        data: {
          senderId: senderUserId,
          receiverId,
          amount,
          type: scheduleType,
          plannedDate: plannedDate ? new Date(plannedDate) : null,
          status: 'PENDING',
        },
      });
      return {
        message:
          scheduleType === 'deferred'
            ? 'Transfert différé enregistré.'
            : 'Transfert planifié enregistré.',
      };
    }
  }

  async recharge(userId: string, rechargeDto: RechargeDto) {
    // Vérifier que l'utilisateur est vérifié
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        identityVerification: {
          select: { status: true },
        },
      },
    });

    if (user?.identityVerification?.status !== 'VERIFIED') {
      throw new ForbiddenException(
        'Votre identité doit être vérifiée pour pouvoir recharger votre compte.',
      );
    }
    const { amount, reference } = rechargeDto;

    const wallet = await this.findOneByUserId(userId);
    if (!wallet) {
      throw new NotFoundException('Portefeuille non trouvé.');
    }

    // 👇 MODIFICATION PRINCIPALE ICI 👇
    // Nous créons maintenant une "RechargeRequest" pour que l'admin la valide.
    const newRechargeRequest = await this.prisma.rechargeRequest.create({
      data: {
        amount,
        reference,
        status: 'PENDING', // Le statut est explicitement mis en attente
        receiver: {
          // On lie la demande au portefeuille du client
          connect: {
            id: wallet.id,
          },
        },
      },
    });

    return {
      message:
        'Votre demande de recharge a été soumise et est en cours de vérification.',
      details: newRechargeRequest,
    };
  }

  getPaymentStatus(requestId: string) {
    const status = this.paymentStatuses.get(requestId);
    if (status === 'completed') {
      this.paymentStatuses.delete(requestId);
      return { status: 'completed' };
    }
    return { status: status || 'pending' };
  }

  async searchUsers(query: string, currentUserId: string) {
    if (!query || query.trim().length < 2) {
      return [];
    }
    return this.prisma.user.findMany({
      where: {
        id: { not: currentUserId },
        OR: [
          { username: { contains: query, mode: 'insensitive' } },
          { fullName: { contains: query, mode: 'insensitive' } },
          { email: { contains: query, mode: 'insensitive' } },
          { phoneNumber: { contains: query, mode: 'insensitive' } },
        ],
      },
      select: {
        id: true,
        username: true,
        fullName: true,
        phoneNumber: true,
      },
      take: 10,
    });
  }
  async getTransactionDetailsForMerchant(
    merchantUserId: string,
    transactionId: string,
  ) {
    const transaction = await this.prisma.transaction.findUnique({
      where: { id: transactionId },
      include: {
        sender: { include: { user: { select: { fullName: true } } } },
        receiver: { include: { user: { select: { fullName: true } } } },
      },
    });

    if (!transaction) {
      throw new NotFoundException('Transaction non trouvée.');
    }

    // On vérifie que le marchand est bien celui qui a reçu l'argent
    if (transaction.receiver?.userId !== merchantUserId) {
      throw new UnauthorizedException(
        'Cette transaction ne vous concerne pas.',
      );
    }

    // On peut maintenant retourner les détails nécessaires au frontend
    return {
      id: transaction.id,
      amount: transaction.amount,
      date: transaction.createdAt,
      clientName: transaction.sender?.user?.fullName || 'Client Inconnu',
      status: transaction.status,
      cart: transaction.cart,
    };
  }
  // NOUVELLE FONCTION POUR DEMANDER UN RETRAIT
  async requestWithdrawal(userId: string, amount: number, bankDetails: any) {
    const wallet = await this.findOneByUserId(userId);
    
    // Calculate commission for merchant_withdrawal action
    const commission = await this.commissionsService.calculateCommission(
      'merchant_withdrawal',
      amount,
      AudienceRole.MERCHANT,
    );
    const totalToDeduct = amount + commission;
    
    if (!wallet || wallet.balance < totalToDeduct) {
      throw new BadRequestException(
        'Solde insuffisant pour effectuer cette demande de retrait (commission incluse).',
      );
    }

    // Create withdrawal request with commission info
    const newRequest = await this.prisma.withdrawalRequest.create({
      data: {
        amount,
        userId,
        bankDetails, // On stocke les informations bancaires
        status: 'PENDING',
      },
    });
    // --- ✨ CORRECTION : AJOUT DE L'APPEL AU SERVICE DE GAMIFICATION ---
    try {
      // 1. On calcule l'XP à donner pour l'action
      const xpToAdd = await this.gamificationService.calculateXpForTransaction(
        'WITHDRAWAL_REQUEST', // L'identifiant de ton action
        userId, // L'ID du commerçant
      );

      if (xpToAdd > 0) {
        // 2. On ajoute l'XP
        await this.gamificationService.addXp(userId, xpToAdd);
      }

      // 3. On met à jour les missions
      await this.gamificationService.updateMissionProgress(
        userId,
        'WITHDRAWAL_REQUEST',
      );
    } catch (gamificationError) {
      void 0;
    }

    // Optionnel : Notifier l'admin, mais pour l'instant il verra la demande dans son dashboard

    return {
      message:
        'Votre demande de retrait a été soumise et sera étudiée par notre équipe.',
      request: newRequest,
    };
  }

  async getTransactions(userId: string) {
    const wallet = await this.findOneByUserId(userId);
    if (!wallet) throw new NotFoundException('Portefeuille non trouvé.');
    const txs = await this.prisma.transaction.findMany({
      where: { OR: [{ senderId: wallet.id }, { receiverId: wallet.id }] },
      include: {
        sender: {
          select: { user: { select: { username: true, fullName: true } } },
        },
        receiver: {
          select: { user: { select: { username: true, fullName: true } } },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 20,
    });
    // Always include commission in the response
    return txs.map((tx) => ({
      ...tx,
      commission: tx.commission ?? 0,
      cart: tx.cart,
      direction: tx.senderId === wallet.id ? 'debit' : 'credit',
    }));
  }

  async findOneByUserId(userId: string) {
    let wallet = await this.prisma.wallet.findUnique({ where: { userId } });
    if (!wallet) {
      wallet = await this.prisma.wallet.create({ data: { userId } });
    }
    return wallet;
  }

  async transferMoney({
    senderId,
    receiverId,
    amount,
    scheduledType = 'now',
    plannedDate,
    description,
  }: {
    senderId: string;
    receiverId: string;
    amount: number;
    scheduledType?: 'now' | 'deferred' | 'planned';
    plannedDate?: Date;
    description?: string;
  }) {
    if (scheduledType === 'now') {
      // Immediate transfer: create Transaction and update balances
      return this.prisma.$transaction(async (tx) => {
        // Deduct from sender
        await tx.wallet.update({
          where: { userId: senderId },
          data: { balance: { decrement: amount } },
        });
        // Add to receiver
        await tx.wallet.update({
          where: { userId: receiverId },
          data: { balance: { increment: amount } },
        });
        // Get wallet IDs (guaranteed to exist after update)
        const senderWallet = await tx.wallet.findUnique({
          where: { userId: senderId },
        });
        const receiverWallet = await tx.wallet.findUnique({
          where: { userId: receiverId },
        });
        if (!senderWallet || !receiverWallet)
          throw new Error('Wallet not found during transfer');
        // Create transaction record
        return tx.transaction.create({
          data: {
            amount,
            type: 'TRANSFER',
            description,
            senderId: senderWallet.id,
            receiverId: receiverWallet.id,
            status: 'completed',
            scheduledType: 'now',
          },
        });
      });
    } else {
      // Deferred or planned: create ScheduledTransfer, do NOT update balances yet
      return this.prisma.scheduledTransfer.create({
        data: {
          senderId,
          receiverId,
          amount,
          type: scheduledType,
          plannedDate,
          status: 'PENDING',
        },
      });
    }
  }

  // Add a method to process scheduled transfers (to be called by a cron job or manually)
  async processScheduledTransfers() {
    const now = new Date();
    const transfers = await this.prisma.scheduledTransfer.findMany({
      where: {
        status: 'PENDING',
        plannedDate: { lte: now },
      },
    });

    for (const transfer of transfers) {
      await this.prisma.$transaction(async (tx) => {
        // Deduct from sender
        await tx.wallet.update({
          where: { userId: transfer.senderId },
          data: { balance: { decrement: transfer.amount } },
        });
        // Add to receiver
        await tx.wallet.update({
          where: { userId: transfer.receiverId },
          data: { balance: { increment: transfer.amount } },
        });
        // Get wallet IDs (guaranteed to exist after update)
        const senderWallet = await tx.wallet.findUnique({
          where: { userId: transfer.senderId },
        });
        const receiverWallet = await tx.wallet.findUnique({
          where: { userId: transfer.receiverId },
        });
        if (!senderWallet || !receiverWallet)
          throw new Error(
            'Wallet not found during scheduled transfer processing',
          );
        // Create transaction record
        await tx.transaction.create({
          data: {
            amount: transfer.amount,
            type: 'TRANSFER',
            senderId: senderWallet.id,
            receiverId: receiverWallet.id,
            status: 'completed',
            scheduledType: transfer.type,
          },
        });
        // Mark scheduled transfer as completed
        await tx.scheduledTransfer.update({
          where: { id: transfer.id },
          data: { status: 'COMPLETED' },
        });
      });
    }
    return { processed: transfers.length };
  }

  async generateInvoicePdf(
    transactionId: string,
    requestingUserId: string,
  ): Promise<Buffer> {
    const transaction = await this.prisma.transaction.findUnique({
      where: { id: transactionId },
      include: {
        sender: { include: { user: { select: { fullName: true } } } },
        receiver: { include: { user: { select: { fullName: true } } } },
      },
    });

    if (!transaction) {
      throw new NotFoundException('Transaction non trouvée.');
    }
    if (
      transaction.sender?.userId !== requestingUserId &&
      transaction.receiver?.userId !== requestingUserId
    ) {
      throw new UnauthorizedException(
        "Vous n'êtes pas autorisé à accéder à cette facture.",
      );
    }

    return new Promise(async (resolve, reject) => {
      try {
        const doc = new PDFDocument({ size: 'A4', margin: 50 });
        const buffers: Buffer[] = [];
        doc.on('data', buffers.push.bind(buffers));
        doc.on('end', () => resolve(Buffer.concat(buffers)));

        // --- EN-TÊTE ---
        doc
          .fontSize(20)
          .font('Helvetica-Bold')
          .text('DINARY', { align: 'center' });
        doc
          .fontSize(12)
          .font('Helvetica')
          .text('Reçu de Paiement', { align: 'center' });
        doc.moveDown(2);

        // --- INFOS TRANSACTION ---
        doc.fontSize(10);
        doc.text(`De: ${transaction.sender?.user?.fullName || 'Inconnu'}`);
        doc.text(`À: ${transaction.receiver?.user?.fullName || 'Inconnu'}`);
        doc.text(
          `Date: ${new Date(transaction.createdAt).toLocaleString('fr-FR')}`,
        );
        doc.text(`ID Transaction: ${transaction.id}`);
        doc.moveDown(2);

        // --- TABLEAU DES ARTICLES ---
        const cart = (transaction.cart as any[]) || [];
        if (cart.length > 0) {
          doc.fontSize(12).font('Helvetica-Bold').text('Articles achetés');
          doc.moveDown();

          const tableTop = doc.y;
          const itemX = 50;
          const qtyX = 300;
          const priceX = 380;
          const totalX = 460;

          // Dessiner les en-têtes
          doc.fontSize(10).font('Helvetica-Bold');
          doc.text('Article', itemX, tableTop);
          doc.text('Qté', qtyX, tableTop, { width: 40, align: 'right' });
          doc.text('Prix Unitaire', priceX, tableTop, {
            width: 70,
            align: 'right',
          });
          doc.text('Total', totalX, tableTop, { width: 70, align: 'right' });
          doc.moveDown(0.5);
          const headerY = doc.y;
          doc
            .lineCap('butt')
            .moveTo(itemX, headerY)
            .lineTo(540, headerY)
            .stroke();

          // Dessiner les lignes
          doc.font('Helvetica');
          cart.forEach((item) => {
            const unitPrice =
              typeof item.price === 'number' && !isNaN(item.price)
                ? item.price
                : 0;
            const quantity =
              typeof item.quantity === 'number' && !isNaN(item.quantity)
                ? item.quantity
                : 0;
            doc.moveDown(0.5);
            const itemY = doc.y;
            doc.text(item.name || 'Article', itemX, itemY, { width: 240 });
            doc.text(quantity.toString(), qtyX, itemY, {
              width: 40,
              align: 'right',
            });
            doc.text(`${unitPrice.toFixed(2)}`, priceX, itemY, {
              width: 70,
              align: 'right',
            });
            doc.text(
              `${(unitPrice * quantity).toFixed(2)}`,
              totalX,
              itemY,
              { width: 70, align: 'right' },
            );
          });
          doc.moveDown(0.5);
          const tableBottomY = doc.y;
          doc
            .lineCap('butt')
            .moveTo(itemX, tableBottomY)
            .lineTo(540, tableBottomY)
            .stroke();
        }

        // --- TOTAL FINAL ---
        doc.moveDown(1);
        doc.fontSize(12).font('Helvetica-Bold');
        doc.text('Montant Total:', 350, doc.y, { align: 'right', width: 100 });
        doc.text(`${transaction.amount.toFixed(2)} DA`, 460, doc.y, {
          align: 'right',
          width: 70,
        });
        
        // Afficher la commission si elle existe
        if (transaction.commission && transaction.commission > 0) {
          doc.moveDown(0.5);
          doc.fontSize(10).font('Helvetica');
          doc.text('Commission:', 350, doc.y, { align: 'right', width: 100 });
          doc.text(`${transaction.commission.toFixed(2)} DA`, 460, doc.y, {
            align: 'right',
            width: 70,
          });
        }
        
        doc.moveDown(3);

        // --- QR CODE DE REMBOURSEMENT ---
        // Afficher uniquement pour les paiements ET si c'est le CLIENT qui demande (pas le marchand)
        const isPayment = transaction.type === 'payment';
        const isClientRequesting = transaction.sender?.userId === requestingUserId;
        
        if (isPayment && isClientRequesting) {
          const qrCodeData = JSON.stringify({ transactionId: transaction.id });
          const qrCodeImage = await QRCode.toDataURL(qrCodeData);
          doc.image(qrCodeImage, { fit: [100, 100], align: 'center' });
          doc.moveDown(0.5);
          doc
            .fontSize(8)
            .font('Helvetica')
            .text('QR Code de remboursement', { align: 'center' });
          doc
            .fontSize(7)
            .font('Helvetica')
            .text('Présentez ce code au commerçant pour un remboursement', { align: 'center' });
        }

        // --- PIED DE PAGE ---
        doc
          .fontSize(10)
          .font('Helvetica')
          .text("Merci d'utiliser Dinary.", 50, 750, { align: 'center' });

        doc.end();
      } catch (error) {
        reject(error);
      }
    });
  }
  async refundTransaction(merchantUserId: string, transactionId: string) {
    return this.prisma.$transaction(async (tx) => {
      // 1. Trouver la transaction originale
      const originalTransaction = await tx.transaction.findUnique({
        where: { id: transactionId },
        include: { sender: true, receiver: true },
      });

      if (!originalTransaction) {
        throw new NotFoundException('Transaction originale non trouvée.');
      }

      // 2. Vérifier que le demandeur est bien le marchand qui a reçu l'argent
      if (originalTransaction.receiver?.userId !== merchantUserId) {
        throw new UnauthorizedException(
          "Vous n'êtes pas autorisé à rembourser cette transaction.",
        );
      }

      // 3. Vérifier que la transaction n'est pas déjà remboursée
      if (originalTransaction.status === 'refunded') {
        throw new ConflictException('Cette transaction a déjà été remboursée.');
      }

      // 4. Vérifier que le marchand a assez d'argent pour rembourser
      const merchantWallet = await tx.wallet.findUnique({
        where: { userId: merchantUserId },
      });
      if (
        !merchantWallet ||
        merchantWallet.balance < originalTransaction.amount
      ) {
        throw new BadRequestException(
          'Solde insuffisant pour effectuer le remboursement.',
        );
      }

      // 5. Effectuer le mouvement d'argent inverse
      // Débiter le marchand
      await tx.wallet.update({
        where: { id: merchantWallet.id },
        data: { balance: { decrement: originalTransaction.amount } },
      });
      // Créditer le client (l'expéditeur original)
      await tx.wallet.update({
        where: { id: originalTransaction.senderId! },
        data: { balance: { increment: originalTransaction.amount } },
      });

      // 6. Mettre à jour le statut de la transaction originale
      await tx.transaction.update({
        where: { id: transactionId },
        data: { status: 'refunded' },
      });

      // 7. Créer une nouvelle transaction de type "refund" pour l'historique
      const refundTransaction = await tx.transaction.create({
        data: {
          amount: originalTransaction.amount,
          type: 'refund',
          description: `Remboursement pour la transaction ${transactionId.substring(0, 8)}`,
          senderId: merchantWallet.id, // Le marchand est maintenant l'expéditeur
          receiverId: originalTransaction.senderId!, // Le client est le destinataire
          status: 'completed',
          reference: transactionId, // Référence à la transaction originale
        },
      });

      return {
        message: 'Remboursement effectué avec succès.',
        refundTransaction,
      };
    });
  }
}
