"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { motion, useAnimation } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import { Loader2 } from "lucide-react"; // Pour l'icône de chargement

// Interface pour les règles de niveau récupérées
interface LevelRule {
  level: number;
  name?: string | null; // Rendre name optionnel
  xpRequired: number;
  icon?: string | null; // Rendre icon optionnel
  role: "USER" | "MERCHANT";
}

export default function ProgressionPage() {
  const { token, merchantProfile } = useAuth(); // Utilise merchantProfile pour le nom

  // Données utilisateur dynamiques (avec états de chargement)
  const [userData, setUserData] = useState<{
    name: string;
    level: number;
    currentXP: number;
    nextLevelXP: number; // XP total requis pour le prochain niveau
    xpPercentage: number; // Pourcentage calculé par le backend
    totalPoints: number;
    transactionsCount: number; // Sera chargé depuis /stats
    clientsCount: number; // Sera chargé depuis /stats
  } | null>(null); // Initialisé à null

  const [levelRules, setLevelRules] = useState<LevelRule[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Animation controls
  const progressControls = useAnimation();

  // Charger TOUTES les données de progression depuis l'API
  useEffect(() => {
    const loadProgressionData = async () => {
      if (!token) {
        setError("Non authentifié.");
        setIsLoading(false);
        return;
      }
      setIsLoading(true);
      setError(null);

      try {
        // Appels API en parallèle
        const [dashboardRes, statsRes, rulesRes] = await Promise.all([
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/merchants/dashboard`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/merchants/me/stats`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/gamification/level-rules?role=MERCHANT`,
            {
              headers: { Authorization: `Bearer ${token}` }, // Authentification peut être nécessaire ici aussi
            }
          ),
        ]);

        // Vérification des réponses
        if (!dashboardRes.ok) throw new Error("Erreur chargement dashboard.");
        // statsRes peut échouer, on ne bloque pas tout
        //if (!statsRes.ok) throw new Error("Erreur chargement statistiques.");
        if (!rulesRes.ok)
          throw new Error("Erreur chargement règles de niveau.");

        const dashboardData = await dashboardRes.json();
        const statsData = statsRes.ok ? await statsRes.json() : {}; // Gère l'échec des stats
        const rulesData = await rulesRes.json();

        setUserData({
          name: merchantProfile?.name ?? "Mon Commerce", // Utilise le nom du profil s'il existe
          level: dashboardData.level ?? 1,
          currentXP: dashboardData.xp ?? 0,
          nextLevelXP: dashboardData.nextLevelXP ?? 1000,
          xpPercentage: dashboardData.xpPercentage ?? 0, // Utilise le pourcentage du backend
          totalPoints: dashboardData.xp ?? 0,
          transactionsCount: statsData.totalTransactions ?? 0, // Utilise statsData ou 0
          clientsCount:
            (statsData.newCustomers ?? 0) + (statsData.loyalCustomers ?? 0), // Utilise statsData ou 0
        });
        setLevelRules(rulesData || []);
      } catch (error: any) {
        void 0;
        setError(error.message || "Une erreur est survenue.");
      } finally {
        setIsLoading(false);
      }
    };

    // On attend que merchantProfile soit chargé avant de lancer la récupération
    if (merchantProfile) {
      loadProgressionData();
    } else if (!token) {
      // Si pas de token après un délai (ex: AuthContext lent), on arrête le chargement
      setTimeout(() => {
        if (!merchantProfile) {
          // Re-vérifie au cas où il serait arrivé entre temps
          setError("Impossible de charger les informations utilisateur.");
          setIsLoading(false);
        }
      }, 2000); // Attendre 2 secondes par exemple
    }
  }, [token, merchantProfile]); // Dépend de token ET merchantProfile

  // Pourcentage d'XP calculé localement (comme dans la page stats)
  const xpPercent = useMemo(() => {
    if (!userData || userData.nextLevelXP === 0) return 0;
    return Math.min(
      100,
      Math.max(0, (userData.currentXP / userData.nextLevelXP) * 100)
    );
  }, [userData]);

  // Animation de la barre de progression après le chargement des données
  useEffect(() => {
    // Ne lancez l'animation QUE si les données utilisateur existent
    if (userData && xpPercent > 0) {
      progressControls.start({
        // Anime vers le pourcentage calculé localement
        width: `${xpPercent}%`,
        transition: { duration: 1, ease: "easeOut", delay: 0.2 }, // Ajoute un petit délai
      });
    } else if (userData && xpPercent === 0) {
      // Si le pourcentage est 0, on s'assure que la barre est à 0 sans animation
      progressControls.set({ width: "0%" });
    }
  }, [userData, xpPercent, progressControls]);

  // ---- Calculs dérivés (simplifiés, basés sur les données du backend) ----
  const currentRule = levelRules.find((r) => r.level === userData?.level);
  // XP restant (basé sur ce que le backend a calculé via getProfile)
  const xpToNextLevel = userData
    ? Math.max(0, userData.nextLevelXP - userData.currentXP)
    : 0;
  // Avantages du niveau
  const levelBenefits = currentRule?.name
    ? [currentRule.name]
    : ["Avantages standards"];

  // ---- Affichage chargement / erreur / succès ----
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="animate-spin text-blue-600" size={32} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen text-center p-4">
        <p className="text-red-600 font-semibold mb-4">Erreur</p>
        <p className="text-gray-700 bg-red-50 p-3 rounded-lg">{error}</p>
        <Link href="/dashboard" className="mt-6 text-blue-600 underline">
          Retour à l'accueil
        </Link>
      </div>
    );
  }

  if (!userData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Impossible d'afficher les données de progression.</p>
      </div>
    );
  }

  // Le reste du JSX reste très similaire, mais utilise `userData.xpPercentage` et `xpToNextLevel` directement
  // et affiche les noms/icônes des paliers depuis `levelRules`.
  return (
    <main className="p-4 pb-20 bg-gradient-to-b from-blue-50 to-white min-h-screen max-w-md mx-auto">
      {/* Header (inchangé) */}
      <motion.header /* ... */>
        <Link
          href="/dashboard"
          className="text-blue-600 font-medium flex items-center"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
          <span className="ml-1">Accueil</span>
        </Link>
        <h1 className="text-xl font-bold text-center">Ma Progression</h1>
        <div className="w-24"></div> {/* Espace pour équilibrer */}
      </motion.header>

      {/* Profil (utilise userData) */}
      <motion.div
        className="bg-white p-6 rounded-xl shadow-md mb-6 relative overflow-hidden"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1 }}
      >
        {/* ... (Affichage du niveau, nom, points - utilise userData.level, userData.name, userData.totalPoints) ... */}
        <motion.div
          className="absolute top-0 right-0 bg-blue-500 text-white px-3 py-1 rounded-bl-lg font-bold"
          initial={{ x: 50 }}
          animate={{ x: 0 }}
          transition={{ type: "spring", stiffness: 100 }}
        >
          Niveau {userData.level}
        </motion.div>
        <div className="flex flex-col items-center text-center gap-4 mb-5">
          {/* ... Icône niveau ... */}
          <motion.div /* ... */>
            <span className="text-white font-bold">{userData.level}</span>
          </motion.div>
          <div>
            <h2 className="font-bold text-xl">{userData.name}</h2>
            <p className="text-blue-600 font-medium">
              {/* ... Animation points ... */}✨ {userData.totalPoints} points
            </p>
          </div>
        </div>

        {/* Barre de progression (utilise userData.xpPercentage) */}
        <div className="mb-4">
          <div className="flex flex-col items-center text-center text-sm mb-2">
            <span className="font-medium text-gray-700 flex items-center mb-2">
              🚀 Progression vers niveau {userData.level + 1}
            </span>
            <span className="font-bold text-blue-600 px-2 py-0.5 bg-blue-100 rounded-full">
              {Math.round(xpPercent)}%
            </span>
          </div>
          <motion.div
            className="w-full h-4 bg-gray-100 rounded-full overflow-hidden shadow-inner p-0.5" /* ... */
          >
            <motion.div
              className="h-full bg-gradient-to-r from-blue-400 via-blue-500 to-blue-600 rounded-full relative"
              // ✨ CORRECTION : On initialise à 0% directement
              initial={{ width: "0%" }}
              // On lie l'animation aux contrôles
              animate={progressControls}
            >
              {/* ... Effet visuel ... */}
            </motion.div>
          </motion.div>
          <p className="text-sm text-gray-600 mt-3 text-center font-medium">
            {/* Utilise la valeur calculée xpToNextLevel */}
            {xpToNextLevel} XP pour atteindre le prochain niveau
          </p>
        </div>

        {/* Avantages du niveau (utilise levelBenefits) */}
        <motion.div className="mt-4 bg-blue-50 p-3 rounded-lg" /* ... */>
          <p className="text-sm font-medium text-blue-700 mb-2">
            Avantages de votre niveau :
          </p>
          <ul className="space-y-1">
            {levelBenefits.map((benefit, index) => (
              <motion.li
                key={index}
                className="flex items-center text-sm" /* ... */
              >
                <span className="text-blue-500 mr-2">✓</span>{" "}
                {benefit || "Avantage standard"}
              </motion.li>
            ))}
          </ul>
        </motion.div>
      </motion.div>

      {/* Paliers (utilise levelRules pour l'affichage) */}
      <motion.div
        className="bg-white p-6 rounded-xl shadow-md mb-6"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        <h2 className="text-lg font-medium mb-3">Paliers et avantages</h2>
        {levelRules.length === 0 ? (
          <p className="text-sm text-gray-500">
            Aucun palier configuré pour les commerçants.
          </p>
        ) : (
          <div className="space-y-2">
            {levelRules
              .sort((a, b) => a.level - b.level) // Assure l'ordre croissant
              .map((rule) => (
                <div
                  key={rule.level}
                  className={`rounded-lg p-3 flex items-center justify-between ${
                    rule.level <= userData.level
                      ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-md" // Style niveau atteint
                      : "bg-gray-50 text-gray-700 border" // Style niveau non atteint
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {rule.icon && <span className="text-xl">{rule.icon}</span>}
                    <div>
                      <div className="font-medium">
                        Nv. {rule.level} {rule.name ? `— ${rule.name}` : ""}
                      </div>
                      <div
                        className={`text-xs ${
                          rule.level <= userData.level
                            ? "text-blue-100"
                            : "text-gray-500"
                        }`}
                      >
                        {rule.xpRequired} XP requis
                      </div>
                    </div>
                  </div>
                  <div className="text-sm">
                    {rule.level <= userData.level ? (
                      <span className="text-green-300 font-bold text-lg">
                        ✓
                      </span>
                    ) : (
                      <span className="text-gray-400 text-lg">🔒</span>
                    )}
                  </div>
                </div>
              ))}
          </div>
        )}
      </motion.div>

      {/* Statistiques (utilise userData) */}
      <motion.div
        className="bg-gradient-to-br from-white to-blue-50 p-6 rounded-xl shadow-md mb-6" /* ... */
      >
        <h2 className="font-bold text-lg mb-4 flex items-center">
          📊 Statistiques
        </h2>
        <div className="grid grid-cols-2 gap-4">
          {/* Transactions */}
          <motion.div
            className="bg-gradient-to-br from-blue-50 to-indigo-50 p-4 rounded-lg text-center shadow-sm" /* ... */
          >
            <p className="text-3xl font-bold text-blue-700">
              {userData.transactionsCount}
            </p>
            <p className="text-sm text-blue-600 font-medium mt-1">
              Transactions
            </p>
          </motion.div>
          {/* Clients */}
          <motion.div
            className="bg-gradient-to-br from-blue-50 to-indigo-50 p-4 rounded-lg text-center shadow-sm" /* ... */
          >
            <p className="text-3xl font-bold text-blue-700">
              {userData.clientsCount}
            </p>
            <p className="text-sm text-blue-600 font-medium mt-1">Clients</p>
          </motion.div>
        </div>
      </motion.div>

      {/* ... (Les sections Badges, Missions, Points et Récompenses, Footer peuvent rester les mêmes si elles sont statiques ou gérées ailleurs) ... */}
      {/* Note: Si les missions/badges doivent aussi dépendre du rôle, il faudra adapter leur logique de récupération/affichage */}
    </main>
  );
}
