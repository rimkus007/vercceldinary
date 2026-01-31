"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import {
  Loader2,
  CheckCircle,
  Target,
  Users,
  Copy,
  ArrowLeft,
} from "lucide-react"; // Retiré Award, Gift
import { motion, AnimatePresence } from "framer-motion";
import { useReferralRules } from "@/hooks/useReferralRules";

// --- INTERFACES ---
interface Referral {
  id: string;
  name: string; // Utilise 'name' comme retourné par l'API
  date: number; // Timestamp
  status: "pending" | "completed"; // Statut retourné par l'API
}

interface ReferralData {
  referralCode: string;
  referrals: Referral[];
  totalEarned: number;
}

interface Mission {
  // Cette interface représente maintenant nos "Badges/Défis"
  id: string;
  title: string;
  description: string;
  xpReward: number;
  goal: number;
  type: string;
  icon: string;
  progress: number;
  isCompleted: boolean;
  completedAt: string | null;
}

// Pas besoin de badges statiques
// Pas besoin de bonus statiques

const RewardsPage = () => {
  const { token, user } = useAuth();
  const searchParams = useSearchParams();
  const tabParam = searchParams.get("tab");

  // Définit l'onglet actif par défaut sur "defis" (anciennement "missions")
  const [activeTab, setActiveTab] = useState(tabParam || "defis");

  // États pour le Parrainage
  const [referralData, setReferralData] = useState<ReferralData | null>(null);
  const [isLoadingReferrals, setIsLoadingReferrals] = useState(false);
  const [referralsError, setReferralsError] = useState<string | null>(null);
  const [showCopied, setShowCopied] = useState(false);

  // États pour les Défis (anciennement Missions)
  const [missions, setMissions] = useState<Mission[]>([]); // Renommé missions en défis si tu préfères
  const [isLoadingMissions, setIsLoadingMissions] = useState(false);
  const [missionsError, setMissionsError] = useState<string | null>(null);

  // Points totaux
  const [totalPoints, setTotalPoints] = useState(0);

  // 🎯 Récupérer les règles de parrainage depuis le backend
  const { merchantToUserReward, merchantToMerchantReward, loading: rulesLoading } = useReferralRules('MERCHANT');

  // --- Fonctions de Fetch ---
  const fetchReferralData = useCallback(async () => {
    // ... (inchangé) ...
    if (!token) return;
    setIsLoadingReferrals(true);
    setReferralsError(null);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/users/me/referral-details`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (!response.ok) throw new Error("Erreur chargement parrainage.");
      const rawData = await response.json();
      // Assurer la compatibilité avec l'interface Referral
      const formattedReferrals = rawData.referrals.map((ref: any) => ({
        id: ref.id,
        name: ref.name, // S'assurer que le backend renvoie 'name'
        date: ref.date, // S'assurer que le backend renvoie 'date' (timestamp)
        status: ref.status, // S'assurer que le backend renvoie 'status'
      }));

      setReferralData({
        referralCode: rawData.referralCode,
        totalEarned: rawData.totalEarned,
        referrals: formattedReferrals,
      });
    } catch (error: any) {
      setReferralsError(error.message);
    } finally {
      setIsLoadingReferrals(false);
    }
  }, [token]);

  const fetchMissions = useCallback(async () => {
    // Renommé en fetchDéfis si tu préfères partout
    // ... (inchangé) ...
    if (!token) return;
    setIsLoadingMissions(true);
    setMissionsError(null);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/gamification/missions`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (!response.ok) throw new Error("Erreur chargement défis.");
      const data: Mission[] = await response.json();
      setMissions(data);
    } catch (error: any) {
      setMissionsError(error.message);
    } finally {
      setIsLoadingMissions(false);
    }
  }, [token]);

  const fetchProfileData = useCallback(async () => {
    // ... (inchangé - récupère les points) ...
    if (!token) return;
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/gamification/profile`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (response.ok) {
        const profileData = await response.json();
        setTotalPoints(profileData.xp || 0);
      } else {
        void 0;
      }
    } catch (error) {
      void 0;
    }
  }, [token]);

  // Effet pour charger les données
  useEffect(() => {
    fetchProfileData(); // Toujours charger le profil
    if (activeTab === "parrainage") fetchReferralData();
    if (activeTab === "defis") fetchMissions(); // Utilise 'defis'
  }, [activeTab, fetchReferralData, fetchMissions, fetchProfileData]);

  // Effet pour le message "copié"
  useEffect(() => {
    // ... (inchangé) ...
    if (showCopied) {
      const timer = setTimeout(() => setShowCopied(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [showCopied]);

  // Fonction pour copier
  const copyReferralCode = () => {
    // ... (inchangé) ...
    if (referralData?.referralCode) {
      navigator.clipboard
        .writeText(referralData.referralCode)
        .then(() => setShowCopied(true))
        .catch((err) => { void 0; });
    }
  };

  // Calculs pour les stats (simplifié)
  const missionsCompletedCount = useMemo(
    () => missions.filter((m) => m.isCompleted).length,
    [missions]
  );
  const referralsCount = useMemo(
    () => referralData?.referrals?.length || 0,
    [referralData]
  );

  return (
    // ✨ Restauration du style de fond et de la structure générale
    <main className="p-4 pb-24 bg-gradient-to-b from-blue-50 to-white min-h-screen max-w-md mx-auto text-gray-800">
      {/* Message "Copié" */}
      <AnimatePresence>
        {showCopied && (
          <motion.div /* Style inchangé */
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-20 left-1/2 transform -translate-x-1/2 bg-green-600 text-white px-4 py-2 rounded-lg text-sm shadow-lg z-50"
          >
            Code copié !
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <section className="flex items-center mb-6">
        <Link
          href="/dashboard"
          className="p-2 mr-2 text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="text-xl font-semibold text-gray-900">
            Récompenses & Parrainage
          </h1>
          <p className="text-sm text-gray-500">
            {totalPoints} points accumulés
          </p>
        </div>
      </section>

      {/* Stats - ✨ Restauration du style violet/bleu */}
      <section className="mb-6 bg-gradient-to-r from-blue-600 to-purple-600 shadow-lg rounded-xl p-4 text-white">
        <div className="text-center mb-3">
          <p className="text-sm opacity-80">Vos Accomplissements</p>
        </div>
        {/* Grille de stats */}
        <div className="grid grid-cols-2 gap-4">
          {" "}
          {/* Changé en 2 colonnes */}
          {/* Défis (Missions) */}
          <div className="bg-white/20 rounded-lg p-3 text-center backdrop-blur-sm">
            <Target className="mx-auto mb-1 opacity-80" size={24} />
            <p className="text-xl font-bold">
              {isLoadingMissions
                ? "..."
                : `${missionsCompletedCount} / ${missions.length}`}
            </p>
            <p className="text-xs mt-0.5 opacity-90">Défis terminés</p>
          </div>
          {/* Parrainages */}
          <div className="bg-white/20 rounded-lg p-3 text-center backdrop-blur-sm">
            <Users className="mx-auto mb-1 opacity-80" size={24} />
            <p className="text-xl font-bold">
              {isLoadingReferrals ? "..." : referralsCount}
            </p>
            <p className="text-xs mt-0.5 opacity-90">Filleuls</p>
          </div>
        </div>
      </section>

      {/* Tabs */}
      <div className="flex overflow-x-auto gap-2 mb-5 pb-1 border-b border-gray-200">
        {/* Onglet Défis */}
        <button
          onClick={() => setActiveTab("defis")}
          className={`tab-button ${
            activeTab === "defis" ? "tab-active" : "tab-inactive"
          }`}
        >
          <Target size={16} /> Défis
        </button>
        {/* Onglet Parrainage */}
        <button
          onClick={() => setActiveTab("parrainage")}
          className={`tab-button ${
            activeTab === "parrainage" ? "tab-active" : "tab-inactive"
          }`}
        >
          <Users size={16} /> Parrainage
        </button>
        {/* Pas d'onglet Badges ni Bonus */}
      </div>

      {/* Contenu des Onglets */}
      <AnimatePresence mode="wait">
        {/* --- Onglet Défis (anciennement Missions) --- */}
        {activeTab === "defis" && (
          <motion.div key="defis" className="space-y-3" {...tabAnimationProps}>
            {isLoadingMissions ? (
              <TabLoader />
            ) : missionsError ? (
              <TabError message={missionsError} />
            ) : missions.length === 0 ? (
              <TabEmpty message="Aucun défi disponible pour le moment." />
            ) : (
              missions.map(
                (
                  mission // Utilise le composant MissionItem inchangé
                ) => <MissionItem key={mission.id} mission={mission} />
              )
            )}
          </motion.div>
        )}

        {/* --- Onglet Parrainage --- */}
        {activeTab === "parrainage" && (
          <motion.div
            key="parrainage"
            className="space-y-4"
            {...tabAnimationProps}
          >
            {isLoadingReferrals ? (
              <TabLoader />
            ) : referralsError ? (
              <TabError message={referralsError} />
            ) : referralData ? (
              <>
                {/* Carte Code Parrainage - ✨ Style violet/bleu */}
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-100 rounded-xl p-4 shadow-sm text-center">
                  <h3 className="text-sm font-semibold text-purple-800 mb-2">
                    Votre Code de Parrainage
                  </h3>
                  <div className="flex w-full max-w-xs mx-auto bg-white border border-purple-200 rounded-lg overflow-hidden shadow-inner">
                    <span className="flex-grow p-2 text-center font-mono text-purple-900 tracking-wider">
                      {referralData.referralCode}
                    </span>
                    <button
                      onClick={copyReferralCode}
                      title="Copier le code"
                      className="p-2 bg-purple-600 text-white hover:bg-purple-700 transition-colors"
                    >
                      <Copy size={16} />
                    </button>
                  </div>
                  <p className="text-xs text-purple-700 opacity-80 mt-2">
                    Partagez ce code !
                  </p>
                </div>

                {/* Carte Règles de Parrainage - ✨ Style bleu */}
                <div className="bg-white border border-blue-100 rounded-xl shadow-sm overflow-hidden">
                  <div className="p-3 bg-gradient-to-r from-blue-50 to-purple-50 border-b border-blue-100">
                    <h3 className="text-sm font-semibold text-purple-800">
                      Gagnez à chaque invitation
                    </h3>
                  </div>
                  <div className="divide-y divide-gray-100">
                    <div className="p-3 flex items-center justify-between hover:bg-gray-50">
                      <div className="flex items-center">
                        <span className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-lg mr-3">
                          👨
                        </span>
                        <div>
                          <p className="font-medium text-sm">Client</p>
                          <p className="text-xs text-gray-500">
                            Pour chaque client qui s'inscrit
                          </p>
                        </div>
                      </div>
                      <div className="bg-green-50 text-green-700 px-3 py-1 rounded-lg text-sm font-medium">
                        +{merchantToUserReward} DA
                      </div>
                    </div>
                    <div className="p-3 flex items-center justify-between hover:bg-gray-50">
                      <div className="flex items-center">
                        <span className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center text-lg mr-3">
                          🏪
                        </span>
                        <div>
                          <p className="font-medium text-sm">Commerçant</p>
                          <p className="text-xs text-gray-500">
                            Pour chaque commerçant qui s'inscrit
                          </p>
                        </div>
                      </div>
                      <div className="bg-green-50 text-green-700 px-3 py-1 rounded-lg text-sm font-medium">
                        +{merchantToMerchantReward} DA
                      </div>
                    </div>
                  </div>
                </div>

                {/* Carte Total Gagné - ✨ Style vert */}
                <div className="bg-gradient-to-r from-emerald-400 to-green-500 text-white rounded-xl p-4 shadow-md text-center">
                  <p className="text-sm font-medium opacity-80">
                    Total gagné grâce au parrainage
                  </p>
                  <p className="text-3xl font-bold mt-1">
                    {referralData.totalEarned.toLocaleString("fr-DZ")} DA
                  </p>
                </div>

                {/* Liste des Filleuls */}
                <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm">
                  <h3 className="text-md font-semibold text-gray-800 mb-3">
                    Vos Filleuls ({referralsCount})
                  </h3>
                  <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
                    {referralData.referrals.length === 0 ? (
                      <p className="text-center text-gray-500 py-4 text-sm">
                        Vous n'avez pas encore parrainé personne.
                      </p>
                    ) : (
                      referralData.referrals.map((friend) => (
                        <div
                          key={friend.id}
                          className="flex items-center justify-between border-b border-gray-100 last:border-0 pb-3"
                        >
                          <div className="flex items-center gap-3">
                            {/* Initiale */}
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-100 to-blue-100 flex items-center justify-center text-purple-700 font-semibold text-sm">
                              {friend.name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <p className="font-medium text-sm text-gray-900">
                                {friend.name}
                              </p>
                              <p className="text-xs text-gray-500">
                                Inscrit le:{" "}
                                {new Date(friend.date).toLocaleDateString(
                                  "fr-FR"
                                )}
                              </p>
                            </div>
                          </div>
                          <span
                            className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                              friend.status === "completed"
                                ? "bg-green-100 text-green-700"
                                : "bg-yellow-100 text-yellow-700"
                            }`}
                          >
                            {friend.status === "completed"
                              ? "Complété"
                              : "En attente"}
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </>
            ) : (
              <TabEmpty message="Impossible de charger les données de parrainage." />
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
};

