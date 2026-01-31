import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCommissionRuleDto } from './dto/create-commission-rule.dto';
import { UpdateCommissionRuleDto } from './dto/update-commission-rule.dto';
import { AudienceRole } from '@prisma/client';

@Injectable()
export class CommissionsService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Crée une nouvelle règle de commission
   */
  async createRule(createDto: CreateCommissionRuleDto) {
    return this.prisma.commissionRule.create({
      data: {
        action: createDto.action,
        type: createDto.type,
        value: createDto.value,
        minAmount: createDto.minAmount,
        maxAmount: createDto.maxAmount,
        isActive: createDto.isActive !== undefined ? createDto.isActive : true,
        target: createDto.target || AudienceRole.USER,
      },
    });
  }

  /**
   * Récupère toutes les règles de commission
   */
  async getAllRules(target?: AudienceRole) {
    const where = target ? { target } : {};
    return this.prisma.commissionRule.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Récupère uniquement les règles de commission actives
   * Utilisé par le frontend public
   */
  async getActiveRules(target?: AudienceRole) {
    const where: any = { isActive: true };
    if (target) {
      where.target = target;
    }
    return this.prisma.commissionRule.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Récupère une règle spécifique par ID
   */
  async getRuleById(id: string) {
    return this.prisma.commissionRule.findUnique({
      where: { id },
    });
  }

  /**
   * Met à jour une règle de commission
   */
  async updateRule(id: string, updateDto: UpdateCommissionRuleDto) {
    return this.prisma.commissionRule.update({
      where: { id },
      data: {
        ...(updateDto.action && { action: updateDto.action }),
        ...(updateDto.type && { type: updateDto.type }),
        ...(updateDto.value !== undefined && { value: updateDto.value }),
        ...(updateDto.minAmount !== undefined && { minAmount: updateDto.minAmount }),
        ...(updateDto.maxAmount !== undefined && { maxAmount: updateDto.maxAmount }),
        ...(updateDto.isActive !== undefined && { isActive: updateDto.isActive }),
        ...(updateDto.target && { target: updateDto.target }),
      },
    });
  }

  /**
   * Supprime une règle de commission
   */
  async deleteRule(id: string) {
    return this.prisma.commissionRule.delete({
      where: { id },
    });
  }

  /**
   * Calcule la commission pour une transaction donnée
   * @param action Type d'action (send_money, merchant_payment, etc.)
   * @param amount Montant de la transaction
   * @param target Cible (USER ou MERCHANT)
   * @returns Montant de la commission
   */
  async calculateCommission(
    action: string,
    amount: number,
    target: AudienceRole = AudienceRole.USER,
  ): Promise<number> {
    const rule = await this.prisma.commissionRule.findFirst({
      where: {
        action,
        target,
        isActive: true,
      },
    });

    if (!rule) return 0;

    // Vérifier si le montant est dans la plage définie
    if (rule.minAmount && amount < rule.minAmount) return 0;
    if (rule.maxAmount && amount > rule.maxAmount) return 0;

    // Calculer la commission
    let commission = 0;
    if (rule.type === 'fixed') {
      commission = rule.value;
    } else if (rule.type === 'percentage') {
      commission = (amount * rule.value) / 100;
    }

    return commission;
  }

  /**
   * Calcule les revenus de la plateforme basés sur les commissions des transactions
   * @param startDate Date de début (optionnel)
   * @param endDate Date de fin (optionnel)
   * @returns Statistiques détaillées des revenus
   */
  async getPlatformRevenues(startDate?: Date, endDate?: Date) {
    const whereClause: any = {
      commission: { gt: 0 }, // Récupérer uniquement les transactions avec commission > 0
    };
    
    if (startDate || endDate) {
      whereClause.createdAt = {};
      if (startDate) whereClause.createdAt.gte = startDate;
      if (endDate) whereClause.createdAt.lte = endDate;
    }

    // Récupérer toutes les transactions avec leurs commissions
    const transactions = await this.prisma.transaction.findMany({
      where: whereClause,
      select: {
        id: true,
        amount: true,
        type: true,
        commission: true,
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

    // Calculer les statistiques
    const totalRevenue = transactions.reduce(
      (sum, tx) => sum + (tx.commission || 0),
      0,
    );

    // Grouper par type de transaction
    const revenueByType: Record<string, { count: number; total: number }> = {};
    
    transactions.forEach((tx) => {
      const type = tx.type || 'UNKNOWN';
      if (!revenueByType[type]) {
        revenueByType[type] = { count: 0, total: 0 };
      }
      revenueByType[type].count++;
      revenueByType[type].total += tx.commission || 0;
    });

    // Préparer l'historique détaillé
    const history = transactions.map((tx) => ({
      id: tx.id,
      date: tx.createdAt.toISOString(),
      type: tx.type?.toUpperCase() || 'UNKNOWN', // Retourner en majuscules pour correspondre au frontend
      transactionAmount: tx.amount,
      commissionAmount: tx.commission || 0,
      commissionRate: tx.commission ? ((tx.commission / tx.amount) * 100).toFixed(2) + '%' : '0%',
      senderName: tx.sender?.user?.fullName || null,
      senderEmail: tx.sender?.user?.email || null,
      receiverName: tx.receiver?.user?.fullName || null,
      receiverEmail: tx.receiver?.user?.email || null,
      details: this.getTransactionTypeLabel(tx.type || 'UNKNOWN'),
    }));

    return {
      totalRevenue,
      transactionCount: transactions.length,
      revenueByType,
      history,
    };
  }

  /**
   * Helper pour obtenir le label d'un type de transaction
   */
  private getTransactionTypeLabel(type: string): string {
    const labels: Record<string, string> = {
      PAYMENT: 'Paiement en magasin',
      TRANSFER: 'Virement instantané',
      RECHARGE: 'Recharge compte',
      WITHDRAWAL: 'Retrait vers compte bancaire',
    };
    return labels[type] || type;
  }
}

