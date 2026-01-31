"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import PageHeader from "@/components/layouts/PageHeader";
import PromoBanner from "@/components/common/PromoBanner";
import NotificationsPanel from "@/components/modals/NotificationsPanel";
import TransactionReceipt, {
  TransactionDetails,
} from "@/components/modals/TransactionReceipt";
import { useNotifications } from "@/components/common/NotificationsContext";
import { motion } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import { getLevelTitle } from "@/utils/levelUtils";
import NotificationDetailModal from "@/components/modals/NotificationDetailModal";
import VerificationBanner from "@/components/common/VerificationBanner";
// --- INTERFACES (Déplacées ici pour plus de clarté) ---
interface WalletData {
  balance: number;
  currency: string;
}
interface GamificationProfile {
  level: number;
  xp: number;
}
// Interface pour les données de transaction venant du backend
interface ApiTransaction {
  id: string;
  amount: number;
  type: string;
  description: string | null;
  createdAt: string;
  sender: { user: { username: string; fullName: string } } | null;
  receiver: { user: { username: string; fullName: string } };
  status: string;
  xpGained: number | null;
  commission?: number;
  cart?: any[];
}

// --- Animation variants (INCHANGÉ) ---
const buttonTapAnimation = {
  tap: { scale: 0.95, transition: { duration: 0.1 } },
};
const sectionTapAnimation = {
  tap: { scale: 0.98, transition: { duration: 0.1 } },
};

