"use client";
import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { motion, useAnimation } from "framer-motion";
import { Loader2 } from "lucide-react";
import MerchantVerificationBanner from "@/components/VerificationBanner";

// --- INTERFACES POUR LES DONNÉES DYNAMIQUES ---
interface Transaction {
  id: string;
  amount: number;
  user: string;
  type: string;
  date: string;
}

interface DashboardData {
  balance: number;
  xp: number;
  level: number;
  xpToNextLevel: number;
  xpPercentage: number;
  totalPoints: number; // Vient de l'API (ex: 500)
  badgesUnlocked: number; // Vient de l'API (ex: 3)
  missionTitle: string; // Vient de l'API (ex: "Encaisser 5 fois")
  missionProgress: number; // Vient de l'API (ex: 3)
  missionTotal: number; // Vient de l'API (ex: 5)
  recentTransactions: Transaction[];
  dailyChange?: number;
}

const DashboardPage = () => {
  // --- GESTION DES DONNÉES ET DE L'AUTHENTIFICATION ---
  const { merchantProfile, isLoading: isAuthLoading, token } = useAuth();
  const [data, setData] = useState<DashboardData | null>(null);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const progressControls = useAnimation();

  // Le reste de vos états pour l'UI
  const [animateXP, setAnimateXP] = useState(false);
  const [showNotification, setShowNotification] = useState<string | null>(null);
  const [currentDate, setCurrentDate] = useState<string>("");

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!isAuthLoading && token) {
        try {
          setIsLoadingData(true); // Assure-toi que le chargement est actif
          const response = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/merchants/dashboard`,
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );
          if (!response.ok) {
            throw new Error(
              "Impossible de charger les données du tableau de bord."
            );
          }
          const apiData = await response.json();

          // ✨ CORRECTION : On utilise directement les données de l'API
          setData(apiData);
        } catch (err: any) {
          setError(err.message);
        } finally {
          setIsLoadingData(false);
        }
      } else if (!isAuthLoading && !token) {
        setError("Token d'authentification manquant.");
        setIsLoadingData(false);
      }
    };

    fetchDashboardData();
  }, [token, isAuthLoading]);

  useEffect(() => {
    const updateDateTime = () => {
      const now = new Date();
      setCurrentDate(
        now.toLocaleDateString("fr-FR", {
          weekday: "long",
          day: "numeric",
          month: "long",
        })
      );
    };
    updateDateTime();
  }, []);

  // Pourcentage d'XP calculé localement (comme dans la page stats)
  const xpPercent = useMemo(() => {
    if (!data || data.xpToNextLevel === 0) return 0;
    return Math.min(
      100,
      Math.max(0, (data.xp / data.xpToNextLevel) * 100)
    );
  }, [data]);

  useEffect(() => {
    // Ne lancez l'animation QUE si les données existent
    if (data && xpPercent > 0) {
      progressControls.start({
        width: `${xpPercent}%`,
        transition: { duration: 1, ease: "easeOut", delay: 0.2 },
      });
    } else if (data && xpPercent === 0) {
      // Si 0, on met à 0 sans animer
      progressControls.set({ width: "0%" });
    }
  }, [data, xpPercent, progressControls]);

  // --- GESTION DE L'AFFICHAGE (CHARGEMENT, ERREUR, SUCCÈS) ---
  if (isAuthLoading || isLoadingData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen text-center">
        <p className="text-red-500 font-semibold">Une erreur est survenue</p>
        <p className="text-gray-600 mt-2">{error}</p>
      </div>
    );
  }

  if (!merchantProfile || !data) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Impossible d'afficher le tableau de bord.</p>
      </div>
    );
  }
  // --- ✨ CORRECTION : Calculer missionPercentage ICI ---
  const missionPercentage =
    data.missionTotal > 0
      ? (data.missionProgress / data.missionTotal) * 100
      : 0;
  // --- FIN DE LA CORRECTION ---

  return (
    <main className="p-4 pb-24 bg-gradient-to-br from-white to-blue-50 min-h-screen max-w-md mx-auto">
      {showNotification && (
        <div className="fixed bottom-20 left-1/2 transform -translate-x-1/2 bg-purple-600 text-white px-4 py-2 rounded-full text-sm shadow-lg animate-fade-in z-50">
          {showNotification}
        </div>
      )}

      {/* 🔒 BANNIÈRE DE VÉRIFICATION D'IDENTITÉ */}
      <div className="mb-5">
        <MerchantVerificationBanner />
      </div>

      <header className="flex justify-between items-center mb-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-blue-600 text-white flex items-center justify-center shadow-sm">
            🏪
          </div>
          <div>
            <h1 className="font-bold text-gray-800">{merchantProfile.name}</h1>
            <p className="text-xs text-gray-500">{currentDate}</p>
          </div>
        </div>
      </header>

      <Link href="/wallet" className="block mb-5 w-full">
        <section className="bg-gradient-to-r from-blue-500 to-purple-600 shadow-md rounded-xl p-5 cursor-pointer hover:shadow-lg transition text-white w-full">
          <div className="text-center">
            <p className="text-blue-100">Solde</p>
            <div className="flex flex-wrap items-center justify-center">
              <h2 className="text-3xl font-bold">
                {data.balance.toLocaleString("fr-FR", {
                  minimumFractionDigits: 2,
                })}{" "}
                DA
              </h2>
            </div>
          </div>
        </section>
      </Link>

      {/* --- SECTION ACTIONS RAPIDES (AVEC TOUS LES BOUTONS) --- */}
      <section className="mb-6">
        <h2 className="text-sm font-medium text-gray-600 mb-2 text-center">
          Actions rapides
        </h2>
        <Link href="/encaisser" className="block mb-3 w-full">
          <button className="w-full py-4 bg-gradient-to-r from-green-400 to-emerald-500 text-white font-bold rounded-xl shadow-md text-center flex items-center justify-center gap-2 hover:shadow-lg hover:opacity-90 transition-all">
            <span className="text-2xl">💵</span>
            <span>Encaisser</span>
          </button>
        </Link>
        <div className="grid grid-cols-3 gap-3">
          <Link href="/recharger-client">
            <button className="w-full py-3 bg-white rounded-xl shadow-sm hover:shadow-md transition flex flex-col items-center justify-center gap-1 h-full">
              <span className="text-xl">📲</span>
              <span className="text-xs text-center">Recharger Client</span>
            </button>
          </Link>
          <Link href="/recharger">
            <button className="w-full py-3 bg-white rounded-xl shadow-sm hover:shadow-md transition flex flex-col items-center justify-center gap-1 h-full">
              <span className="text-xl">💰</span>
              <span className="text-xs text-center">Mon Compte</span>
            </button>
          </Link>
          <Link href="/retraits">
            <button className="w-full py-3 bg-white rounded-xl shadow-sm hover:shadow-md transition flex flex-col items-center justify-center gap-1 h-full">
              <span className="text-xl">💸</span>
              <span className="text-xs text-center">Retraits</span>
            </button>
          </Link>
          <Link href="/rembourser">
            <button className="w-full py-3 bg-white rounded-xl shadow-sm hover:shadow-md transition flex flex-col items-center justify-center gap-1 h-full">
              <span className="text-xl">🔁</span>
              <span className="text-xs text-center">Rembourser</span>
            </button>
          </Link>
          <Link href="/inventaire">
            <button className="w-full py-3 bg-white rounded-xl shadow-sm hover:shadow-md transition flex flex-col items-center justify-center gap-1 h-full">
              <span className="text-xl">📦</span>
              <span className="text-xs text-center">Inventaire</span>
            </button>
          </Link>
          <Link href="/historique">
            <button className="w-full py-3 bg-white rounded-xl shadow-sm hover:shadow-md transition flex flex-col items-center justify-center gap-1 h-full">
              <span className="text-xl">📋</span>
              <span className="text-xs text-center">Historique</span>
            </button>
          </Link>
        </div>
      </section>

      {/* --- SECTION PROGRESSION (DYNAMIQUE) --- */}
      <section className="mb-6 w-full">
        <h2 className="text-sm font-medium text-gray-600 mb-2 text-center">
          Ma progression
        </h2>
        <Link href="/progression" className="block mb-3 w-full">
          <div className="bg-white rounded-xl p-4 shadow-md hover:shadow-lg transition w-full">
            <div className="text-center mb-2">
              <div className="font-bold text-purple-900">
                Niveau {data.level}
              </div>
              <div className="text-xs text-gray-500">
                {/* Affiche le XP actuel (ex: 150) et le XP requis (ex: 1000) */}
                {data.xp}/{data.xpToNextLevel} XP
              </div>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden shadow-inner">
              {/* --- ✨ CORRECTION : Appliquer l'animation ici --- */}
              <motion.div
                className={`h-2 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full`}
                // On initialise à 0%
                initial={{ width: "0%" }}
                // On lie l'animation aux contrôles
                animate={progressControls}
              ></motion.div>
            </div>
          </div>
        </Link>
      </section>

      {/* --- ✨ SECTION RÉCOMPENSES (MISE À JOUR) --- */}
      <section className="w-full">
        <h2 className="text-sm font-medium text-gray-600 mb-2 text-center">
          Récompenses
        </h2>
        {/* Le Link pointe vers la page de récompenses que nous avons faite */}
        <Link href="/rewards" className="block w-full">
          <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl p-4 shadow-md text-white w-full">
            {/* Utilise les données dynamiques de l'API */}
            <div className="text-center mb-2">
              <p className="font-medium">{data.totalPoints} points</p>
              <p className="font-medium">
                Cumulés depuis le début de ce Niveau
              </p>
              <div className="text-xs text-indigo-100">
                {data.badgesUnlocked}{" "}
                {data.badgesUnlocked > 1 ? "défis complétés" : "défi complété"}
              </div>
            </div>
            {/* Affiche la mission uniquement si elle existe (goal > 0) */}
            {data.missionTotal > 0 && (
              <div className="bg-white/10 rounded-lg p-3">
                <div className="text-center text-sm mb-2">
                  {/* Titre dynamique */}
                  <span>{data.missionTitle}</span>
                  <span className="font-medium ml-2">
                    {/* Progrès dynamique */}
                    {data.missionProgress}/{data.missionTotal}
                  </span>
                </div>
                <div className="w-full bg-white/20 rounded-full h-2 overflow-hidden">
                  <motion.div
                    className="h-2 bg-white rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${missionPercentage}%` }} // Barre de mission dynamique
                    transition={{ duration: 0.8, delay: 0.3 }}
                  ></motion.div>
                </div>
              </div>
            )}
          </div>
        </Link>
      </section>
    </main>
  );
};

export default DashboardPage;
