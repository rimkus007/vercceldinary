"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { motion } from "framer-motion";
import PageHeader from "@/components/layouts/PageHeader";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";

// Interface pour les règles de niveau venant du backend
interface LevelRule {
  level: number;
  name: string;
  xpRequired: number;
  icon?: string;
}

// Interfaces pour les autres données
type XpHistoryItem = {
  id: string;
  action: string;
  date: string;
  points: number;
  icon: string;
};
type Mission = {
  id: string;
  title: string;
  xpReward: number;
  isCompleted: boolean;
  completedAt?: string;
};

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } },
};
const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.3 } },
};

// Fonction utilitaire pour les emojis
const getLevelEmoji = (level: number): string => {
  if (level >= 100) return "👑";
  if (level >= 50) return "💎";
  if (level >= 25) return "🚀";
  if (level >= 10) return "📈";
  if (level >= 5) return "🌱";
  return "🔰";
};

export default function ProgressionPage() {
  const { user, token, isLoading, gamificationProfile } = useAuth();

  const [levelRules, setLevelRules] = useState<LevelRule[]>([]);
  const [missionsCount, setMissionsCount] = useState<number>(0);
  const [activeDays, setActiveDays] = useState<number>(0);
  const [xpHistory, setXpHistory] = useState<XpHistoryItem[]>([]);
  const [mounted, setMounted] = useState(false);
  const [isFetchingData, setIsFetchingData] = useState(true);

  useEffect(() => {
    setMounted(true);
    const calculateActiveDays = (createdAt?: string) => {
      if (!createdAt) return 0;
      const createdDate = new Date(createdAt);
      const today = new Date();
      const diffTime = today.getTime() - createdDate.getTime();
      return Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
    };

    const fetchAllData = async () => {
      if (!token) return;
      setIsFetchingData(true);
      try {
        const [missionsRes, walletRes, levelRulesRes] = await Promise.all([
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/gamification/missions`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/wallet/transactions`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          // Côté application client, on doit utiliser les règles de niveau pour les UTILISATEURS
          fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/gamification/level-rules?role=USER`,
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          ),
        ]);

        if (levelRulesRes.ok) {
          setLevelRules(await levelRulesRes.json());
        }

        if (user?.createdAt) {
          setActiveDays(calculateActiveDays(user.createdAt));
        }

        let completed: Mission[] = [];
        if (missionsRes.ok) {
          const missionsData = await missionsRes.json();
          completed = (missionsData as Mission[]).filter((m) => m.isCompleted);
          setMissionsCount(completed.length || 0);
        }

        let walletHistory: XpHistoryItem[] = [];
        if (walletRes.ok) {
          const walletData = await walletRes.json();
          walletHistory = walletData
            .filter((tx: { xpGained?: number }) => (tx.xpGained ?? 0) > 0)
            .map((tx: any) => ({
              id: tx.id,
              action:
                tx.type === "transfer"
                  ? "Transfert"
                  : tx.type === "payment"
                  ? "Paiement"
                  : tx.type,
              date: new Date(tx.createdAt).toLocaleDateString("fr-FR"),
              points: tx.xpGained ?? 0,
              icon:
                tx.type === "transfer"
                  ? "💸"
                  : tx.type === "payment"
                  ? "💳"
                  : "⭐",
            }));
        }

        const missionHistory = completed.map((m) => ({
          id: m.id,
          action: `Mission: ${m.title}`,
          date: m.completedAt
            ? new Date(m.completedAt).toLocaleDateString("fr-FR")
            : "",
          points: m.xpReward ?? 0,
          icon: "🎯",
        }));

        const mergedHistory = [...walletHistory, ...missionHistory].sort(
          (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
        );
        setXpHistory(mergedHistory);
      } catch (error) {
        
      } finally {
        setIsFetchingData(false);
      }
    };
    if (token) fetchAllData();
  }, [token, user]);

  const xpToNextLevel = gamificationProfile?.xpToNextLevel ?? 1;
  const progressPercentage = gamificationProfile
    ? (gamificationProfile.xp / xpToNextLevel) * 100
    : 0;

  const currentLevelRule = useMemo(() => {
    if (!gamificationProfile || levelRules.length === 0) return null;
    return levelRules.find((rule) => rule.level === gamificationProfile.level);
  }, [gamificationProfile, levelRules]);

  const nextImportantReward = useMemo(() => {
    if (!gamificationProfile) return { name: "", level: 0 };
    const nextLevel = gamificationProfile.level + 1;
    return {
      name:
        nextLevel === 4
          ? "Support prioritaire"
          : nextLevel === 5
          ? "Cashback 10%"
          : "Avantages exclusifs",
      level: nextLevel,
    };
  }, [gamificationProfile]);

  if (
    !mounted ||
    isLoading ||
    isFetchingData ||
    !user ||
    !gamificationProfile ||
    !currentLevelRule
  ) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Chargement de la progression...</p>
      </div>
    );
  }

  return (
    <div className="bg-white min-h-screen pb-16">
      <PageHeader
        title="Progression"
        emoji=""
        showBackButton
        backTo="/missions"
      />

      <div className="bg-black text-white px-6 py-3">
        <div className="flex items-center justify-center mb-1">
          <h1 className="text-lg font-medium">
            Niveau {gamificationProfile.level}
          </h1>
        </div>
        <p className="text-white/80 text-xs text-center mb-2">
          {currentLevelRule.name}
        </p>

        <div className="flex justify-between text-[10px] text-white/80 px-1 mb-1">
          <span>Niveau {gamificationProfile.level}</span>
          <span>
            {gamificationProfile.xp} / {xpToNextLevel} XP
          </span>
          <span>Niveau {gamificationProfile.level + 1}</span>
        </div>
        <div className="w-full h-1 bg-white/20 rounded-full">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progressPercentage}%` }}
            transition={{ duration: 0.8 }}
            className="h-full bg-white rounded-full"
          />
        </div>
      </div>

      <div className="px-6 pt-4">
        <motion.div
          className="bg-white mb-5"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4 }}
        >
          <div className="flex justify-between">
            <div className="text-center flex-1">
              <p className="font-bold text-lg">
                {gamificationProfile?.totalXP ?? gamificationProfile?.xp ?? 0}
              </p>
              <p className="text-xs text-gray-500">XP Total</p>
            </div>
            <div className="text-center flex-1 border-l border-r border-gray-100">
              <p className="font-bold text-lg">{activeDays}</p>
              <p className="text-xs text-gray-500">Jours actifs</p>
            </div>
            <div className="text-center flex-1">
              <p className="font-bold text-lg">{missionsCount}</p>
              <p className="text-xs text-gray-500">Missions</p>
            </div>
          </div>

          <div className="mt-4 py-2 flex items-center">
            <span className="text-amber-500 mr-2 text-lg">🔒</span>
            <p className="text-sm">
              Prochain : Niveau {nextImportantReward.level} –{" "}
              {nextImportantReward.name}
            </p>
          </div>
        </motion.div>

        <div className="mb-6">
          <div className="flex items-center mb-4">
            <span className="text-amber-500 mr-2 text-lg">🏅</span>
            <h2 className="text-lg font-medium">Paliers et avantages</h2>
          </div>

          <motion.div
            className="space-y-2"
            variants={containerVariants}
            initial="hidden"
            animate="show"
          >
            {levelRules.map((rule) => (
              <motion.div
                key={rule.level}
                variants={itemVariants}
                className={`rounded-lg p-3 flex items-center ${
                  rule.level <= gamificationProfile.level
                    ? "bg-black text-white"
                    : "bg-gray-50 text-gray-600"
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-full flex-shrink-0 mr-3 flex items-center justify-center ${
                    rule.level <= gamificationProfile.level
                      ? "bg-white/20"
                      : "bg-gray-200"
                  }`}
                >
                  <span className="text-base">{getLevelEmoji(rule.level)}</span>
                </div>
                <div className="flex-grow">
                  <div className="flex justify-between items-center">
                    <div>
                      <span className="font-medium">
                        Nv. {rule.level} : {rule.name}
                      </span>
                      {rule.level === gamificationProfile.level && (
                        <span className="ml-1.5 text-xs bg-white/20 px-1.5 py-0.5 rounded text-white">
                          Actuel
                        </span>
                      )}
                    </div>
                    <span className="text-xs">{rule.xpRequired} XP</span>
                  </div>
                </div>
                <span className="ml-2 text-sm">
                  {rule.level <= gamificationProfile.level ? (
                    <span className="text-green-300">✓</span>
                  ) : (
                    <span className="text-amber-500">🔒</span>
                  )}
                </span>
              </motion.div>
            ))}
          </motion.div>
        </div>

        <div className="mb-4">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center">
              <span className="text-lg mr-2">📊</span>
              <h2 className="text-lg font-medium">Historique des points</h2>
            </div>
            <Link href="/historique" className="text-sm text-gray-500">
              Tout voir
            </Link>
          </div>
          <motion.div
            className="space-y-0"
            variants={containerVariants}
            initial="hidden"
            animate="show"
          >
            {xpHistory.slice(0, 5).map((item) => (
              <motion.div
                key={item.id}
                variants={itemVariants}
                className="flex items-center py-3 border-b border-gray-100"
              >
                <div className="w-8 h-8 rounded-lg bg-blue-50 mr-3 flex items-center justify-center text-blue-500">
                  <span className="text-base">{item.icon}</span>
                </div>
                <div className="flex-grow">
                  <h4 className="text-sm font-medium">{item.action}</h4>
                  <p className="text-xs text-gray-500">{item.date}</p>
                </div>
                <div className="text-right">
                  <span className="font-medium text-green-500 flex items-center">
                    +{item.points}{" "}
                    <span className="text-yellow-500 ml-1 text-xs">⭐</span>
                  </span>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </div>
  );
}