export default function Dashboard() {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showReceipt, setShowReceipt] = useState(false);
  const [selectedTransaction, setSelectedTransaction] =
    useState<TransactionDetails | null>(null);
  const router = useRouter();
  // --- NOUVEAU : État pour les transactions dynamiques ---
  const [transactions, setTransactions] = useState<TransactionDetails[]>([]);
  const [selectedNotification, setSelectedNotification] =
    useState<Notification | null>(null);
  const [referralReward, setReferralReward] = useState<number>(1000); // Valeur par défaut
  const { user, wallet, gamificationProfile, isLoading, token } = useAuth();
  const {
    notifications,
    unreadCount,
    markAllAsRead,
    handleNotificationClick: openNotification,
  } = useNotifications();
  const [isClient, setIsClient] = useState(false);
  const isVerified = user?.verificationStatus === "VERIFIED";

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Fetch des règles de parrainage dynamiques
  useEffect(() => {
    const fetchReferralRules = async () => {
      if (!token) return;

      try {
        // ✅ Nouvel endpoint accessible aux USER et MERCHANT
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/referral/rules/USER`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (response.ok) {
          const data = await response.json();
          void 0;
          
          // Cherche la règle pour "USER parraine MERCHANT"
          const merchantReferralRule = data.rewards?.find(
            (reward: any) => reward.targetType === "MERCHANT"
          );

          if (merchantReferralRule) {
            setReferralReward(merchantReferralRule.yourReward);
            void 0;
          } else {
            void 0;
          }
        } else {
          void 0;
        }
      } catch (error) {
        void 0;
      }
    };

    fetchReferralRules();
  }, [token]);
  const handleNotificationClick = (notification: Notification) => {
    setSelectedNotification(notification); // On stocke la notification cliquée
    setShowNotifications(false); // On ferme le panneau des notifications
  };
  const formatApiTransaction = (
    tx: ApiTransaction,
    currentUsername: string
  ): TransactionDetails => {
    const isSender = tx.sender?.user.username === currentUsername;
    let isIncome = !isSender;

    let name = tx.description || "Transaction";
    let icon = "🔄";
    let bgColor = "bg-gray-100";
    let category = tx.type;
    if (tx.status === "refunded") {
      name = `Remboursé : ${tx.description || "Paiement"}`;
      icon = "↩️";
      bgColor = "bg-gray-200";
      category = "Remboursé";
      isIncome = true; // L'argent revient sur le compte du client
    }

    if (tx.type === "recharge") {
      // --- Début de la modification ---
      if (tx.status === "completed") {
        name = `Recharge approuvée`;
        icon = "✅"; // Icône de succès
        bgColor = "bg-green-100"; // Couleur verte
        category = "Validée";
        isIncome = true;
      } else if (tx.status === "rejected") {
        name = `Recharge refusée`;
        icon = "❌"; // Icône d'échec
        bgColor = "bg-red-100"; // Couleur rouge
        category = "Refusée";
        isIncome = false; // Une recharge refusée n'est pas un revenu
      } else {
        // Cas pour 'pending' ou autre
        name = `Demande de recharge`;
        icon = "⏳"; // Icône d'attente
        bgColor = "bg-yellow-100"; // Couleur jaune
        category = "En attente";
        isIncome = false;
      }
      // --- Fin de la modification ---
    } else if (tx.type === "transfer") {
      if (isSender) {
        name = `Transfert à ${tx.receiver.user.fullName}`;
        icon = "↗️";
        bgColor = "bg-purple-100";
        category = "Sortie";
      } else {
        name = `Transfert de ${tx.sender?.user.fullName || "inconnu"}`;
        icon = "↙️";
        bgColor = "bg-green-100";
        category = "Entrée";
      }
    } else if (tx.type === "payment") {
      if (isSender) {
        // Paiement envoyé - afficher le nom du commerçant
        name = `Paiement à ${tx.receiver.user.fullName}`;
        icon = "💳";
        bgColor = "bg-red-100";
        category = "Sortie";
      } else {
        // Paiement reçu (rare pour un client)
        name = `Paiement de ${tx.sender?.user.fullName || "inconnu"}`;
        icon = "💳";
        bgColor = "bg-green-100";
        category = "Entrée";
      }
    } else if (tx.type === "RECHARGE_FROM_MERCHANT") {
      name = "Recharge par marchand";
      icon = "🏪";
      bgColor = "bg-blue-100";
      category = "Entrée";
      isIncome = true;
    } else if (tx.type === "refund") {
      if (isSender) {
        name = `Remboursement à ${tx.receiver.user.fullName}`;
        icon = "🔄";
        bgColor = "bg-purple-100";
        category = "Sortie";
      } else {
        name = `Remboursement de ${tx.sender?.user.fullName || "inconnu"}`;
        icon = "🔄";
        bgColor = "bg-green-100";
        category = "Entrée";
      }
    } else {
      // Type inconnu
      name = tx.description || "Transaction";
      icon = "🔄";
      bgColor = "bg-gray-100";
      category = tx.type;
    }

    return {
      id: tx.id,
      type: tx.type,
      name,
      icon,
      bgColor,
      category,
      // On n'affiche pas de signe +/- pour les recharges non complétées
      amount:
        tx.type === "recharge" && tx.status !== "completed"
          ? `${tx.amount.toLocaleString("fr-FR")} DA`
          : `${isIncome ? "+" : "-"}${tx.amount.toLocaleString("fr-FR")} DA`,
      isPositive: isIncome,
      date: new Date(tx.createdAt).toLocaleDateString("fr-FR", {
        day: "2-digit",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
      }),
      points: tx.xpGained && tx.xpGained > 0 ? `+${tx.xpGained} points` : "",
      commission: tx.commission ?? 0,
      cart: tx.cart || [],
      merchant: tx.type === "payment" && !isSender ? tx.sender?.user : (tx.type === "payment" && isSender ? tx.receiver?.user : null),
    };
  };

  // --- NOUVEAU : useEffect pour charger les transactions ---
  useEffect(() => {
    const fetchTransactions = async () => {
      if (token && user) {
        try {
          const res = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/wallet/transactions`,
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );
          if (res.ok) {
            const data: ApiTransaction[] = await res.json();
            // On limite aux 3 dernières et on les formate
            const formatted = data
              .slice(0, 3)
              .map((tx) => formatApiTransaction(tx, user.username));
            setTransactions(formatted);
          }
        } catch (error) {
          void 0;
        }
      }
    };
    fetchTransactions();
  }, [token, user]); // Se redéclenche si le token ou l'utilisateur change

  const handleParrainage = () => router.push("/inviter");
  const handleTransactionClick = (transaction: any) => {
    setSelectedTransaction(transaction);
    setShowReceipt(true);
  };

  if (!isClient || isLoading || !user || !wallet || !gamificationProfile) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Chargement de votre session...</p>
      </div>
    );
  }

  const { xpToNextLevel } = gamificationProfile;
  const progressPercentage = (gamificationProfile.xp / xpToNextLevel) * 100;

  return (
    <div className="bg-white min-h-screen mb-16">
      <PageHeader
        title={`Bonjour, ${user.username}`}
        emoji="🏠"
        actionButton={
          <button
            className="p-2 relative"
            onClick={() => setShowNotifications(true)}
          >
            <span className="text-lg">🔔</span>
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 bg-red-500 text-white text-xs w-4 h-4 flex items-center justify-center rounded-full">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </button>
        }
      />

      <div className="px-5">
        {/* --- AJOUT DE LA BANNIÈRE ICI --- */}
        <div className="my-4">
          <VerificationBanner />
        </div>
        <div
          onClick={() => router.push("/wallet")}
          className="block cursor-pointer"
        >
          <motion.div
            whileTap="tap"
            variants={sectionTapAnimation}
            className="my-4 relative bg-gradient-to-br from-blue-900 to-gray-800 text-white p-5 rounded-xl overflow-hidden"
          >
            {/* ... (votre JSX pour le solde, inchangé) ... */}
            <div className="absolute right-0 top-0 w-40 h-40 rounded-full bg-gradient-to-br from-yellow-400/30 to-yellow-600/20 -mr-20 -mt-20 blur-xl"></div>
            <div className="absolute left-0 bottom-0 w-40 h-40 rounded-full bg-gradient-to-br from-gray-700/30 to-gray-900/30 -ml-20 -mb-20 blur-xl"></div>
            <div className="mb-3 relative z-10">
              <p className="text-sm opacity-80">Solde disponible</p>
              <h1 className="text-3xl font-bold mt-1 text-white">
                {wallet.balance.toLocaleString("fr-FR")} DZD
              </h1>
            </div>
            <div className="flex justify-between mt-4 relative z-10">
              <Link href="/envoyer" className="flex-1 mr-2">
                <motion.button
                  whileTap="tap"
                  variants={buttonTapAnimation}
                  className="w-full bg-white/20 hover:bg-white/30 py-2 rounded-xl flex items-center justify-center backdrop-blur-sm transition-colors"
                >
                  <span className="text-sm mr-1">🚀</span>
                  <span className="text-sm">Envoyer</span>
                </motion.button>
              </Link>
              <Link
                href={isVerified ? "/recharger" : "/profile/verification"}
                className="flex-1 ml-2"
              >
                <motion.button
                  whileTap="tap"
                  variants={buttonTapAnimation}
                  className={`w-full py-2 rounded-xl flex items-center justify-center backdrop-blur-sm transition-colors ${
                    isVerified
                      ? "bg-white/20 hover:bg-white/30"
                      : "bg-gray-400/20 cursor-not-allowed"
                  }`}
                >
                  <span className="text-sm mr-1">📥</span>
                  <span className="text-sm">Recharger</span>
                </motion.button>
              </Link>
            </div>
          </motion.div>
        </div>

        {/* ... (le reste de votre JSX pour PromoBanner, Actions rapides, etc. est inchangé) ... */}
        <div className="mb-5">
          <PromoBanner
            title={`+${referralReward}DA`}
            description={`Parraine un commerçant et gagne +${referralReward}DA`}
            emoji="🎁"
            action={handleParrainage}
            actionLabel="Parrainer"
          />
        </div>

        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-3">Actions rapides</h2>
          <div className="grid grid-cols-3 gap-3">
            <div className="flex flex-col items-center">
              <Link href="/inviter">
                <motion.div
                  whileTap="tap"
                  variants={buttonTapAnimation}
                  className="w-14 h-14 bg-gradient-to-br from-blue-900 to-gray-800 text-white rounded-full flex items-center justify-center mb-1 overflow-hidden relative shadow-md hover:shadow-lg transition-shadow"
                >
                  <div className="absolute right-0 top-0 w-8 h-8 rounded-full bg-gradient-to-br from-yellow-400/30 to-yellow-600/20 -mr-4 -mt-4 blur-md"></div>
                  <div className="absolute left-0 bottom-0 w-8 h-8 rounded-full bg-gradient-to-br from-gray-700/30 to-gray-900/30 -ml-4 -mb-4 blur-md"></div>
                  <span className="text-xl relative z-10">👥</span>
                </motion.div>
              </Link>
              <span className="text-xs text-center">Inviter</span>
            </div>
            <div className="flex flex-col items-center">
              <Link href="/amis">
                <motion.div
                  whileTap="tap"
                  variants={buttonTapAnimation}
                  className="w-14 h-14 bg-gradient-to-br from-blue-900 to-gray-800 text-white rounded-full flex items-center justify-center mb-1 overflow-hidden relative shadow-md hover:shadow-lg transition-shadow"
                >
                  <div className="absolute right-0 top-0 w-8 h-8 rounded-full bg-gradient-to-br from-yellow-400/30 to-yellow-600/20 -mr-4 -mt-4 blur-md"></div>
                  <div className="absolute left-0 bottom-0 w-8 h-8 rounded-full bg-gradient-to-br from-gray-700/30 to-gray-900/30 -ml-4 -mb-4 blur-md"></div>
                  <span className="text-xl relative z-10">👤</span>
                </motion.div>
              </Link>
              <span className="text-xs text-center">Amis</span>
            </div>
            <div className="flex flex-col items-center">
              <Link href="/missions">
                <motion.div
                  whileTap="tap"
                  variants={buttonTapAnimation}
                  className="w-14 h-14 bg-gradient-to-br from-blue-900 to-gray-800 text-white rounded-full flex items-center justify-center mb-1 overflow-hidden relative shadow-md hover:shadow-lg transition-shadow"
                >
                  <div className="absolute right-0 top-0 w-8 h-8 rounded-full bg-gradient-to-br from-yellow-400/30 to-yellow-600/20 -mr-4 -mt-4 blur-md"></div>
                  <div className="absolute left-0 bottom-0 w-8 h-8 rounded-full bg-gradient-to-br from-gray-700/30 to-gray-900/30 -ml-4 -mb-4 blur-md"></div>
                  <span className="text-xl relative z-10">🎯</span>
                </motion.div>
              </Link>
              <span className="text-xs text-center">Missions</span>
            </div>
          </div>
        </div>
        <div className="my-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Progression</h2>
            <Link href="/progression" className="text-sm text-gray-500">
              Détails
            </Link>
          </div>

          <Link href="/progression" className="block">
            <motion.div
              whileTap="tap"
              variants={sectionTapAnimation}
              className="bg-black text-white rounded-xl p-4 transition-transform hover:scale-[1.01] active:scale-[0.99] cursor-pointer"
            >
              <>
                <div className="flex justify-between items-center mb-3">
                  <div className="flex items-center">
                    <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center mr-3">
                      <span>🔥</span>
                    </div>
                    <div>
                      <p className="font-medium">
                        Niveau {gamificationProfile.level}
                      </p>
                      <p className="text-xs text-white/80">
                        {getLevelTitle(gamificationProfile.level)}
                      </p>
                    </div>
                  </div>
                  <div className="bg-white/20 text-white px-3 py-1 rounded-full text-xs">
                    {gamificationProfile.xp} XP
                  </div>
                </div>

                <div className="flex justify-between text-xs text-white/60 mb-1 px-1">
                  <span>Niveau {gamificationProfile.level}</span>
                  <span>
                    {gamificationProfile.xp} / {xpToNextLevel} XP
                  </span>
                  <span>Niveau {gamificationProfile.level + 1}</span>
                </div>

                <div className="bg-white/20 h-1 rounded-full mb-2">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${progressPercentage}%` }}
                    transition={{ duration: 0.8 }}
                    className="h-full bg-white rounded-full"
                  ></motion.div>
                </div>

                <div className="flex justify-between items-center mt-3">
                  <div className="text-center flex-1 border-r border-white/20">
                    <p className="font-bold text-sm">
                      {gamificationProfile.xp}
                    </p>
                    <p className="text-xs text-white/60">XP Total</p>
                  </div>
                  <div className="text-center flex-1">
                    <p className="font-bold text-sm">
                      {gamificationProfile.level}
                    </p>
                    <p className="text-xs text-white/60">Niveau actuel</p>
                  </div>
                </div>
              </>
            </motion.div>
          </Link>
        </div>

        <div className="mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Activité récente</h2>
            <Link href="/historique" className="text-sm text-gray-500">
              Tout voir
            </Link>
          </div>

          {/* --- MODIFIÉ : Utilisation de l'état dynamique --- */}
          <div className="space-y-4">
            {transactions.length > 0 ? (
              transactions.map((transaction) => (
                <motion.div
                  key={transaction.id}
                  whileTap="tap"
                  variants={sectionTapAnimation}
                  className="flex justify-between p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors cursor-pointer"
                  onClick={() => handleTransactionClick(transaction)}
                >
                  <div className="flex items-center">
                    <div
                      className={`w-10 h-10 rounded-xl ${transaction.bgColor} flex items-center justify-center mr-3`}
                    >
                      <span>{transaction.icon}</span>
                    </div>
                    <div>
                      <p className="font-medium">{transaction.name}</p>
                      <p className="text-xs text-gray-500">
                        {transaction.date}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p
                      className={`font-medium ${
                        transaction.isPositive ? "text-green-600" : ""
                      }`}
                    >
                      {transaction.amount}
                    </p>
                    {typeof transaction.commission !== "undefined" &&
                      transaction.commission > 0 && (
                        <p className="text-xs text-amber-600 font-semibold">
                          Commission: {transaction.commission} DA
                        </p>
                      )}
                    <p className="text-xs text-gray-500">
                      {transaction.category}
                    </p>
                  </div>
                </motion.div>
              ))
            ) : (
              <p className="text-center text-gray-500 py-4">
                Aucune transaction récente.
              </p>
            )}
          </div>
        </div>
      </div>

      <NotificationsPanel
        isOpen={showNotifications}
        onClose={() => setShowNotifications(false)}
        notifications={notifications}
        onMarkAllAsRead={markAllAsRead}
        onNotificationClick={handleNotificationClick}
      />
      <TransactionReceipt
        isOpen={showReceipt}
        onClose={() => setShowReceipt(false)}
        transaction={selectedTransaction}
      />
      <NotificationDetailModal
        isOpen={!!selectedNotification}
        onClose={() => setSelectedNotification(null)}
        notification={selectedNotification}
      />
    </div>
  );
}
