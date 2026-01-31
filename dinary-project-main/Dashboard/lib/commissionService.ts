// Service de gestion des commissions
import {
  Commission,
  CommissionRule,
  CommissionPayout,
  CommissionSummary,
  CommissionReport,
  CommissionFilters,
  PayoutFilters,
  CommissionStructure,
  CommissionCondition,
} from "@/types/commission";

import {
  mockCommissions,
  mockCommissionRules,
  mockPayouts,
  mockCommissionSummary,
  mockCommissionReport,
  simulateNetworkDelay,
  generateMockCommission,
} from "./mock-commission-data";

class CommissionService {
  private commissions: Commission[] = [...mockCommissions];

  private payouts: CommissionPayout[] = [...mockPayouts];

  // === GESTION DES COMMISSIONS ===

  async getCommissions(filters?: CommissionFilters): Promise<Commission[]> {
    await simulateNetworkDelay();

    let filteredCommissions = [...this.commissions];

    if (filters) {
      if (filters.type?.length) {
        filteredCommissions = filteredCommissions.filter((c) =>
          filters.type!.includes(c.type)
        );
      }

      if (filters.status?.length) {
        filteredCommissions = filteredCommissions.filter((c) =>
          filters.status!.includes(c.status)
        );
      }

      if (filters.userId) {
        filteredCommissions = filteredCommissions.filter(
          (c) => c.userId === filters.userId
        );
      }

      if (filters.merchantId) {
        filteredCommissions = filteredCommissions.filter(
          (c) => c.merchantId === filters.merchantId
        );
      }

      if (filters.dateFrom) {
        filteredCommissions = filteredCommissions.filter(
          (c) => new Date(c.createdAt) >= new Date(filters.dateFrom!)
        );
      }

      if (filters.dateTo) {
        filteredCommissions = filteredCommissions.filter(
          (c) => new Date(c.createdAt) <= new Date(filters.dateTo!)
        );
      }

      if (filters.minAmount !== undefined) {
        filteredCommissions = filteredCommissions.filter(
          (c) => c.calculatedAmount >= filters.minAmount!
        );
      }

      if (filters.maxAmount !== undefined) {
        filteredCommissions = filteredCommissions.filter(
          (c) => c.calculatedAmount <= filters.maxAmount!
        );
      }

      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        filteredCommissions = filteredCommissions.filter(
          (c) =>
            c.description.toLowerCase().includes(searchLower) ||
            c.id.toLowerCase().includes(searchLower) ||
            c.transactionId.toLowerCase().includes(searchLower)
        );
      }
    }

    return filteredCommissions.sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  async getCommissionById(id: string): Promise<Commission | null> {
    await simulateNetworkDelay(300);
    return this.commissions.find((c) => c.id === id) || null;
  }

  async createCommission(
    commissionData: Omit<Commission, "id" | "createdAt">
  ): Promise<Commission> {
    await simulateNetworkDelay();

    const newCommission: Commission = {
      ...commissionData,

      createdAt: new Date().toISOString(),
    };

    this.commissions.unshift(newCommission);
    return newCommission;
  }

  async updateCommissionStatus(
    id: string,
    status: Commission["status"],
    metadata?: Record<string, any>
  ): Promise<Commission> {
    await simulateNetworkDelay();

    const commissionIndex = this.commissions.findIndex((c) => c.id === id);
    if (commissionIndex === -1) {
      throw new Error("Commission non trouvée");
    }

    const updatedCommission = {
      ...this.commissions[commissionIndex],
      status,
      ...(status === "approved" && { processedAt: new Date().toISOString() }),
      ...(status === "paid" && { paidAt: new Date().toISOString() }),
      ...(metadata && {
        metadata: {
          ...this.commissions[commissionIndex].metadata,
          ...metadata,
        },
      }),
    };

    this.commissions[commissionIndex] = updatedCommission;
    return updatedCommission;
  }

