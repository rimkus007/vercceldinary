"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import PageHeader from "@/components/layouts/PageHeader";
import { useAuth } from "@/context/AuthContext";
import TransactionReceipt, {
  TransactionDetails,
} from "@/components/modals/TransactionReceipt";

interface WalletData {
  id: string; // Ajout de l'ID du portefeuille
  balance: number;
  currency: string;
}

// Mise à jour de l'interface de transaction pour inclure les nouvelles données
interface Transaction {
  id: string;
  amount: number;
  type: string;
  description: string | null;
  createdAt: string;
  sender: { user: { username: string; fullName: string } } | null;
  receiver: { user: { username: string; fullName: string } };
  commission?: number;
  xpGained?: number;
  cart?: any[];
  status?: string;
}

export default function WalletPage() {
  const [wallet, setWallet] = useState<WalletData | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [showReceipt, setShowReceipt] = useState(false);
  const [selectedTransaction, setSelectedTransaction] =
    useState<TransactionDetails | null>(null);
  const { user, token } = useAuth();

  useEffect(() => {
    const fetchData = async () => {
      if (token) {
        try {
          const [walletRes, transRes] = await Promise.all([
            fetch(`${process.env.NEXT_PUBLIC_API_URL}/wallet/me`, {
              headers: { Authorization: `Bearer ${token}` },
            }),
            fetch(`${process.env.NEXT_PUBLIC_API_URL}/wallet/transactions`, {
              headers: { Authorization: `Bearer ${token}` },
            }),
          ]);

          const walletData = await walletRes.json();
          setWallet(walletData);

          const transData = await transRes.json();
          setTransactions(transData);
        } catch (error) {
          
        }
      }
    };
    fetchData();
  }, [token]);

  // Fonction de formatage MISE À JOUR pour un affichage intelligent
  const formatTransaction = (tx: Transaction): TransactionDetails => {
    // Déterminer si l'utilisateur connecté est l'expéditeur
    const isSender = tx.sender?.user.username === user?.username;

    let name = "Transaction";
    let icon = "🔄";
    let bgColor = "bg-gray-100";
    let category = tx.type;
    const isIncome = !isSender;

    if (tx.type === "recharge") {
      name = "Recharge Dinary";
      icon = "📥";
      bgColor = "bg-blue-100";
      category = "Entrée";
    } else if (tx.type === "transfer") {
      if (isSender) {
        // Si je suis l'expéditeur, afficher "Transfert à [destinataire]"
        name = `Transfert à ${tx.receiver.user.fullName}`;
        icon = "↗️";
        bgColor = "bg-purple-100";
        category = "Sortie";
      } else {
        // Si je suis le destinataire, afficher "Transfert de [expéditeur]"
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
        // Paiement reçu
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
    } else if (tx.type === "withdrawal") {
      name = "Retrait vers CCP";
      icon = "🏦";
      bgColor = "bg-orange-100";
      category = "Sortie";
    } else {
      // Type inconnu - utiliser la description
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
      amount: `${isIncome ? "+" : "-"}${tx.amount.toLocaleString("fr-FR")} DA`,
      isPositive: isIncome,
      date: new Date(tx.createdAt).toLocaleDateString("fr-FR", {
        day: "2-digit",
        month: "short",
      }),
      time: new Date(tx.createdAt).toLocaleTimeString("fr-FR", {
        hour: "2-digit",
        minute: "2-digit",
      }),
      points: tx.xpGained && tx.xpGained > 0 ? `+${tx.xpGained} points` : "",
      commission: tx.commission ?? 0,
      cart: tx.cart || [],
      merchant: tx.type === "payment" && isSender ? {
        name: tx.receiver.user.fullName,
      } : undefined,
    };
  };

  return (
    <div className="bg-white min-h-screen mb-16">
      <PageHeader
        title="Portefeuille"
        emoji="💳"
        showBackButton={true}
        backTo="/dashboard"
        actionButton={
          <button className="p-2">
            <span className="text-lg">⚙️</span>
          </button>
        }
      />

      <div className="px-5">
        <div className="my-4">
          <div className="relative bg-gradient-to-br from-blue-900 to-gray-800 text-white p-5 rounded-xl shadow-sm overflow-hidden">
            <div className="mb-3 relative z-10">
              <p className="text-sm opacity-80">Solde disponible</p>
              <div className="flex items-center">
                <h1 className="text-3xl font-bold mt-1 text-white">
                  {wallet
                    ? `${wallet.balance.toLocaleString("fr-FR")} ${
                        wallet.currency
                      }`
                    : "Chargement..."}
                </h1>
              </div>
            </div>
            <div className="flex justify-between mt-4 relative z-10">
              <Link href="/envoyer" className="flex-1 mr-2">
                <button className="w-full bg-white/20 hover:bg-white/30 py-2 rounded-xl flex items-center justify-center backdrop-blur-sm transition-colors">
                  <span className="text-sm mr-1">🚀</span>
                  <span className="text-sm">Envoyer</span>
                </button>
              </Link>
              <Link href="/recharger" className="flex-1 ml-2">
                <button className="w-full bg-white/20 hover:bg-white/30 py-2 rounded-xl flex items-center justify-center backdrop-blur-sm transition-colors">
                  <span className="text-sm mr-1">📥</span>
                  <span className="text-sm">Recharger</span>
                </button>
              </Link>
            </div>
          </div>
        </div>

        <div className="flex justify-between items-center mb-4 mt-6">
          <h2 className="text-lg font-bold">Transactions récentes</h2>
          <Link
            href="/historique"
            className="text-sm text-blue-600 font-medium"
          >
            Tout voir
          </Link>
        </div>

        <div className="space-y-4 mb-8">
          {transactions.length > 0 ? (
            transactions.map((tx) => {
              const formattedTx = formatTransaction(tx);
              return (
                <div
                  key={formattedTx.id}
                  className="p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors cursor-pointer"
                  onClick={() => {
                    setSelectedTransaction(formattedTx);
                    setShowReceipt(true);
                  }}
                >
                  <div className="flex justify-between">
                    <div className="flex items-start">
                      <div
                        className={`w-11 h-11 ${formattedTx.bgColor} rounded-xl flex items-center justify-center mr-3`}
                      >
                        <span className="text-xl">{formattedTx.icon}</span>
                      </div>
                      <div>
                        <p className="font-medium">{formattedTx.name}</p>
                        <p className="text-xs text-gray-500">
                          {formattedTx.date}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p
                        className={`font-medium ${
                          formattedTx.isPositive
                            ? "text-green-600"
                            : "text-red-500"
                        }`}
                      >
                        {formattedTx.amount}
                      </p>
                      <p className="text-xs text-gray-500">
                        {formattedTx.category}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <p className="text-center text-gray-500 py-4">
              Aucune transaction pour le moment.
            </p>
          )}
        </div>
      </div>

      <TransactionReceipt
        isOpen={showReceipt}
        onClose={() => {
          setShowReceipt(false);
          setSelectedTransaction(null);
        }}
        transaction={selectedTransaction}
      />
    </div>
  );
}