// --- Composants Annexes ---

// Propriétés pour l'animation des onglets (inchangé)
const tabAnimationProps = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -10 },
  transition: { duration: 0.2 },
};

// Composant MissionItem (inchangé, utilise déjà le style violet/bleu pour la barre)
const MissionItem = ({ mission }: { mission: Mission }) => (
  <div
    className={`bg-white border rounded-xl p-4 shadow-sm transition-opacity ${
      mission.isCompleted ? "opacity-60" : "opacity-100"
    }`}
  >
    <div className="flex items-start justify-between">
      <div className="flex items-center gap-3">
        <span className="text-3xl">{mission.icon || "🎯"}</span>
        <div>
          <h3
            className={`font-semibold text-base ${
              mission.isCompleted
                ? "text-gray-500 line-through"
                : "text-gray-900"
            }`}
          >
            {mission.title}
          </h3>
          <p className="text-xs text-gray-500 mt-0.5">{mission.description}</p>
        </div>
      </div>
      {mission.isCompleted ? (
        <CheckCircle size={20} className="text-green-500 flex-shrink-0 mt-1" />
      ) : (
        <span className="text-sm font-semibold text-purple-600 flex-shrink-0 mt-1 bg-purple-50 px-2 py-0.5 rounded">
          +{mission.xpReward} XP
        </span>
      )}
    </div>
    {!mission.isCompleted &&
      mission.goal > 0 && ( // Affiche la barre si objectif > 0
        <div className="mt-3 pl-11">
          <div className="flex justify-between text-xs text-gray-500 mb-1">
            <span>Progression</span>
            <span>
              {mission.progress} / {mission.goal}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden shadow-inner">
            <motion.div
              className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full"
              initial={{ width: 0 }}
              animate={{
                width: `${Math.min(
                  100,
                  (mission.progress / mission.goal) * 100
                )}%`,
              }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            />
          </div>
        </div>
      )}
  </div>
);

// Composants TabLoader, TabError, TabEmpty (inchangés)
const TabLoader = ({ className = "" }: { className?: string }) => (
  /* ... */ <div className={`text-center py-10 text-gray-500 ${className}`}>
    {" "}
    <Loader2 className="animate-spin text-blue-500 mx-auto" size={24} />{" "}
    <p className="text-sm mt-2">Chargement...</p>{" "}
  </div>
);
const TabError = ({
  message,
  className = "",
}: {
  message: string;
  className?: string;
}) => (
  /* ... */ <div
    className={`text-center py-10 text-red-600 bg-red-50 p-4 rounded-lg ${className}`}
  >
    {" "}
    <p className="font-medium text-sm">Erreur</p>{" "}
    <p className="text-xs mt-1">{message}</p>{" "}
  </div>
);
const TabEmpty = ({
  message,
  className = "",
}: {
  message: string;
  className?: string;
}) => (
  /* ... */ <div className={`text-center py-16 text-gray-500 ${className}`}>
    {" "}
    <p className="text-sm italic">{message}</p>{" "}
  </div>
);

// Rappel: CSS pour les onglets (peut nécessiter ajustement selon ton setup Tailwind)
/*
.tab-button {
  @apply px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-200 flex items-center justify-center gap-1.5 outline-none focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-1;
}
.tab-active {
  @apply bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-md;
}
.tab-inactive {
  @apply bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-800;
}
*/

export default RewardsPage;
