"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link"; // Assurez-vous d'importer Link
import { useAuth } from "@/context/AuthContext";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
  // RadialLinearScale, // Plus nécessaire
} from "chart.js";
// import { Doughnut, Line, Radar } from "react-chartjs-2"; // Radar n'est plus nécessaire
import { Line } from "react-chartjs-2"; // Garder Line et Doughnut si vous voulez le remettre
import { motion } from "framer-motion";
import { Loader2, TrendingUp, Users, ShoppingBag, List } from "lucide-react"; // Ajout d'icônes

// Enregistrement des composants Chart.js (sans Radar)
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement
  // RadialLinearScale // Retiré
);

export default function Stats() {
  // --- Interfaces (simplifiées car Compétences et Récompenses sont retirées) ---
  interface ProductPopular {
    id: string; // Ajout ID si disponible
    name: string;
    sales: number;
    revenue: number; // Ajout revenu si disponible
  }
  interface MonthlyRevenue {
    month: string;
    revenue: number;
    transactions: number;
  }
  interface Transaction {
    id: string;
    amount: number;
    customerName: string; // Renommé depuis 'user' pour clarté
    date: string;
    type: string;
  }
  interface Ventes {
    total: number;
    progression: number; // Pourcentage VERS l'objectif dynamique
    objectif: number; // Objectif DYNAMIQUE
    currentSalesProgress?: number; // Ventes ACTUELLES pour l'objectif
    historiqueLabels: string[];
    historiqueData: number[];
  }
  interface Clients {
    total: number;
    nouveaux: number;
    fideles: number;
  }
  interface Produits {
    populaires: ProductPopular[];
    // stock: number; // On retire le stock total s'il n'est pas utilisé
  }
  // Retrait de Competences et Recompenses des interfaces

  interface StatsState {
    ventes?: Ventes | null;
    clients?: Clients | null;
    produits?: Produits | null;
    niveau?: number | null;
    experience?: number | null;
    experienceRequise?: number | null;
    transactionsRecentes?: Transaction[] | null;
  }

  // État pour stocker les statistiques
  const [stats, setStats] = useState<StatsState>({
    ventes: null,
    clients: null,
    produits: null,
    niveau: null,
    experience: null,
    experienceRequise: null,
    transactionsRecentes: null,
  });

  const [loading, setLoading] = useState(true);
  const { token } = useAuth();

  // Chargement dynamique des données
  useEffect(() => {
    const loadStats = async () => {
      setLoading(true);
      const api = process.env.NEXT_PUBLIC_API_URL;
      if (!api || !token) {
        setLoading(false);
        return;
      }

      try {
        // Appels en parallèle
        const [dashboardRes, statsRes] = await Promise.all([
          fetch(`${api}/merchants/dashboard`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch(`${api}/merchants/me/stats`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        let tempStats: StatsState = {};

        // Traitement dashboard
        if (dashboardRes.ok) {
          const dash = await dashboardRes.json();
          tempStats = {
            ...tempStats,
            niveau: dash.level ?? null,
            experience: dash.xp ?? null,
            experienceRequise: dash.nextLevelXP ?? null,
          };
        } else {
          void 0;
        }

        // Traitement statistiques détaillées
        if (statsRes.ok) {
          const statsData = await statsRes.json();
          // Préparer les données de vente pour le graphique
          const monthlyRevenue: MonthlyRevenue[] = Array.isArray(
            statsData.monthlyRevenue
          )
            ? statsData.monthlyRevenue
            : [];
          // 👇 Utiliser l'objectif dynamique et les ventes courantes
          const salesGoal = statsData.currentSalesGoal ?? 10000; // Prend l'objectif de l'API ou 10000 par défaut
          const currentSales = statsData.currentSalesProgress ?? 0; // Prend les ventes courantes de l'API
          tempStats = {
            ...tempStats,
            ventes: {
              total: statsData.totalRevenue ?? 0, // Garde le revenu total historique si besoin ailleurs
              progression:
                salesGoal > 0
                  ? Math.min(100, (currentSales / salesGoal) * 100)
                  : 0, // Progression vers l'objectif actuel
              objectif: salesGoal, // Objectif actuel
              currentSalesProgress: currentSales, // Ventes actuelles pour cet objectif
              historiqueLabels: monthlyRevenue.map((m) => m.month),
              historiqueData: monthlyRevenue.map((m) => m.revenue),
            },
            clients: {
              total:
                (statsData.newCustomers ?? 0) + (statsData.loyalCustomers ?? 0),
              nouveaux: statsData.newCustomers ?? 0,
              fideles: statsData.loyalCustomers ?? 0,
            },
            produits: {
              populaires: Array.isArray(statsData.popularProducts)
                ? statsData.popularProducts.map((p) => ({
                    id: p.id,
                    name: p.name,
                    sales: p.sales,
                    revenue: p.revenue,
                  }))
                : [],
            },
            transactionsRecentes: Array.isArray(statsData.recentTransactions)
              ? statsData.recentTransactions.map((tx: any) => ({
                  // Utilise 'any' temporairement si la structure exacte n'est pas garantie
                  id: tx.id,
                  amount: tx.amount,
                  customerName: tx.customerName || "Inconnu", // Fallback
                  date: tx.date,
                  type: tx.type,
                }))
              : [],
          };
        } else {
          void 0;
        }

        setStats(tempStats); // Mise à jour unique de l'état
      } catch (err) {
        void 0;
        // Peut-être définir un état d'erreur ici
      } finally {
        setLoading(false);
      }
    };

    loadStats();
  }, [token]);

  // Données pour le graphique des ventes (utilise les labels et données préparés)
  const ventesData = {
    labels: stats.ventes?.historiqueLabels ?? [],
    datasets: [
      {
        label: "Revenu Mensuel (DA)",
        data: stats.ventes?.historiqueData ?? [],
        backgroundColor: "rgba(75, 192, 192, 0.6)", // Couleur turquoise
        borderColor: "rgba(75, 192, 192, 1)",
        borderWidth: 2,
        tension: 0.1, // Pour une courbe légère
      },
    ],
  };

  // Calculer le pourcentage d'expérience
  const experiencePercent = useMemo(() => {
    if (
      stats.experience === null ||
      stats.experienceRequise === null ||
      stats.experienceRequise === 0
    )
      return 0;
    return Math.min(
      100,
      Math.max(0, (stats.experience / stats.experienceRequise) * 100)
    );
  }, [stats.experience, stats.experienceRequise]);

  // Options pour les graphiques pour masquer la légende si désiré
  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        display: false, // Masque la légende
      },
    },
    scales: {
      // Optionnel: pour ajuster les axes si besoin
      y: {
        beginAtZero: true,
      },
    },
  };

  return (
    <div className="p-4 md:p-6 max-w-4xl mx-auto bg-gray-50 min-h-screen">
      <h1 className="text-2xl md:text-3xl font-bold text-center mb-8 text-gray-800">
        📊 Tableau de Statistiques
      </h1>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="animate-spin text-purple-600" size={48} />
        </div>
      ) : (
        <>
          {/* Carte Niveau & Expérience */}
          <motion.div
            className="bg-gradient-to-r from-purple-500 to-indigo-600 rounded-xl shadow-lg p-5 mb-6 text-white"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex items-center justify-between mb-3">
              <div>
                <h2 className="text-xl font-bold">Niveau Actuel</h2>
                <p className="text-sm opacity-90">Votre progression globale</p>
              </div>
              <div className="bg-white/20 rounded-full p-3 h-14 w-14 flex items-center justify-center border-2 border-white/50">
                <span className="text-white text-2xl font-bold">
                  {stats.niveau ?? "—"}
                </span>
              </div>
            </div>
            {/* Barre de progression XP */}
            <div>
              <div className="flex justify-between mb-1 text-xs opacity-80">
                <span>{`${stats.experience ?? 0} XP`}</span>
                <span>{`${stats.experienceRequise ?? 0} XP`}</span>
              </div>
              <div className="w-full bg-white/30 rounded-full h-2.5">
                <motion.div
                  className="bg-yellow-300 h-2.5 rounded-full"
                  initial={{ width: "0%" }}
                  animate={{ width: `${experiencePercent}%` }}
                  transition={{ duration: 1, delay: 0.3 }}
                ></motion.div>
              </div>
              <p className="text-xs mt-1 opacity-80 text-right">
                {`Reste ${Math.max(
                  0,
                  (stats.experienceRequise ?? 0) - (stats.experience ?? 0)
                )} XP`}
              </p>
            </div>
          </motion.div>

          {/* Objectif de ventes & Graphique */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <motion.div
              className="bg-white rounded-xl shadow-lg p-5"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <h2 className="text-lg font-bold mb-3 text-gray-700 flex items-center">
                <TrendingUp size={20} className="mr-2 text-green-500" />{" "}
                Objectif de Ventes (Mois)
              </h2>
              <div className="text-center mb-3">
                {/* 👇 Afficher les ventes courantes / objectif */}
                <p className="text-3xl font-bold text-green-600">
                  {stats.ventes?.currentSalesProgress?.toLocaleString(
                    "fr-DZ"
                  ) ?? "0"}{" "}
                  DA
                </p>
                <p className="text-sm text-gray-500">
                  sur {stats.ventes?.objectif?.toLocaleString("fr-DZ") ?? "0"}{" "}
                  DA
                </p>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
                {/* La barre utilise stats.ventes.progression (calculé en % de l'objectif) */}
                <motion.div
                  className="bg-gradient-to-r from-green-400 to-emerald-500 h-4 rounded-full flex items-center justify-end pr-2 text-xs text-white font-bold"
                  initial={{ width: "0%" }}
                  animate={{ width: `${stats.ventes?.progression ?? 0}%` }}
                  transition={{ duration: 1, delay: 0.5 }}
                >
                  {`${Math.round(stats.ventes?.progression ?? 0)}%`}
                </motion.div>
              </div>
              {/* AJOUT : Lien pour modifier l'objectif */}
              <div className="text-center mt-3">
                <Link
                  href="/boutique?tab=settings#sales-goal"
                  className="text-xs text-blue-600 hover:underline"
                >
                  Modifier l'objectif
                </Link>
              </div>
            </motion.div>

            <motion.div
              className="bg-white rounded-xl shadow-lg p-5"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <h2 className="text-lg font-bold mb-3 text-gray-700">
                Revenu Mensuel
              </h2>
              {/* Graphique des ventes mensuelles */}
              <div className="h-40">
                {" "}
                {/* Limite la hauteur */}
                <Line data={ventesData} options={chartOptions} />
              </div>
            </motion.div>
          </div>

          {/* Statistiques Clients */}
          <motion.div
            className="bg-white rounded-xl shadow-lg p-5 mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <h2 className="text-lg font-bold mb-4 text-gray-700 flex items-center">
              <Users size={20} className="mr-2 text-blue-500" /> Statistiques
              Clients
            </h2>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                <p className="text-sm text-gray-600">Total</p>
                <p className="text-2xl font-bold text-blue-600">
                  {stats.clients?.total ?? "—"}
                </p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg border border-green-100">
                <p className="text-sm text-gray-600">Nouveaux</p>
                <p className="text-2xl font-bold text-green-600">
                  {stats.clients?.nouveaux ?? "—"}
                </p>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg border border-purple-100">
                <p className="text-sm text-gray-600">Fidèles</p>
                <p className="text-2xl font-bold text-purple-600">
                  {stats.clients?.fideles ?? "—"}
                </p>
              </div>
            </div>
            <div className="mt-4 text-center">
              <p className="text-sm text-gray-600">Taux de fidélité</p>
              <p className="text-xl font-bold text-purple-700 mt-1">
                {`${Math.round(
                  ((stats.clients?.fideles ?? 0) /
                    (stats.clients?.total || 1)) *
                    100
                )}%`}
              </p>
            </div>
          </motion.div>

          {/* Produits Populaires */}
          <motion.div
            className="bg-white rounded-xl shadow-lg p-5 mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold text-gray-700 flex items-center">
                <ShoppingBag size={20} className="mr-2 text-amber-500" />{" "}
                Produits Populaires
              </h2>
              <Link
                href="/inventaire"
                className="text-sm text-blue-600 hover:underline"
              >
                Voir l'inventaire complet →
              </Link>
            </div>
            {stats.produits?.populaires &&
            stats.produits.populaires.length > 0 ? (
              <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
                {stats.produits.populaires.map((p, index) => (
                  <div
                    key={p.id || index}
                    className="flex justify-between items-center bg-gray-50 p-3 rounded-lg border"
                  >
                    <div>
                      <p className="font-medium text-gray-800">{p.name}</p>
                      <p className="text-xs text-gray-500">
                        {p.revenue.toLocaleString("fr-DZ")} DA générés
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-blue-600">{p.sales}</p>
                      <p className="text-xs text-gray-500">ventes</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500 text-center py-4">
                Aucune donnée sur les produits populaires.
              </p>
            )}
          </motion.div>

          {/* Transactions Récentes */}
          <motion.div
            className="bg-white rounded-xl shadow-lg p-5"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold text-gray-700 flex items-center">
                <List size={20} className="mr-2 text-indigo-500" /> Transactions
                Récentes
              </h2>
              <Link
                href="/historique"
                className="text-sm text-blue-600 hover:underline"
              >
                Voir l'historique complet →
              </Link>
            </div>
            {stats.transactionsRecentes &&
            stats.transactionsRecentes.length > 0 ? (
              <div className="space-y-3 max-h-72 overflow-y-auto pr-2">
                {stats.transactionsRecentes.map((tx) => (
                  <div
                    key={tx.id}
                    className="flex justify-between items-center bg-gray-50 p-3 rounded-lg border"
                  >
                    <div>
                      <p className="font-medium text-gray-800">
                        {tx.type === "payment" ? "Paiement reçu" : tx.type}
                      </p>
                      <p className="text-xs text-gray-500">
                        De: {tx.customerName} -{" "}
                        {new Date(tx.date).toLocaleDateString("fr-FR")}
                      </p>
                    </div>
                    <p className="font-bold text-green-600">
                      +{tx.amount.toLocaleString("fr-DZ")} DA
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500 text-center py-4">
                Aucune transaction récente.
              </p>
            )}
          </motion.div>
        </>
      )}
    </div>
  );
}
