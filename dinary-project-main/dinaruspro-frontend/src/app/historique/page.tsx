"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext"; // Assure-toi que le chemin est correct
import {
  Loader2,
  ArrowLeft,
  Download,
  Calendar as CalendarIcon,
  Filter,
  X,
} from "lucide-react"; // Ajout d'icônes

// --- INTERFACES ---

// Interface pour les articles DANS la transaction récupérée de l'API (peut être null ou une structure JSON)
interface ApiCartItem {
  id?: string; // L'ID du produit si disponible
  name: string;
  quantity: number;
  price: number;
  // Ajoute d'autres champs si ton backend les renvoie (ex: emoji)
}

// Interface pour UNE transaction récupérée de l'API backend
interface ApiTransaction {
  id: string; // L'ID est une string (UUID/CUID)
  amount: number;
  type: string; // Ex: 'payment', 'withdrawal', 'refund', 'RECHARGE_FROM_MERCHANT', 'MERCHANT_RECHARGE_DEBIT' etc.
  description: string | null;
  createdAt: string; // Date ISO string (ex: "2023-10-27T10:30:00.000Z")
  senderId: string | null; // ID du Wallet de l'expéditeur
  receiverId: string; // ID du Wallet du destinataire
  sender?: { user?: { username?: string; fullName?: string } } | null; // Infos optionnelles
  receiver?: { user?: { username?: string; fullName?: string } } | null; // Infos optionnelles
  status: string; // Ex: 'completed', 'pending', 'failed', 'refunded'
  reference?: string | null;
  commission?: number | null;
  cart?: ApiCartItem[] | null; // Le panier peut être un tableau ou null/undefined
}

// Interface pour les transactions formatées POUR l'affichage frontend
interface FormattedTransaction {
  id: string; // Garde l'ID string
  type: string; // Garde le type backend pour le filtrage
  montant: string; // Formaté : "+ 1500 DA" ou "- 500 DA"
  description: string; // Description formatée
  source: string; // Qui a envoyé/reçu : "De: Client X" / "À: Client Y" / "Retrait CCP" etc.
  date: string; // Formaté pour affichage : "26 oct. 2023 à 14:30"
  dateISO: string; // Format YYYY-MM-DD pour le filtre de date
  emoji: string; // Basé sur le type et la direction
  color: "green" | "red" | "blue" | "orange" | "purple" | "gray"; // Pour le style
  articles: { nom: string; quantité: number; prix: number }[]; // Formaté depuis le 'cart'
  status: string; // Statut backend
}

