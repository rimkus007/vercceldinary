// src/admin/ledger.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export interface LedgerLine {
  id: string;
  date: string;
  description: string | null;
  type: string;
  amount: number;
  direction: 'debit' | 'credit';
  counterpart: string;
  runningBalance: number;
}

export interface UserLedgerResponse {
  lines: LedgerLine[];
  openingBalance: number;
  closingBalance: number;
}

@Injectable()
export class LedgerService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Renvoie le livret d'un utilisateur au format { lines, openingBalance, closingBalance }.
   * from/to sont des Date (optionnelles).
   */
  async getUserLedger(
    userId: string,
    from?: Date,
    to?: Date,
  ): Promise<UserLedgerResponse> {
    // ⚠️ Adapte ces requêtes Prisma à ton schéma réel.
    // Ici on suppose une table Transaction avec createdAt, amount, type, senderId, receiverId, description
    // et des relations vers sender/receiver -> user.fullName (ajuste si besoin).

    // 1) Calcule un solde d’ouverture (avant la période "from")
    let openingBalance = 0;

    if (from) {
      // somme (crédits - débits) avant 'from'
      const [sumCredits, sumDebits] = await Promise.all([
        this.prisma.transaction.aggregate({
          where: {
            receiverId: userId,
            createdAt: { lt: from },
          },
          _sum: { amount: true },
        }),
        this.prisma.transaction.aggregate({
          where: {
            senderId: userId,
            createdAt: { lt: from },
          },
          _sum: { amount: true },
        }),
      ]);

      const credits = Number(sumCredits._sum.amount ?? 0);
      const debits = Number(sumDebits._sum.amount ?? 0);
      openingBalance = credits - debits;
    }

    // 2) Récupère les transactions dans la fenêtre [from, to]
    const txs = await this.prisma.transaction.findMany({
      where: {
        OR: [{ senderId: userId }, { receiverId: userId }],
        ...(from ? { createdAt: { gte: from } } : {}),
        ...(to ? { createdAt: { lte: to } } : {}),
      },
      orderBy: { createdAt: 'asc' },
      include: {
        sender: { include: { user: true } },
        receiver: { include: { user: true } },
      },
    });

    // 3) Construit les lignes avec runningBalance
    const lines: LedgerLine[] = [];
    let runningBalance = openingBalance;

    for (const tx of txs) {
      const isDebit = tx.senderId === userId;
      runningBalance += isDebit ? -Number(tx.amount) : Number(tx.amount);

      lines.push({
        id: tx.id,
        date: tx.createdAt.toISOString(),
        description: tx.description ?? null,
        type: tx.type,
        amount: Number(tx.amount),
        direction: isDebit ? 'debit' : 'credit',
        counterpart: isDebit
          ? tx.receiver?.user?.fullName || 'Bénéficiaire inconnu'
          : tx.sender?.user?.fullName || 'Expéditeur inconnu',
        runningBalance,
      });
    }

    const closingBalance = lines.length
      ? lines[lines.length - 1].runningBalance
      : openingBalance;

    return { lines, openingBalance, closingBalance };
  }
}
