// app/admin/dashboard/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { API_URL } from "@/lib/api";
import {
  Users,
  Store,
  Banknote,
  Receipt,
  AlertTriangle,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  CheckCircle2,
  XCircle,
} from "lucide-react";

interface StatData {
  value: number;
  change?: number;
}

interface DashboardStats {
  totalUsers: StatData;
  totalMerchants: StatData;
  totalVolume: StatData;
  totalTransactions: StatData;
  pendingVerifications: StatData;
}

interface Transaction {
  id: string;
  amount: number;
  type: string;
  status: string;
  createdAt: string;
  senderName: string | null;
  senderEmail: string | null;
  receiverName: string | null;
  receiverEmail: string | null;
  description: string | null;
}

interface DashboardData {
  stats: DashboardStats;
  recentTransactions: Transaction[];
  transactionsByDay: { date: string; count: number; volume: number }[];
  pendingTasks: {
    pendingVerifications: number;
    openTickets: number;
    pendingMerchants: number;
    pendingRecharges: number;
    pendingWithdrawals: number;
    pendingSuggestions: number;
  };
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { token } = useAuth();

  useEffect(() => {
    if (!token) return;

    const fetchDashboardData = async () => {
      setLoading(true);
      setError(null);
      try {
        const [
          statsRes, 
          transactionsRes, 
          rechargesRes, 
          withdrawalsRes, 
          suggestionsRes,
          ticketsRes,
          verificationsRes
        ] = await Promise.all([
          fetch(`${API_URL}/admin/stats`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch(`${API_URL}/admin/transactions`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch(`${API_URL}/admin/recharges/pending`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch(`${API_URL}/admin/withdrawals/pending`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch(`${API_URL}/admin/merchants/suggestions`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch(`${API_URL}/admin/tickets`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch(`${API_URL}/admin/identity/pending`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        if (!statsRes.ok || !transactionsRes.ok) {
          throw new Error("Erreur lors du chargement des données");
        }

        const stats = await statsRes.json();
        const transactions = await transactionsRes.json();
        
        // Compter les tâches en attente
        let pendingRecharges = 0;
        let pendingWithdrawals = 0;
        let pendingSuggestions = 0;
        let openTickets = 0;
        let pendingMerchants = 0;
        
        if (rechargesRes.ok) {
          const recharges = await rechargesRes.json();
          pendingRecharges = recharges.length; // Déjà filtrées par le backend
          /* log removed */
        }
        
        if (withdrawalsRes.ok) {
          const withdrawals = await withdrawalsRes.json();
          pendingWithdrawals = withdrawals.length; // Déjà filtrées par le backend
          /* log removed */
        }
        
        if (suggestionsRes.ok) {
          const suggestions = await suggestionsRes.json();
          /* log removed */
          pendingSuggestions = suggestions.filter((s: any) => s.status === "pending").length;
          /* log removed */
        }

        if (ticketsRes.ok) {
          const tickets = await ticketsRes.json();
          openTickets = tickets.filter((t: any) => t.status === "OPEN" || t.status === "IN_PROGRESS").length;
        }

        if (verificationsRes.ok) {
          const verifications = await verificationsRes.json();
          pendingMerchants = verifications.filter((v: any) => v.user?.role === "MERCHANT").length;
        }

        // Calculer les transactions par jour (7 derniers jours)
        const last7Days = Array.from({ length: 7 }, (_, i) => {
          const d = new Date();
          d.setDate(d.getDate() - i);
          return d.toISOString().split("T")[0];
        }).reverse();

        const transactionsByDay = last7Days.map((date) => {
          const dayTransactions = transactions.filter(
            (t: Transaction) =>
              new Date(t.createdAt).toISOString().split("T")[0] === date
          );
          return {
            date,
            count: dayTransactions.length,
            volume: dayTransactions.reduce(
              (sum: number, t: Transaction) => sum + t.amount,
              0
            ),
          };
        });

        const finalPendingTasks = {
          pendingVerifications: stats.pendingVerifications.value,
          openTickets,
          pendingMerchants,
          pendingRecharges,
          pendingWithdrawals,
          pendingSuggestions,
        };

        /* log removed */

        setData({
          stats,
          recentTransactions: transactions.slice(0, 10),
          transactionsByDay,
          pendingTasks: finalPendingTasks,
        });
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [token]);

  if (loading)
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement du tableau de bord...</p>
        </div>
      </div>
    );
  if (error)
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
          Erreur : {error}
        </div>
      </div>
    );

  const stats = data?.stats;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-gray-50">
      <div className="p-4 xl:p-8 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Tableau de bord
            </h1>
            <p className="text-gray-600 mt-1">
              Vue d'ensemble de la plateforme Dinarus
            </p>
          </div>
          <div className="text-sm text-gray-500">
            Mis à jour: {new Date().toLocaleDateString("fr-FR")}
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {/* Total Users */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Users className="w-5 h-5 text-blue-600" />
              </div>
            </div>
            <p className="text-sm text-gray-600 mb-1">Utilisateurs</p>
            <p className="text-2xl font-bold text-gray-900">
              {stats?.totalUsers.value.toLocaleString()}
            </p>
          </div>

          {/* Total Merchants */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-green-100 rounded-lg">
                <Store className="w-5 h-5 text-green-600" />
              </div>
            </div>
            <p className="text-sm text-gray-600 mb-1">Commerçants</p>
            <p className="text-2xl font-bold text-gray-900">
              {stats?.totalMerchants.value.toLocaleString()}
            </p>
          </div>

          {/* Total Volume */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Banknote className="w-5 h-5 text-purple-600" />
              </div>
            </div>
            <p className="text-sm text-gray-600 mb-1">Volume Total</p>
            <p className="text-2xl font-bold text-gray-900">
              {stats?.totalVolume.value.toLocaleString()} DZD
            </p>
          </div>

          {/* Total Transactions */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Receipt className="w-5 h-5 text-orange-600" />
              </div>
            </div>
            <p className="text-sm text-gray-600 mb-1">Transactions</p>
            <p className="text-2xl font-bold text-gray-900">
              {stats?.totalTransactions.value.toLocaleString()}
            </p>
          </div>

          {/* Pending Verifications */}
          <div
            className={`bg-white rounded-xl shadow-sm border p-6 hover:shadow-md transition-shadow ${
              data?.pendingTasks.pendingVerifications! > 0
                ? "border-red-200 bg-red-50/50"
                : "border-gray-100"
            }`}
          >
            <div className="flex items-center justify-between mb-4">
              <div
                className={`p-2 rounded-lg ${
                  data?.pendingTasks.pendingVerifications! > 0
                    ? "bg-red-100"
                    : "bg-gray-100"
                }`}
              >
                <AlertTriangle
                  className={`w-5 h-5 ${
                    data?.pendingTasks.pendingVerifications! > 0
                      ? "text-red-600"
                      : "text-gray-600"
                  }`}
                />
              </div>
            </div>
            <p className="text-sm text-gray-600 mb-1">Vérifications</p>
            <p className="text-2xl font-bold text-gray-900">
              {stats?.pendingVerifications.value ?? 0}
            </p>
          </div>
        </div>

        {/* Charts & Tables Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Transactions par jour */}
          <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-gray-900">
                Activité des 7 derniers jours
              </h2>
              <TrendingUp className="w-5 h-5 text-blue-600" />
            </div>
            <div className="space-y-4">
              {data?.transactionsByDay.map((day, idx) => {
                const maxCount = Math.max(
                  ...data.transactionsByDay.map((d) => d.count)
                );
                const percentage = maxCount > 0 ? (day.count / maxCount) * 100 : 0;
                return (
                  <div key={idx} className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600 font-medium">
                        {new Date(day.date).toLocaleDateString("fr-FR", {
                          weekday: "short",
                          day: "numeric",
                          month: "short",
                        })}
                      </span>
                      <div className="flex items-center gap-4">
                        <span className="text-gray-900 font-semibold">
                          {day.count} transactions
                        </span>
                        <span className="text-gray-600">
                          {day.volume.toLocaleString()} DZD
                        </span>
                      </div>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Actions requises */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">
              Actions requises
            </h2>
            <div className="space-y-4">
              {data?.pendingTasks.pendingVerifications! > 0 && (
                <div className="flex items-start gap-3 p-4 bg-red-50 rounded-lg border border-red-100">
                  <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">
                      Vérifications en attente
                    </p>
                    <p className="text-xs text-gray-600 mt-1">
                      {data?.pendingTasks.pendingVerifications} commerçant(s) à
                      vérifier
                    </p>
                  </div>
                  <span className="text-lg font-bold text-red-600">
                    {data?.pendingTasks.pendingVerifications}
                  </span>
                </div>
              )}

              {data?.pendingTasks.pendingRecharges! > 0 && (
                <div className="flex items-start gap-3 p-4 bg-amber-50 rounded-lg border border-amber-100">
                  <Clock className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">
                      Recharges en attente
                    </p>
                    <p className="text-xs text-gray-600 mt-1">
                      {data?.pendingTasks.pendingRecharges} recharge(s) à valider
                    </p>
                  </div>
                  <span className="text-lg font-bold text-amber-600">
                    {data?.pendingTasks.pendingRecharges}
                  </span>
                </div>
              )}

              {data?.pendingTasks.pendingWithdrawals! > 0 && (
                <div className="flex items-start gap-3 p-4 bg-orange-50 rounded-lg border border-orange-100">
                  <Clock className="w-5 h-5 text-orange-600 mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">
                      Retraits en attente
                    </p>
                    <p className="text-xs text-gray-600 mt-1">
                      {data?.pendingTasks.pendingWithdrawals} retrait(s) à traiter
                    </p>
                  </div>
                  <span className="text-lg font-bold text-orange-600">
                    {data?.pendingTasks.pendingWithdrawals}
                  </span>
                </div>
              )}

              {data?.pendingTasks.pendingSuggestions! > 0 && (
                <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-lg border border-blue-100">
                  <Clock className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">
                      Suggestions en attente
                    </p>
                    <p className="text-xs text-gray-600 mt-1">
                      {data?.pendingTasks.pendingSuggestions} suggestion(s) à examiner
                    </p>
                  </div>
                  <span className="text-lg font-bold text-blue-600">
                    {data?.pendingTasks.pendingSuggestions}
                  </span>
                </div>
              )}

              {data?.pendingTasks.pendingVerifications === 0 && 
               data?.pendingTasks.pendingRecharges === 0 && 
               data?.pendingTasks.pendingWithdrawals === 0 && 
               data?.pendingTasks.pendingSuggestions === 0 && (
                <div className="flex items-start gap-3 p-4 bg-green-50 rounded-lg border border-green-100">
                  <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">
                      Tout est à jour
                    </p>
                    <p className="text-xs text-gray-600 mt-1">
                      Aucune action requise
                    </p>
                  </div>
                </div>
              )}

              <div className="pt-4 border-t border-gray-100">
                <p className="text-xs text-gray-500 mb-2">Accès rapide</p>
                <div className="space-y-2">
                  <a
                    href="/admin/users"
                    className="block text-sm text-blue-600 hover:text-blue-700 hover:underline"
                  >
                    → Gérer les utilisateurs
                  </a>
                  <a
                    href="/admin/merchants"
                    className="block text-sm text-blue-600 hover:text-blue-700 hover:underline"
                  >
                    → Gérer les commerçants
                  </a>
                  <a
                    href="/admin/recharges"
                    className="block text-sm text-blue-600 hover:text-blue-700 hover:underline"
                  >
                    → Gérer les recharges
                  </a>
                  <a
                    href="/admin/withdrawals"
                    className="block text-sm text-blue-600 hover:text-blue-700 hover:underline"
                  >
                    → Gérer les retraits
                  </a>
                  <a
                    href="/admin/transactions"
                    className="block text-sm text-blue-600 hover:text-blue-700 hover:underline"
                  >
                    → Voir toutes les transactions
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Transactions Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900">
              Transactions récentes
            </h2>
            <a
              href="/admin/transactions"
              className="text-sm text-blue-600 hover:text-blue-700 font-medium hover:underline"
            >
              Voir tout →
            </a>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    ID
                  </th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Expéditeur
                  </th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Destinataire
                  </th>
                  <th className="text-right py-3 px-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Montant
                  </th>
                  <th className="text-center py-3 px-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Statut
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {data?.recentTransactions.map((transaction) => (
                  <tr
                    key={transaction.id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="py-4 px-4 text-sm text-gray-600">
                      #{transaction.id.slice(0, 8)}
                    </td>
                    <td className="py-4 px-4 text-sm text-gray-600">
                      {new Date(transaction.createdAt).toLocaleDateString(
                        "fr-FR",
                        {
                          day: "2-digit",
                          month: "short",
                          hour: "2-digit",
                          minute: "2-digit",
                        }
                      )}
                    </td>
                    <td className="py-4 px-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                          transaction.type === "PAYMENT"
                            ? "bg-blue-100 text-blue-700"
                            : transaction.type === "TRANSFER"
                            ? "bg-purple-100 text-purple-700"
                            : "bg-green-100 text-green-700"
                        }`}
                      >
                        {transaction.type === "PAYMENT"
                          ? "Paiement"
                          : transaction.type === "TRANSFER"
                          ? "Transfert"
                          : "Recharge"}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-sm font-medium text-gray-900">
                      {transaction.senderName ?? "Système"}
                    </td>
                    <td className="py-4 px-4 text-sm font-medium text-gray-900">
                      {transaction.receiverName ?? "Système"}
                    </td>
                    <td className="py-4 px-4 text-sm font-bold text-right text-gray-900">
                      {transaction.amount.toLocaleString()} DZD
                    </td>
                    <td className="py-4 px-4 text-center">
                      {(() => {
                        const status = (transaction.status || "completed").toLowerCase();
                        const isCompleted = status === "completed" || status === "success";
                        const isPending = status === "pending";
                        const isFailed = status === "failed" || status === "error";
                        
                        return (
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${
                              isCompleted
                                ? "bg-green-100 text-green-700"
                                : isPending
                                ? "bg-yellow-100 text-yellow-700"
                                : "bg-red-100 text-red-700"
                            }`}
                          >
                            {isCompleted ? (
                              <>
                                <CheckCircle2 className="w-3 h-3" />
                                Complété
                              </>
                            ) : isPending ? (
                              <>
                                <Clock className="w-3 h-3" />
                                En attente
                              </>
                            ) : (
                              <>
                                <XCircle className="w-3 h-3" />
                                Échoué
                              </>
                            )}
                          </span>
                        );
                      })()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
