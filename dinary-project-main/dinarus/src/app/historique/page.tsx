// app/historique/page.tsx
"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { motion } from "framer-motion";
import PageHeader from "@/components/layouts/PageHeader";
import TransactionReceipt, {
  TransactionDetails,
} from "@/components/modals/TransactionReceipt";

export default function Historique() {
  const { user, token, isLoading } = useAuth();

  const [error, setError] = useState<string | null>(null);
  const [selectedFilter, setSelectedFilter] = useState("Tout");
  const filters = ["Tout", "Entrées", "Sorties", "Récompenses", "XP"];
  const [showReceipt, setShowReceipt] = useState(false);
  const [selectedTransaction, setSelectedTransaction] =
    useState<TransactionDetails | null>(null);
  const [transactions, setTransactions] = useState<{ [key: string]: any[] }>(
    {}
  );
  const [xpGains, setXpGains] = useState<any[]>([]);
  
  // États pour la pagination
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 10;

  const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL;

  useEffect(() => {
    const fetchData = async () => {
      if (!token || !user || !apiBaseUrl) {
        return;
      }

      try {
        const [walletRes, missionsRes, xpRes] = await Promise.all([
          fetch(`${apiBaseUrl}/wallet/transactions`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch(`${apiBaseUrl}/gamification/missions`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch(`${apiBaseUrl}/gamification/xp/history`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        if (walletRes.status === 401 || missionsRes.status === 401) {
          setError("Accès non autorisé. Veuillez vous reconnecter.");
          return;
        }

        let walletTxs: any[] = [];
        if (walletRes.ok) {
          const walletData = await walletRes.json();
          walletTxs = walletData.map((tx: any) => {
            const isSender = tx.sender?.user?.username === user.username;
            const isManualRecharge =
              tx.type === "recharge" &&
              tx.description?.toLowerCase().includes("manuel");

            const txDirection = tx.direction
              ? tx.direction
              : isSender || tx.amount < 0
              ? "debit"
              : "credit";

            // Catégorie métier :
            // - Entrées : recharges, virements reçus, remboursements reçus
            // - Sorties : paiements, virements émis, retraits
            let category: "Entrée" | "Sortie";

            if (tx.type === "recharge" || tx.type === "RECHARGE_FROM_MERCHANT") {
              category = "Entrée";
            } else if (tx.type === "refund") {
              category = txDirection === "credit" ? "Entrée" : "Sortie";
            } else if (tx.type === "transfer") {
              category = txDirection === "debit" ? "Sortie" : "Entrée";
            } else if (tx.type === "withdrawal") {
              category = "Sortie";
            } else if (tx.type === "payment") {
              category = "Sortie";
            } else {
              // Fallback : on se base sur le sens débit/crédit
              category = txDirection === "debit" ? "Sortie" : "Entrée";
            }

            const isSortie = category === "Sortie";

            // Montant signé : positif pour Entrée, négatif pour Sortie
            const signedAmount = category === "Entrée" ? tx.amount : -tx.amount;

            // Déterminer le nom d'affichage
            let displayName = "Transaction";
            if (isManualRecharge) {
              displayName = "Recharge libre (gain)";
            } else if (tx.type === "payment") {
              if (isSender) {
                // Paiement envoyé - afficher le nom du commerçant
                displayName = tx.receiver?.user?.fullName || tx.description || "Paiement envoyé";
              } else {
                // Paiement reçu
                displayName = tx.sender?.user?.fullName || tx.description || "Paiement reçu";
              }
            } else if (tx.type === "transfer") {
              if (isSender) {
                displayName = tx.receiver?.user?.fullName || "Virement envoyé";
              } else {
                displayName = tx.sender?.user?.fullName || "Virement reçu";
              }
            } else if (tx.type === "RECHARGE_FROM_MERCHANT") {
              displayName = "Recharge par marchand";
            } else if (tx.type === "recharge") {
              displayName = "Recharge Dinary";
            } else if (tx.type === "withdrawal") {
              displayName = "Retrait vers CCP";
            } else if (tx.type === "refund") {
              displayName = isSender ? "Remboursement envoyé" : "Remboursement reçu";
            } else {
              displayName = tx.description || tx.type || "Transaction";
            }
            
            return {
              id: tx.id,
              rawDate: tx.createdAt,
              type: tx.type,
              category,
              direction: txDirection,
              icon:
                tx.type === "recharge"
                  ? isManualRecharge
                    ? "🎁" // icône propre pour gain manuel
                    : "📥"
                  : tx.type === "payment"
                  ? "💳"
                  : "💸",
              bgColor: isSortie ? "bg-red-100" : "bg-green-100",
              name: displayName,
              date: new Date(tx.createdAt).toLocaleDateString("fr-FR", {
                day: "2-digit",
                month: "short",
                year: "numeric",
              }),
              amount: signedAmount,
              commission: tx.commission ?? 0,
              isPositive: signedAmount >= 0,
              points: isManualRecharge
                ? "+gain"
                : tx.xpGained
                ? `+${tx.xpGained} points`
                : "",
              cart: tx.cart || [],
              merchant: tx.receiver?.user || null,
            };
          });
        }

        let missionRewards: any[] = [];
        if (missionsRes.ok) {
          const missionsData = await missionsRes.json();
          missionRewards = missionsData
            .filter((m: any) => m.isCompleted && m.xpReward > 0)
            .map((m: any) => ({
              id: m.id,
              rawDate: m.completedAt,
              type: "reward",
              category: "Récompense",
              icon: "🎯",
              bgColor: "bg-blue-100",
              name: `Mission: ${m.title}`,
              date: m.completedAt
                ? new Date(m.completedAt).toLocaleDateString("fr-FR", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  })
                : "",
              amount: `+${m.xpReward}`,
              isPositive: true,
              points: `+${m.xpReward} points`,
            }));
        }

        // Traiter les gains XP
        let xpItems: any[] = [];
        if (xpRes.ok) {
          const xpData = await xpRes.json();
          xpItems = xpData.map((xp: any) => ({
            id: xp.id || Math.random().toString(),
            rawDate: xp.createdAt || xp.date,
            type: "xp",
            category: "XP",
            icon: xp.source === 'mission' ? '🎯' : 
                 xp.source === 'payment' ? '💳' : 
                 xp.source === 'referral' ? '👥' : 
                 xp.source === 'transaction' ? '💰' : '⭐',
            bgColor: "bg-purple-100",
            name: xp.description || xp.source || 'Gain XP',
            date: new Date(xp.createdAt || xp.date).toLocaleDateString("fr-FR", {
              day: "2-digit",
              month: "short",
              year: "numeric",
            }),
            amount: `+${xp.amount || xp.xp}`,
            isPositive: true,
            points: `+${xp.amount || xp.xp} XP`,
          }));
          setXpGains(xpData);
        }

        const allItems = [...walletTxs, ...missionRewards, ...xpItems].sort(
          (a, b) =>
            new Date(b.rawDate).getTime() - new Date(a.rawDate).getTime()
        );

        if (allItems.length === 0) {
          setError("Aucune transaction ou mission trouvée.");
        } else {
          const grouped = allItems.reduce((acc, item) => {
            const monthYear = new Date(item.rawDate).toLocaleString("fr-FR", {
              month: "long",
              year: "numeric",
            });
            if (!acc[monthYear]) {
              acc[monthYear] = [];
            }
            acc[monthYear].push(item);
            return acc;
          }, {});
          setTransactions(grouped);
        }
      } catch (err) {
        setError(
          "Erreur de récupération de l'historique. Veuillez réessayer plus tard."
        );
        
      }
    };

    if (!isLoading) {
      fetchData();
    }
  }, [isLoading, token, user]);

  // Aplatir toutes les transactions pour la pagination
  const allTransactions = Object.values(transactions).flat();
  
  const filteredTransactions = allTransactions.filter((t: any) => {
    if (selectedFilter === "Tout") return true;

    // Règles métier strictes :
    // Entrées = recharges, virements reçus, remboursements reçus
    if (selectedFilter === "Entrées") {
      const isRecharge = t.type === "recharge" || t.type === "RECHARGE_FROM_MERCHANT";
      const isRefundIn = t.type === "refund" && t.direction === "credit";
      const isTransferIn = t.type === "transfer" && t.direction === "credit";
      return isRecharge || isRefundIn || isTransferIn;
    }

    // Sorties = paiements, virements émis, retraits, remboursements envoyés
    if (selectedFilter === "Sorties") {
      const isPayment = t.type === "payment";
      const isWithdrawal = t.type === "withdrawal";
      const isTransferOut = t.type === "transfer" && t.direction === "debit";
      const isRefundOut = t.type === "refund" && t.direction === "debit";
      return isPayment || isWithdrawal || isTransferOut || isRefundOut;
    }

    if (selectedFilter === "Récompenses") return t.type === "reward";
    if (selectedFilter === "XP") return t.type === "xp";
    return false;
  });

  // Pagination
  const totalPages = Math.ceil(filteredTransactions.length / ITEMS_PER_PAGE);
  const paginatedTransactions = filteredTransactions.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  // Réinitialiser la page à 1 quand le filtre change
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedFilter]);

  const handleTransactionClick = (transaction: TransactionDetails) => {
    setSelectedTransaction(transaction);
    setShowReceipt(true);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Chargement de l&apos;historique...</p>
      </div>
    );
  }

  return (
    <div className="bg-white min-h-screen mb-16">
      <PageHeader
        title="Historique"
        emoji="📊"
        showBackButton={true}
        backTo="/dashboard"
      />

      <div className="px-5 pb-10">
        {error ? (
          <div className="bg-red-100 text-red-700 rounded-xl p-4 my-6 text-center">
            {error}
          </div>
        ) : (
          <>
            {/* Filtres */}
            <div className="mb-6">
              <div className="grid grid-cols-3 gap-2 mb-2">
                {filters.slice(0, 3).map((filter) => {
                  const emoji = filter === "Tout" ? "💵" : filter === "Entrées" ? "📥" : "📤";
                  return (
                    <button
                      key={filter}
                      className={`px-3 py-3 rounded-xl text-xs font-medium flex flex-col items-center gap-1 transition-all duration-200 border ${
                        selectedFilter === filter
                          ? "bg-black text-white border-black shadow-lg scale-105"
                          : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50 hover:border-gray-300"
                      }`}
                      onClick={() => setSelectedFilter(filter)}
                    >
                      <span className="text-xl">{emoji}</span>
                      <span className="text-[11px] leading-tight text-center">{filter}</span>
                    </button>
                  );
                })}
              </div>
              <div className="grid grid-cols-2 gap-2">
                {filters.slice(3).map((filter) => {
                  const emoji = filter === "Récompenses" ? "🎁" : "⭐";
                  return (
                    <button
                      key={filter}
                      className={`px-3 py-3 rounded-xl text-xs font-medium flex flex-col items-center gap-1 transition-all duration-200 border ${
                        selectedFilter === filter
                          ? "bg-black text-white border-black shadow-lg scale-105"
                          : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50 hover:border-gray-300"
                      }`}
                      onClick={() => setSelectedFilter(filter)}
                    >
                      <span className="text-xl">{emoji}</span>
                      <span className="text-[11px] leading-tight text-center">{filter}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Liste des transactions paginées */}
            {paginatedTransactions.length > 0 ? (
              <div className="space-y-4 mb-6">
                {paginatedTransactions.map((tx, index) => (
                  <motion.div
                    key={tx.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05, duration: 0.2 }}
                    whileTap={{ scale: 0.98 }}
                    className="p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-all cursor-pointer"
                    onClick={() => handleTransactionClick(tx)}
                  >
                    <div className="flex justify-between items-center">
                      <div className="flex items-center">
                        <div
                          className={`w-11 h-11 ${tx.bgColor} rounded-xl flex items-center justify-center mr-3`}
                        >
                          <span className="text-xl">{tx.icon}</span>
                        </div>
                        <div>
                          <p className="font-medium">{tx.name}</p>
                          <p className="text-xs text-gray-500">{tx.date}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p
                          className={`font-medium ${
                            tx.isPositive ? "text-green-600" : ""
                          }`}
                        >
                          {tx.amount} DA
                        </p>
                        {typeof tx.commission !== "undefined" &&
                          tx.commission > 0 && (
                            <p className="text-xs text-amber-600 font-semibold">
                              Commission: {tx.commission} DA
                            </p>
                          )}
                        {tx.points && (
                          <p className="text-xs text-gray-500">
                            {tx.points}
                          </p>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="py-10 text-center text-gray-500">
                <p className="text-sm">Aucune transaction trouvée</p>
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-6 mb-6">
                <div className="flex items-center justify-center gap-2 flex-wrap">
                  {/* Bouton Précédent */}
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                    className="px-3 py-2 rounded-lg bg-white border border-gray-200 text-gray-700 text-sm font-medium hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                  >
                    ← Préc.
                  </button>

                  {/* Numéros de pages */}
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                    const showPage = 
                      page === 1 || 
                      page === totalPages || 
                      (page >= currentPage - 1 && page <= currentPage + 1);
                    
                    const showEllipsisBefore = page === currentPage - 2 && currentPage > 3;
                    const showEllipsisAfter = page === currentPage + 2 && currentPage < totalPages - 2;

                    if (!showPage && !showEllipsisBefore && !showEllipsisAfter) return null;

                    if (showEllipsisBefore || showEllipsisAfter) {
                      return (
                        <span key={`ellipsis-${page}`} className="px-2 text-gray-400">
                          ...
                        </span>
                      );
                    }

                    return (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`min-w-[40px] px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                          currentPage === page
                            ? 'bg-black text-white shadow-md'
                            : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        {page}
                      </button>
                    );
                  })}

                  {/* Bouton Suivant */}
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                    className="px-3 py-2 rounded-lg bg-white border border-gray-200 text-gray-700 text-sm font-medium hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                  >
                    Suiv. →
                  </button>
                </div>

                {/* Indicateur de page */}
                <p className="text-center text-xs text-gray-500 mt-3">
                  Page {currentPage} sur {totalPages} • {filteredTransactions.length} transaction{filteredTransactions.length > 1 ? 's' : ''}
                </p>
              </div>
            )}
          </>
        )}
      </div>

      <TransactionReceipt
        isOpen={showReceipt}
        onClose={() => setShowReceipt(false)}
        transaction={
          selectedTransaction
            ? {
                ...selectedTransaction,
                commission: selectedTransaction.commission,
              }
            : null
        }
      />
    </div>
  );
}