  async deleteCommission(id: string): Promise<void> {
    await simulateNetworkDelay();

    const index = this.commissions.findIndex((c) => c.id === id);
    if (index === -1) {
      throw new Error("Commission non trouvée");
    }

    this.commissions.splice(index, 1);
  }

  // === GESTION DES PAYOUTS ===

  async getPayouts(filters?: PayoutFilters): Promise<CommissionPayout[]> {
    await simulateNetworkDelay();
    let filteredPayouts = [...this.payouts];
    if (filters) {
      if (filters.status?.length) {
        filteredPayouts = filteredPayouts.filter((p) =>
          filters.status!.includes(p.status)
        );
      }
      // ...existing code...
    }
    // ...existing code...
    return filteredPayouts.sort(
      (a, b) =>
        new Date(b.scheduledDate).getTime() -
        new Date(a.scheduledDate).getTime()
    );
  }

  // === GESTION DES RÈGLES (API vers backend NestJS) ===

  apiUrl = process.env.NEXT_PUBLIC_API_URL || "";

  async getCommissionRules(token: string): Promise<CommissionRule[]> {
    const res = await fetch(`${this.apiUrl}/admin`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error("Erreur lors du chargement des règles");
    const rules: CommissionRule[] = await res.json();
    return rules.sort((a, b) => a.priority - b.priority);
  }

  async getCommissionRuleById(
    id: string,
    token: string
  ): Promise<CommissionRule | null> {
    const res = await fetch(`${this.apiUrl}/admin/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error("Erreur lors du chargement de la règle");
    return await res.json();
  }

  async createCommissionRule(
    ruleData: Omit<CommissionRule, "id" | "createdAt" | "updatedAt">,
    token: string
  ): Promise<CommissionRule> {
    const res = await fetch(`${this.apiUrl}/admin`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(ruleData),
    });
    if (!res.ok) throw new Error("Erreur lors de la création de la règle");
    return await res.json();
  }

  async updateCommissionRule(
    id: string,
    updates: Partial<CommissionRule>,
    token: string
  ): Promise<CommissionRule> {
    const res = await fetch(`${this.apiUrl}/admin/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(updates),
    });
    if (!res.ok) throw new Error("Erreur lors de la mise à jour de la règle");
    return await res.json();
  }

