"use client";

import React, { useState, useEffect, useCallback } from "react";
import PageHeader from "@/components/layouts/PageHeader";
import { motion } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import { Loader2, Check } from "lucide-react";
import Link from "next/link";

// Interface pour les missions venant de notre API
interface Mission {
  id: string;
  title: string;
  description: string;
  xpReward: number;
  icon: string;
  goal: number;
  progress: number;
  isCompleted: boolean;
}

// Animation variants (inchangés)
const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.3 } },
};

export default function MissionsPage() {
  const { token, gamificationProfile } = useAuth();
  const [missions, setMissions] = useState<Mission[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fonction pour récupérer les missions et la progression
  const fetchMissions = useCallback(async () => {
    if (!token) return;
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/gamification/missions`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (response.ok) {
        const data = await response.json();
        setMissions(data);
      }
    } catch (error) {
      
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchMissions();
  }, [fetchMissions]);

  // Séparer les missions pour l'affichage
  const completedMissions = missions.filter((m) => m.isCompleted);
  const inProgressMissions = missions.filter((m) => !m.isCompleted);

  if (isLoading || !gamificationProfile) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="animate-spin text-blue-600" size={32} />
      </div>
    );
  }

  const xpToNextLevel = Math.floor(gamificationProfile.level / 100) + 1 * 100; // Logique simple, à affiner si besoin
  const xpPercentage = (gamificationProfile.xp / xpToNextLevel) * 100;

  return (
    <div className="pb-20 bg-white">
      <PageHeader title="Missions" emoji="🏆" showBackButton />

      <div className="p-6">
        {/* Carte de niveau dynamique */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mb-8"
        >
          {/* ... (votre carte de niveau existante, maintenant avec des données réelles) ... */}
          <div className="flex justify-between items-center mt-3">
            <div>
              <h3 className="text-xl font-medium">
                Niveau {gamificationProfile.level}{" "}
                <span className="ml-1">🚀</span>
              </h3>
            </div>
            <Link href="/progression">
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="px-4 py-2 bg-black text-white text-sm rounded-full flex items-center"
              >
                <span>Voir le détail</span>
                <span className="ml-1">👉</span>
              </motion.div>
            </Link>
          </div>
        </motion.div>

        {/* Missions en cours */}
        <motion.div
          className="space-y-5 mb-10"
          variants={containerVariants}
          initial="hidden"
          animate="show"
        >
          <h2 className="text-lg font-semibold">Missions en cours</h2>
          {inProgressMissions.length > 0 ? (
            inProgressMissions.map((mission) => (
              <motion.div
                key={mission.id}
                variants={itemVariants}
                className="border-b border-gray-100 pb-5"
              >
                <div className="flex justify-between items-start">
                  <div className="flex items-start">
                    <div className="w-10 h-10 mr-3 rounded-lg flex items-center justify-center text-xl bg-blue-50 text-blue-600">
                      {mission.icon}
                    </div>
                    <div>
                      <h3 className="font-medium text-base mb-1">
                        {mission.title}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {mission.description}
                      </p>
                      {mission.goal > 1 && (
                        <div className="mt-3">
                          <div className="flex justify-between text-xs text-gray-500 mb-1.5">
                            <span>
                              {mission.progress}/{mission.goal} complétés
                            </span>
                            <span>
                              {Math.round(
                                (mission.progress / mission.goal) * 100
                              )}
                              %
                            </span>
                          </div>
                          <div className="w-full bg-gray-100 rounded-full h-1 overflow-hidden">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{
                                width: `${
                                  (mission.progress / mission.goal) * 100
                                }%`,
                              }}
                              className="h-full bg-black rounded-full"
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="bg-gray-50 px-2 py-0.5 rounded-full flex items-center">
                    <span className="text-yellow-500 mr-0.5">⭐</span>
                    <span className="font-medium text-sm">
                      {mission.xpReward}
                    </span>
                  </div>
                </div>
              </motion.div>
            ))
          ) : (
            <p className="text-sm text-gray-500">
              Aucune mission en cours pour le moment.
            </p>
          )}
        </motion.div>

        {/* Missions complétées */}
        <motion.div
          className="space-y-5"
          variants={containerVariants}
          initial="hidden"
          animate="show"
        >
          <h2 className="text-lg font-semibold">Missions terminées</h2>
          {completedMissions.length > 0 ? (
            completedMissions.map((mission) => (
              <motion.div
                key={mission.id}
                variants={itemVariants}
                className="border-b border-gray-100 pb-5 opacity-60"
              >
                <div className="flex justify-between items-start">
                  <div className="flex items-start">
                    <div className="w-10 h-10 mr-3 rounded-lg flex items-center justify-center text-xl bg-green-50 text-green-600">
                      {mission.icon}
                    </div>
                    <div>
                      <h3 className="font-medium text-base mb-1">
                        {mission.title}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {mission.description}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center text-sm text-green-600">
                    <Check size={16} className="mr-1" /> Terminé
                  </div>
                </div>
              </motion.div>
            ))
          ) : (
            <p className="text-sm text-gray-500">
              Aucune mission terminée pour le moment.
            </p>
          )}
        </motion.div>
      </div>
    </div>
  );
}