const HistoriquePage = () => {
  const { token, user } = useAuth(); // Récupère l'utilisateur connecté pour l'ID du wallet

  // --- États pour les données dynamiques ---
  const [transactions, setTransactions] = useState<FormattedTransaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // --- États pour les filtres et UI ---
  const [filterType, setFilterType] = useState("tous");
  const [showDateFilter, setShowDateFilter] = useState(false);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [exportingPDF, setExportingPDF] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  
  // --- États pour la pagination ---
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 10; // Nombre de transactions par page

  // --- Fonction pour récupérer et transformer les données ---
  const fetchTransactions = useCallback(async () => {
    if (!token || !user?.wallet?.id) {
      setError(
        "Impossible de charger l'historique : informations utilisateur manquantes."
      );
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/wallet/transactions`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (!response.ok) {
        throw new Error(
          `Erreur ${response.status}: Impossible de récupérer les transactions.`
        );
      }
      const apiData: ApiTransaction[] = await response.json();

      // Transformation des données API en format pour l'affichage
      const formattedData = apiData.map((tx): FormattedTransaction => {
        const userWalletId = user.wallet.id;
        const isIncome =
          tx.receiverId === userWalletId && tx.senderId !== userWalletId; // Argent reçu (et pas de soi-même)
        const isOutcome =
          tx.senderId === userWalletId && tx.receiverId !== userWalletId; // Argent envoyé (et pas à soi-même)
        // Cas particulier: retrait (sender = receiver = user), recharge admin (pas de sender)

        let direction: "in" | "out" | "self" | "system" = "system";
        if (isIncome) direction = "in";
        else if (isOutcome) direction = "out";
        else if (tx.senderId === userWalletId && tx.receiverId === userWalletId)
          direction = "self"; // Ex: retrait
        else if (!tx.senderId && tx.receiverId === userWalletId)
          direction = "in"; // Ex: recharge admin, bonus

        const montantPrefix =
          direction === "out" ||
          tx.type === "MERCHANT_RECHARGE_DEBIT" ||
          tx.type === "withdrawal"
            ? "-"
            : "+";
        const montantFormatted = `${montantPrefix} ${tx.amount.toLocaleString(
          "fr-DZ"
        )} DA`;

        let source = "";
        let displayDescription = "";
        
        if (direction === "in") {
          if (tx.sender?.user?.fullName) {
            displayDescription = tx.sender.user.fullName;
            source = tx.type === "payment" ? "Paiement reçu" : "Virement reçu";
          } else if (tx.type === "RECHARGE_FROM_MERCHANT") {
            displayDescription = "Recharge par marchand";
            source = "Crédit";
          } else if (tx.type === "recharge") {
            displayDescription = "Recharge Dinary";
            source = "Crédit";
          } else if (tx.type === "bonus") {
            displayDescription = "Bonus Dinary";
            source = "Récompense";
          } else if (tx.type === "refund") {
            displayDescription = "Remboursement reçu";
            source = "Crédit";
          } else {
            displayDescription = "Source inconnue";
            source = "Crédit";
          }
        } else if (direction === "out") {
          if (tx.receiver?.user?.fullName) {
            displayDescription = tx.receiver.user.fullName;
            source = tx.type === "payment" ? "Paiement envoyé" : "Virement envoyé";
          } else if (tx.type === "MERCHANT_RECHARGE_DEBIT") {
            displayDescription = "Recharge client";
            source = "Débit";
          } else if (tx.type === "refund") {
            displayDescription = "Remboursement envoyé";
            source = "Débit";
          } else {
            displayDescription = "Destination inconnue";
            source = "Débit";
          }
        } else if (direction === "self" && tx.type === "withdrawal") {
          displayDescription = "Retrait vers CCP";
          source = "Débit";
        } else {
          displayDescription = tx.description || "Opération système";
          source = "";
        }
        
        // Utiliser la description personnalisée si elle n'existe pas déjà
        if (!displayDescription) {
          displayDescription = tx.description || tx.type.replace(/_/g, " ").charAt(0).toUpperCase() + tx.type.replace(/_/g, " ").slice(1).toLowerCase();
        }

        const dateObj = new Date(tx.createdAt);
        const dateDisplay =
          dateObj.toLocaleDateString("fr-FR", {
            day: "2-digit",
            month: "short",
            year: "numeric",
          }) +
          " à " +
          dateObj.toLocaleTimeString("fr-FR", {
            hour: "2-digit",
            minute: "2-digit",
          });
        const dateISO = dateObj.toISOString().split("T")[0];

        const { emoji, color } = getTypeDetails(tx.type, direction);

        const articles = Array.isArray(tx.cart)
          ? tx.cart.map((item) => ({
              nom: item.name || "Article",
              quantité: item.quantity || 0,
              prix: item.price || 0,
            }))
          : [];

        return {
          id: tx.id,
          type: tx.type, // Garde le type original pour le filtre
          montant: montantFormatted,
          description: displayDescription, // Affiche le nom de la personne en priorité
          source: source, // Type de transaction (Paiement reçu, etc.)
          date: dateDisplay,
          dateISO: dateISO,
          emoji: emoji,
          color: color,
          articles: articles,
          status: tx.status,
        };
      });

      setTransactions(formattedData);
    } catch (err: any) {
      setError(err.message);
      setTransactions([]); // Vider en cas d'erreur
    } finally {
      setIsLoading(false);
    }
  }, [token, user?.wallet?.id]); // Dépend du token ET de l'ID du wallet

  // --- Effet pour charger les données au montage et si fetchTransactions change ---
  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  // --- Fonction pour télécharger une facture ---
  const handleDownloadInvoice = async (transactionId: string) => {
    if (!token) {
      alert("Vous devez être connecté pour télécharger une facture.");
      return;
    }

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/wallet/transaction/${transactionId}/invoice`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({
          message: "Le téléchargement de la facture a échoué.",
        }));
        throw new Error(errorData.message);
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `facture-dinary-${transactionId}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (error: any) {
      void 0;
      alert(`Erreur lors du téléchargement: ${error.message}`);
    }
  };

  // --- Filtrage des transactions (utilise les données formatées) ---
  const filteredTransactions = useMemo(() => {
    return transactions.filter((transaction) => {
      // Filtre par type (utilise le type backend original)
      let matchesType = filterType === "tous";
      if (filterType === "paiement")
        matchesType = transaction.type === "payment"; // Paiements reçus/envoyés
      if (filterType === "retrait")
        matchesType = transaction.type === "withdrawal";
      if (filterType === "remboursement")
        matchesType = transaction.type === "refund";
      if (filterType === "recharge_client")
        matchesType = transaction.type === "MERCHANT_RECHARGE_DEBIT" || transaction.type === "RECHARGE_FROM_MERCHANT";

      // Filtre par date (utilise dateISO formatée)
      let matchesDateRange = true;
      if (startDate && transaction.dateISO < startDate)
        matchesDateRange = false;
      if (endDate && transaction.dateISO > endDate) matchesDateRange = false;

      return matchesType && matchesDateRange;
    });
  }, [transactions, filterType, startDate, endDate]);

  // --- Pagination ---
  const totalPages = Math.ceil(filteredTransactions.length / ITEMS_PER_PAGE);
  const paginatedTransactions = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    return filteredTransactions.slice(startIndex, endIndex);
  }, [filteredTransactions, currentPage]);

  // Réinitialiser la page à 1 quand les filtres changent
  useEffect(() => {
    setCurrentPage(1);
  }, [filterType, startDate, endDate]);

  // --- Calcul des totaux (utilise les données filtrées et formatées) ---
  const { totalEntrees, totalSorties } = useMemo(() => {
    let entrees = 0;
    let sorties = 0;
    filteredTransactions.forEach((t) => {
      const amount = parseFloat(
        t.montant.replace(/[^\d,-]/g, "").replace(",", ".")
      ); // Extrait le nombre
      if (t.montant.startsWith("+")) {
        entrees += amount;
      } else if (t.montant.startsWith("-")) {
        sorties += Math.abs(amount); // Prend la valeur absolue pour le total des sorties
      }
    });
    return { totalEntrees: entrees, totalSorties: sorties };
  }, [filteredTransactions]);

  // Obtenir la date d'aujourd'hui au format YYYY-MM-DD
  const today = useMemo(() => new Date().toISOString().split("T")[0], []);

  const handleExportPDF = async () => {
    if (!token) {
      setError("Vous n'êtes pas connecté.");
      return;
    }

    setExportingPDF(true);

    try {
      // 1. Construire l'URL avec les filtres de date s'ils existent
      const url = new URL(
        `${process.env.NEXT_PUBLIC_API_URL}/wallet/history/pdf`
      );
      if (startDate) {
        url.searchParams.append("from", startDate);
      }
      if (endDate) {
        url.searchParams.append("to", endDate);
      }

      // 2. Appeler l'API
      const response = await fetch(url.toString(), {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Échec de la génération du PDF.");
      }

      // 3. Gérer le téléchargement
      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = downloadUrl;

      // Générer un nom de fichier dynamique
      const dateStr = new Date().toISOString().split("T")[0];
      link.download = `historique-dinary-${dateStr}.pdf`;

      document.body.appendChild(link);
      link.click();

      // 4. Nettoyer
      link.remove();
      window.URL.revokeObjectURL(downloadUrl);
      setShowExportModal(false);
    } catch (err: any) {
      // Afficher une notification d'erreur (vous pouvez améliorer ceci)
      const notification = document.createElement("div");
      notification.className =
        "fixed bottom-20 left-1/2 transform -translate-x-1/2 px-4 py-2 rounded-full bg-red-500 text-white text-sm font-medium z-50 shadow-lg";
      notification.textContent = `Erreur: ${err.message || "Inconnue"}`;
      document.body.appendChild(notification);
      setTimeout(() => {
        notification.remove();
      }, 4000);
    } finally {
      setExportingPDF(false);
    }
  };

  // Fonction pour obtenir emoji/couleur (mise à jour pour plus de types)
  const getTypeDetails = (
    type: string,
    direction: "in" | "out" | "self" | "system"
  ): { emoji: string; color: FormattedTransaction["color"] } => {
    const lowerType = type.toLowerCase();
    switch (lowerType) {
      case "payment":
        return direction === "in"
          ? { emoji: "💰", color: "green" }
          : { emoji: "💳", color: "red" };
      case "transfer":
        return direction === "in"
          ? { emoji: "📥", color: "blue" }
          : { emoji: "📤", color: "orange" };
      case "recharge":
      case "recharge_from_merchant":
        return { emoji: "🔋", color: "green" };
      case "merchant_recharge_debit":
        return { emoji: "📲", color: "red" };
      case "withdrawal":
        return { emoji: "💸", color: "red" };
      case "refund":
        return direction === "in"
          ? { emoji: "🔄", color: "blue" }
          : { emoji: "↩️", color: "orange" };
      case "bonus":
        return { emoji: "⭐", color: "purple" };
      default:
        return { emoji: "🧾", color: "gray" }; // Emoji par défaut
    }
  };

  // Fonction pour obtenir la couleur CSS (inchangée)
  const getColorClasses = (
    color: FormattedTransaction["color"]
  ): { bg: string; text: string } => {
    switch (color) {
      case "green":
        return { bg: "bg-green-100", text: "text-green-700" };
      case "red":
        return { bg: "bg-red-100", text: "text-red-700" };
      case "blue":
        return { bg: "bg-blue-100", text: "text-blue-700" };
      case "orange":
        return { bg: "bg-orange-100", text: "text-orange-700" };
      case "purple":
        return { bg: "bg-purple-100", text: "text-purple-700" };
      case "gray":
      default:
        return { bg: "bg-gray-100", text: "text-gray-700" };
    }
  };

  return (
    <main className="p-4 pb-24 bg-gray-50 min-h-screen text-gray-800 font-sans max-w-md mx-auto">
      {/* --- Header --- */}
      <header className="mb-5">
        <div className="flex items-center gap-3 mb-4">
          <Link
            href="/dashboard"
            className="p-2 text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft size={20} />
          </Link>
          <h1 className="text-xl font-semibold text-gray-900">
            Historique des Transactions
          </h1>
        </div>

        {/* --- Section Filtres et Export --- */}
        <section className="bg-white shadow rounded-xl p-4 border border-gray-100">
          <div className="flex justify-between items-center mb-3">
            <p className="text-xs text-gray-500">
              Filtrer ou exporter vos transactions
            </p>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowDateFilter(!showDateFilter)}
                className={`text-xs font-medium flex items-center gap-1 p-1 rounded ${
                  showDateFilter
                    ? "text-blue-600 bg-blue-50"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                <CalendarIcon size={14} /> Dates
              </button>
              <button
                onClick={() => setShowExportModal(true)}
                className="text-xs font-medium flex items-center gap-1 p-1 text-gray-500 hover:text-gray-700"
              >
                <Download size={14} /> Exporter
              </button>
            </div>
          </div>

          {/* Filtre par date */}
          {showDateFilter && (
            <div className="mt-3 bg-gray-50 p-3 rounded-lg border border-gray-200">
              <div className="grid grid-cols-2 gap-2 mb-2">
                <div>
                  <label
                    htmlFor="start-date"
                    className="block text-xs text-gray-500 mb-1"
                  >
                    Début
                  </label>
                  <input
                    type="date"
                    id="start-date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    max={endDate || today}
                    className="input-date"
                  />
                </div>
                <div>
                  <label
                    htmlFor="end-date"
                    className="block text-xs text-gray-500 mb-1"
                  >
                    Fin
                  </label>
                  <input
                    type="date"
                    id="end-date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    max={today}
                    min={startDate}
                    className="input-date"
                  />
                </div>
              </div>
              <div className="flex justify-between items-center mt-1">
                <button
                  onClick={() => {
                    setStartDate("");
                    setEndDate("");
                  }}
                  className="text-xs text-gray-500 hover:text-gray-700"
                >
                  {" "}
                  Réinitialiser{" "}
                </button>
                {/* <button onClick={() => setEndDate(today)} className="text-xs text-blue-600 hover:text-blue-800"> Aujourd'hui </button> */}
              </div>
            </div>
          )}
        </section>
      </header>

      {/* --- Filtres Rapides par Type --- */}
      <section className="mb-5">
        <div className="grid grid-cols-3 gap-2">
          {/* Utilise un map pour générer les boutons de filtre */}
          {[
            { key: "tous", label: "Tous", emoji: "💵" },
            { key: "paiement", label: "Paiements", emoji: "💰" },
            { key: "recharge_client", label: "Recharges", emoji: "🔋" },
            { key: "retrait", label: "Retraits", emoji: "💸" },
            { key: "remboursement", label: "Remboursements", emoji: "🔄" },
          ].map((filter) => (
            <button
              key={filter.key}
              onClick={() => setFilterType(filter.key)}
              className={`px-3 py-2.5 rounded-xl text-xs font-medium flex flex-col items-center gap-1 transition-all duration-200 border ${
                filterType === filter.key
                  ? "bg-blue-600 text-white border-blue-600 shadow-lg scale-105"
                  : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50 hover:border-gray-300"
              }`}
            >
              <span className="text-lg">{filter.emoji}</span>
              <span className="text-[10px] leading-tight text-center">{filter.label}</span>
            </button>
          ))}
        </div>
      </section>

      {/* --- Résumé --- */}
      <section className="bg-white shadow rounded-xl p-4 mb-5 border border-gray-100">
        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
          Résumé ({filteredTransactions.length})
        </h3>
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-green-50 p-3 rounded-lg border border-green-100">
            <p className="text-xs text-green-700">Total Entrées</p>
            <p className="text-base font-bold text-green-700">
              +{totalEntrees.toLocaleString("fr-DZ")} DA
            </p>
          </div>
          <div className="bg-red-50 p-3 rounded-lg border border-red-100">
            <p className="text-xs text-red-700">Total Sorties</p>
            <p className="text-base font-bold text-red-700">
              -{totalSorties.toLocaleString("fr-DZ")} DA
            </p>
          </div>
        </div>
      </section>

      {/* --- Liste des transactions --- */}
      <section className="space-y-3 text-sm">
        {isLoading ? (
          <div className="text-center py-10 text-gray-500">
            <Loader2 className="animate-spin text-blue-500 mx-auto" size={24} />
            <p className="text-sm mt-2">Chargement de l'historique...</p>
          </div>
        ) : error ? (
          <div className="text-center py-10 text-red-600 bg-red-50 p-4 rounded-lg">
            <p className="font-medium text-sm">Erreur</p>
            <p className="text-xs mt-1">{error}</p>
            <button
              onClick={fetchTransactions}
              className="mt-4 text-blue-600 underline text-xs"
            >
              Réessayer
            </button>
          </div>
        ) : paginatedTransactions.length > 0 ? (
          paginatedTransactions.map((transaction) => {
            const colorClasses = getColorClasses(transaction.color);
            return (
              <div
                key={transaction.id}
                className="p-3 bg-white rounded-lg border border-gray-100 shadow-sm"
              >
                <div className="flex justify-between items-start mb-1.5">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-8 h-8 ${colorClasses.bg} rounded-full flex items-center justify-center text-base ${colorClasses.text}`}
                    >
                      {transaction.emoji}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-800 text-sm">
                        {transaction.description}
                      </p>
                      <p className="text-xs text-gray-500">
                        {transaction.source}
                      </p>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0 pl-2">
                    <p
                      className={`font-bold text-sm ${
                        transaction.montant.startsWith("+")
                          ? "text-green-600"
                          : "text-red-600"
                      }`}
                    >
                      {transaction.montant}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {transaction.date}
                    </p>
                  </div>
                </div>

                {/* Articles (si présents) */}
                {transaction.articles && transaction.articles.length > 0 && (
                  <div className="ml-11 mt-2 border-t border-gray-100 pt-2 space-y-0.5">
                    {/* <p className="text-xs text-gray-500 mb-1">Détails:</p> */}
                    {transaction.articles.map((article, index) => (
                      <div
                        key={index}
                        className="flex justify-between text-xs text-gray-600"
                      >
                        <span>
                          {article.nom} x{article.quantité}
                        </span>
                        <span>
                          {(article.prix * article.quantité).toLocaleString(
                            "fr-DZ"
                          )}{" "}
                          DA
                        </span>
                      </div>
                    ))}
                  </div>
                )}
                {/* Afficher le statut si ce n'est pas 'completed' */}
                {transaction.status !== "completed" && (
                  <div className="ml-11 mt-2 text-right">
                    <span
                      className={`text-xs px-1.5 py-0.5 rounded font-medium ${
                        transaction.status === "pending"
                          ? "bg-yellow-100 text-yellow-800"
                          : transaction.status === "failed" ||
                            transaction.status === "rejected"
                          ? "bg-red-100 text-red-800"
                          : transaction.status === "refunded" ||
                            transaction.status === "partially_refunded"
                          ? "bg-blue-100 text-blue-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {transaction.status}
                    </span>
                  </div>
                )}
                
                {/* Bouton de téléchargement de facture */}
                <div className="mt-3 pt-3 border-t border-gray-100">
                  <button
                    onClick={() => handleDownloadInvoice(transaction.id)}
                    className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-xs font-semibold rounded-lg hover:shadow-md active:scale-[0.98] transition-all"
                  >
                    <span>📄</span>
                    <span>Télécharger la facture</span>
                  </button>
                </div>
              </div>
            );
          })
        ) : (
          <div className="py-10 text-center text-gray-500">
            <p className="text-sm italic">Aucune transaction trouvée</p>
            {(filterType !== "tous" || startDate || endDate) && (
              <button
                onClick={() => {
                  setFilterType("tous");
                  setStartDate("");
                  setEndDate("");
                }}
                className="mt-2 text-blue-600 underline text-xs"
              >
                Voir toutes les transactions
              </button>
            )}
          </div>
        )}
      </section>

      {/* --- Pagination --- */}
      {!isLoading && !error && filteredTransactions.length > 0 && totalPages > 1 && (
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
              // Afficher seulement certaines pages pour éviter trop de boutons
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
                      ? 'bg-blue-600 text-white shadow-md'
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

      {/* Modal d'export PDF (inchangé) */}
      {showExportModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-5 shadow-xl w-full max-w-sm">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-gray-800">
                Exporter en PDF
              </h2>
              <button
                onClick={() => setShowExportModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={20} />
              </button>
            </div>

            <div className="mb-5">
              <p className="text-sm text-gray-600 mb-3">
                Sélectionnez la période :
              </p>
              <div className="grid grid-cols-2 gap-3 mb-3">
                <div>
                  <label
                    htmlFor="export-start-date"
                    className="block text-xs text-gray-500 mb-1"
                  >
                    Début
                  </label>
                  <input
                    type="date"
                    id="export-start-date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    max={endDate || today}
                    className="input-date"
                  />
                </div>
                <div>
                  <label
                    htmlFor="export-end-date"
                    className="block text-xs text-gray-500 mb-1"
                  >
                    Fin
                  </label>
                  <input
                    type="date"
                    id="export-end-date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    max={today}
                    min={startDate}
                    className="input-date"
                  />
                </div>
              </div>
              <div className="flex justify-between items-center mt-1">
                <button
                  onClick={() => {
                    setStartDate("");
                    setEndDate("");
                  }}
                  className="text-xs text-gray-500 hover:text-gray-700"
                >
                  {" "}
                  Réinitialiser{" "}
                </button>
              </div>
            </div>

            {/* Résumé pour l'export */}
            <div className="bg-gray-50 p-3 rounded-lg border border-gray-200 mb-5 text-xs">
              <div className="flex justify-between mb-1">
                {" "}
                <span className="text-gray-600">Transactions:</span>{" "}
                <span className="font-medium text-blue-600">
                  {filteredTransactions.length}
                </span>{" "}
              </div>
              <div className="flex justify-between mb-1">
                {" "}
                <span className="text-gray-500">Entrées:</span>{" "}
                <span className="text-green-600">
                  +{totalEntrees.toLocaleString("fr-DZ")} DA
                </span>{" "}
              </div>
              <div className="flex justify-between">
                {" "}
                <span className="text-gray-500">Sorties:</span>{" "}
                <span className="text-red-600">
                  -{totalSorties.toLocaleString("fr-DZ")} DA
                </span>{" "}
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowExportModal(false)}
                className="btn-secondary flex-1"
              >
                {" "}
                Annuler{" "}
              </button>
              <button
                onClick={handleExportPDF} // 👈 VÉRIFIEZ CETTE LIGNE
                disabled={exportingPDF}
                className={`btn-primary flex-1 flex items-center justify-center gap-2 ${
                  exportingPDF ? "opacity-70 cursor-not-allowed" : ""
                }`}
              >
                {exportingPDF ? (
                  <>
                    {" "}
                    <Loader2 className="animate-spin" size={16} /> Export...
                  </>
                ) : (
                  <>
                    <Download size={16} /> Exporter
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- Ajout des styles globaux si nécessaire --- */}
      <style jsx global>{`
        .input-date {
          @apply w-full text-sm border border-gray-200 rounded-lg px-3 py-1.5 bg-white focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none;
        }
        .btn-primary {
          @apply inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium disabled:opacity-50 transition-colors;
        }
        .btn-secondary {
          @apply inline-flex items-center px-4 py-2 bg-white border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 transition-colors;
        }
        .select-primary {
          @apply mt-1 block w-full pl-3 pr-10 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm;
        }
        .label-primary {
          @apply block text-sm font-medium text-gray-700 mb-1;
        }
      `}</style>
    </main>
  );
};

export default HistoriquePage;