  async deleteCommissionRule(id: string, token: string): Promise<void> {
    const res = await fetch(`${this.apiUrl}/admin/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error("Erreur lors de la suppression de la règle");
    return;
  }

  async toggleRuleStatus(id: string, token: string): Promise<CommissionRule> {
    // Fetch rule, toggle isActive, then update
    const rule = await this.getCommissionRuleById(id, token);
    if (!rule) throw new Error("Règle non trouvée");
    return this.updateCommissionRule(id, { isActive: !rule.isActive }, token);
  }

  async updatePayoutStatus(
    id: string,
    status: CommissionPayout["status"],
    metadata?: Record<string, any>
  ): Promise<CommissionPayout> {
    await simulateNetworkDelay();

    const payoutIndex = this.payouts.findIndex((p) => p.id === id);
    if (payoutIndex === -1) {
      throw new Error("Payout non trouvé");
    }

    const updatedPayout = {
      ...this.payouts[payoutIndex],
      status,
      ...(status === "completed" && {
        processedDate: new Date().toISOString(),
      }),
      ...(metadata && {
        metadata: { ...this.payouts[payoutIndex].metadata, ...metadata },
      }),
    };

    this.payouts[payoutIndex] = updatedPayout;

    // Mettre à jour le statut des commissions si nécessaire
    if (status === "completed") {
      for (const commissionId of updatedPayout.commissionIds) {
        await this.updateCommissionStatus(commissionId, "paid");
      }
    }

    return updatedPayout;
  }
  // === ANALYTICS ET RAPPORTS ===

  async getCommissionSummary(filters?: any): Promise<CommissionSummary> {
    await simulateNetworkDelay();

    // Filtrer les commissions si des filtres sont fournis
    let filteredCommissions = [...this.commissions];

    if (filters) {
      if (filters.dateFrom) {
        filteredCommissions = filteredCommissions.filter(
          (c) => new Date(c.createdAt) >= new Date(filters.dateFrom)
        );
      }
      if (filters.dateTo) {
        filteredCommissions = filteredCommissions.filter(
          (c) => new Date(c.createdAt) <= new Date(filters.dateTo)
        );
      }
    }

    // Calculer les métriques dynamiquement
    const totalCommissions = filteredCommissions.length;
    const pendingCommissions = filteredCommissions.filter(
      (c) => c.status === "pending"
    ).length;
    const paidCommissions = filteredCommissions.filter(
      (c) => c.status === "paid"
    ).length;
    const totalAmount = filteredCommissions.reduce(
      (sum, c) => sum + c.calculatedAmount,
      0
    );
    const pendingAmount = filteredCommissions
      .filter((c) => c.status === "pending")
      .reduce((sum, c) => sum + c.calculatedAmount, 0);
    const paidAmount = filteredCommissions
      .filter((c) => c.status === "paid")
      .reduce((sum, c) => sum + c.calculatedAmount, 0);
    const averageCommission =
      totalCommissions > 0 ? totalAmount / totalCommissions : 0;

    // Calculer les top earners
    const earnerMap = new Map<
      string,
      { totalEarned: number; count: number; userName: string }
    >();
    filteredCommissions.forEach((c) => {
      const existing = earnerMap.get(c.userId) || {
        totalEarned: 0,
        count: 0,
        userName: c.userId,
      };
      existing.totalEarned += c.calculatedAmount;
      existing.count += 1;
      earnerMap.set(c.userId, existing);
    });

    const topEarners = Array.from(earnerMap.entries())
      .map(([userId, data]) => ({
        userId,
        userName: data.userName,
        totalEarned: data.totalEarned,
        commissionsCount: data.count,
        averageCommission: data.totalEarned / data.count,
      }))
      .sort((a, b) => b.totalEarned - a.totalEarned)
      .slice(0, 10);

    // Activité récente
    const recentActivity = filteredCommissions
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )
      .slice(0, 10)
      .map((c) => ({
        id: `activity_${c.id}`,
        type: "commission_earned" as const,
        description: `Commission ${c.type} générée`,
        amount: c.calculatedAmount,
        userId: c.userId,
        createdAt: c.createdAt,
      }));

    return {
      totalCommissions,
      pendingCommissions,
      paidCommissions,
      totalAmount,
      pendingAmount,
      paidAmount,
      averageCommission,
      topEarners,
      recentActivity,
    };
  }

  async getCommissionReport(period: string): Promise<CommissionReport> {
    await simulateNetworkDelay();

    // Calculer les dates selon la période
    const now = new Date();
    let startDate = new Date();

    switch (period) {
      case "7d":
        startDate.setDate(now.getDate() - 7);
        break;
      case "30d":
        startDate.setDate(now.getDate() - 30);
        break;
      case "90d":
        startDate.setDate(now.getDate() - 90);
        break;
      case "1y":
        startDate.setFullYear(now.getFullYear() - 1);
        break;
      default:
        startDate.setDate(now.getDate() - 30);
    }

    // Filtrer les commissions pour la période
    const filteredCommissions = this.commissions.filter(
      (c) => new Date(c.createdAt) >= startDate
    );

    const totalCommissions = filteredCommissions.length;
    const totalAmount = filteredCommissions.reduce(
      (sum, c) => sum + c.calculatedAmount,
      0
    );

    // Répartition par type
    const byType: Record<string, { count: number; amount: number }> = {};
    const types = [
      "transaction",
      "referral",
      "merchant_onboarding",
      "user_registration",
      "subscription",
      "affiliate",
      "performance",
      "bonus",
      "custom",
    ];
    types.forEach((type) => {
      const typeCommissions = filteredCommissions.filter(
        (c) => c.type === type
      );
      byType[type] = {
        count: typeCommissions.length,
        amount: typeCommissions.reduce((sum, c) => sum + c.calculatedAmount, 0),
      };
    });

    // Répartition par statut
    const byStatus: Record<string, { count: number; amount: number }> = {};
    const statuses = [
      "pending",
      "calculated",
      "approved",
      "paid",
      "cancelled",
      "disputed",
      "expired",
    ];
    statuses.forEach((status) => {
      const statusCommissions = filteredCommissions.filter(
        (c) => c.status === status
      );
      byStatus[status] = {
        count: statusCommissions.length,
        amount: statusCommissions.reduce(
          (sum, c) => sum + c.calculatedAmount,
          0
        ),
      };
    });

    // Top earners pour le rapport
    const earnerMap = new Map<string, { totalEarned: number; count: number }>();
    filteredCommissions.forEach((c) => {
      const existing = earnerMap.get(c.userId) || { totalEarned: 0, count: 0 };
      existing.totalEarned += c.calculatedAmount;
      existing.count += 1;
      earnerMap.set(c.userId, existing);
    });

    const topEarners = Array.from(earnerMap.entries())
      .map(([userId, data]) => ({
        userId,
        userName: `User ${userId}`,
        totalEarned: data.totalEarned,
        commissionsCount: data.count,
        averageCommission: data.totalEarned / data.count,
      }))
      .sort((a, b) => b.totalEarned - a.totalEarned)
      .slice(0, 5);

    // Tendances quotidiennes
    const trends = [];
    const daysToShow = period === "7d" ? 7 : period === "30d" ? 30 : 7;

    for (let i = daysToShow - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split("T")[0];

      const dayCommissions = filteredCommissions.filter((c) =>
        c.createdAt.startsWith(dateStr)
      );

      const totalAmount = dayCommissions.reduce(
        (sum, c) => sum + c.calculatedAmount,
        0
      );
      const count = dayCommissions.length;

      trends.push({
        date: dateStr,
        commissionsCount: count,
        totalAmount,
        averageAmount: count > 0 ? totalAmount / count : 0,
      });
    }

    return {
      period,
      totalCommissions,
      totalAmount,
      byType: byType as any,
      byStatus: byStatus as any,
      topEarners,
      trends,
    };
  }

  // === MÉTHODES UTILITAIRES ===

  async exportCommissions(filters?: CommissionFilters): Promise<Blob> {
    await simulateNetworkDelay();

    const commissions = await this.getCommissions(filters);

    // Générer CSV
    const headers = [
      "ID",
      "Type",
      "Utilisateur",
      "Montant",
      "Commission",
      "Statut",
      "Date",
    ];
    const csvContent = [
      headers.join(","),
      ...commissions.map((c) =>
        [
          c.id,
          c.type,
          c.userId,
          c.amount,
          c.calculatedAmount,
          c.status,
          c.createdAt,
        ].join(",")
      ),
    ].join("\n");

    return new Blob([csvContent], { type: "text/csv" });
  }

  async exportPayouts(filters?: PayoutFilters): Promise<Blob> {
    await simulateNetworkDelay();

    const payouts = await this.getPayouts(filters);

    // Générer CSV
    const headers = [
      "ID",
      "Utilisateur",
      "Montant",
      "Méthode",
      "Statut",
      "Date programmée",
      "Date traitée",
    ];
    const csvContent = [
      headers.join(","),
      ...payouts.map((p) =>
        [
          p.id,
          p.userId,
          p.totalAmount,
          p.method,
          p.status,
          p.scheduledDate,
          p.processedDate || "",
        ].join(",")
      ),
    ].join("\n");

    return new Blob([csvContent], { type: "text/csv" });
  }

  // === GESTION DES NOTIFICATIONS ===

  async getCommissionNotifications(): Promise<
    Array<{
      id: string;
      type: "commission_ready" | "payout_scheduled" | "rule_updated";
      message: string;
      data?: any;
      createdAt: string;
    }>
  > {
    await simulateNetworkDelay();

    const notifications = [];

    // Commissions en attente d'approbation
    const pendingApproval = this.commissions.filter(
      (c) => c.status === "calculated"
    );
    if (pendingApproval.length > 0) {
      notifications.push({
        id: "notif_pending_approval",
        type: "commission_ready" as const,
        message: `${pendingApproval.length} commission(s) en attente d'approbation`,
        data: { count: pendingApproval.length },
        createdAt: new Date().toISOString(),
      });
    }

    // Payouts programmés pour aujourd'hui
    const today = new Date().toISOString().split("T")[0];
    const todayPayouts = this.payouts.filter(
      (p) => p.scheduledDate.startsWith(today) && p.status === "scheduled"
    );
    if (todayPayouts.length > 0) {
      notifications.push({
        id: "notif_payouts_today",
        type: "payout_scheduled" as const,
        message: `${todayPayouts.length} payout(s) programmé(s) pour aujourd'hui`,
        data: { count: todayPayouts.length },
        createdAt: new Date().toISOString(),
      });
    }

    return notifications;
  }

  // === MÉTHODES DE RECHERCHE ET FILTRAGE AVANCÉES ===

  async searchCommissions(query: string): Promise<Commission[]> {
    await simulateNetworkDelay();

    const searchLower = query.toLowerCase();
    return this.commissions.filter(
      (c) =>
        c.id.toLowerCase().includes(searchLower) ||
        c.transactionId.toLowerCase().includes(searchLower) ||
        c.userId.toLowerCase().includes(searchLower) ||
        c.description.toLowerCase().includes(searchLower) ||
        c.type.toLowerCase().includes(searchLower)
    );
  }

  async getCommissionsByUser(userId: string): Promise<Commission[]> {
    await simulateNetworkDelay();
    return this.commissions.filter((c) => c.userId === userId);
  }

  async getCommissionsByMerchant(merchantId: string): Promise<Commission[]> {
    await simulateNetworkDelay();
    return this.commissions.filter((c) => c.merchantId === merchantId);
  }

  // === VALIDATION ET CONTRÔLES ===

  async validateCommissionRule(rule: Partial<CommissionRule>): Promise<{
    isValid: boolean;
    errors: string[];
  }> {
    await simulateNetworkDelay(200);

    const errors: string[] = [];

    if (!rule.name || rule.name.trim().length < 3) {
      errors.push("Le nom de la règle doit contenir au moins 3 caractères");
    }

    if (!rule.type) {
      errors.push("Le type de commission est requis");
    }

    if (!rule.structure) {
      errors.push("La structure de commission est requise");
    } else {
      if (!rule.structure.type) {
        errors.push("Le type de structure est requis");
      }

      if (
        ["fixed", "percentage"].includes(rule.structure.type) &&
        !rule.structure.value
      ) {
        errors.push("La valeur de la commission est requise");
      }

      if (rule.structure.type === "percentage" && rule.structure.value! > 100) {
        errors.push("Le pourcentage ne peut pas dépasser 100%");
      }

      if (
        rule.structure.minAmount &&
        rule.structure.maxAmount &&
        rule.structure.minAmount > rule.structure.maxAmount
      ) {
        errors.push(
          "Le montant minimum ne peut pas être supérieur au montant maximum"
        );
      }
    }

    if (rule.priority && (rule.priority < 1 || rule.priority > 100)) {
      errors.push("La priorité doit être comprise entre 1 et 100");
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  // === STATISTIQUES DÉTAILLÉES ===

  async getCommissionStats(period: string = "30d"): Promise<{
    totalEarnings: number;
    totalTransactions: number;
    averageCommissionRate: number;
    topPerformingRules: Array<{
      ruleId: string;
      ruleName: string;
      commissionsGenerated: number;
      totalAmount: number;
    }>;
    monthlyGrowth: number;
    conversionRate: number;
  }> {
    await simulateNetworkDelay();

    const now = new Date();
    const periodDays = period === "7d" ? 7 : period === "30d" ? 30 : 90;
    const startDate = new Date(
      now.getTime() - periodDays * 24 * 60 * 60 * 1000
    );

    const periodCommissions = this.commissions.filter(
      (c) => new Date(c.createdAt) >= startDate
    );

    const totalEarnings = periodCommissions.reduce(
      (sum, c) => sum + c.calculatedAmount,
      0
    );
    const totalTransactions = periodCommissions.length;
    const averageCommissionRate =
      totalTransactions > 0
        ? (totalEarnings /
            periodCommissions.reduce((sum, c) => sum + c.amount, 0)) *
          100
        : 0;

    // Analyse des règles les plus performantes
    const rulePerformance = new Map<
      string,
      { name: string; count: number; amount: number }
    >();

    periodCommissions.forEach((c) => {
      // Simuler l'association à une règle
      const ruleId = "rule_001"; // En réalité, on aurait l'ID de la règle qui a généré cette commission
      const rule = this.rules.find((r) => r.id === ruleId);

      if (rule) {
        const existing = rulePerformance.get(ruleId) || {
          name: rule.name,
          count: 0,
          amount: 0,
        };
        existing.count += 1;
        existing.amount += c.calculatedAmount;
        rulePerformance.set(ruleId, existing);
      }
    });

    const topPerformingRules = Array.from(rulePerformance.entries())
      .map(([ruleId, data]) => ({
        ruleId,
        ruleName: data.name,
        commissionsGenerated: data.count,
        totalAmount: data.amount,
      }))
      .sort((a, b) => b.totalAmount - a.totalAmount)
      .slice(0, 5);

    // Calcul du taux de croissance (simulé)
    const monthlyGrowth = Math.random() * 20 - 5; // -5% à +15%
    const conversionRate = Math.random() * 10 + 85; // 85% à 95%

    return {
      totalEarnings,
      totalTransactions,
      averageCommissionRate,
      topPerformingRules,
      monthlyGrowth,
      conversionRate,
    };
  }

  // === ACTIONS EN LOT ===

  async bulkUpdateCommissionStatus(
    ids: string[],
    status: Commission["status"]
  ): Promise<Commission[]> {
    await simulateNetworkDelay(1200);

    const updatedCommissions: Commission[] = [];

    for (const id of ids) {
      try {
        const updated = await this.updateCommissionStatus(id, status);
        updatedCommissions.push(updated);
      } catch (error) {
        void 0;
      }
    }

    return updatedCommissions;
  }

  async bulkCreatePayouts(
    payoutRequests: Array<{
      userId: string;
      commissionIds: string[];
      method: CommissionPayout["method"];
      scheduledDate: string;
    }>
  ): Promise<CommissionPayout[]> {
    await simulateNetworkDelay(1500);

    const createdPayouts: CommissionPayout[] = [];

    for (const request of payoutRequests) {
      // Calculer le montant total des commissions
      const commissions = this.commissions.filter((c) =>
        request.commissionIds.includes(c.id)
      );

      const totalAmount = commissions.reduce(
        (sum, c) => sum + c.calculatedAmount,
        0
      );

      // Simuler des frais selon la méthode
      let fees = 0;
      switch (request.method) {
        case "paypal":
          fees = totalAmount * 0.03; // 3% de frais PayPal
          break;
        case "bank_transfer":
          fees = 0.5; // Frais fixe virement
          break;
        case "crypto":
          fees = totalAmount * 0.01; // 1% de frais crypto
          break;
        default:
          fees = 0;
      }

      const payoutData: Omit<CommissionPayout, "id"> = {
        ...request,
        totalAmount,
        currency: "EUR",
        status: "scheduled",
        fees,
        netAmount: totalAmount - fees,
      };

      const newPayout = await this.createPayout(payoutData);
      createdPayouts.push(newPayout);
    }

    return createdPayouts;
  }
}

// Instance singleton du service
export const commissionService = new CommissionService();
export default commissionService;
