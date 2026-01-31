// app/rewards/page.tsx

"use client";

import React, { useState, useEffect } from "react";
import PageHeader from "@/components/layouts/PageHeader";
import { useReferral } from "@/components/common/ReferralContext";
import Link from "next/link";
import { useReferralRules } from "@/hooks/useReferralRules";

export default function RewardsPage() {
  const [activeCategory, setActiveCategory] = useState<
    "tous" | "badges" | "parrainage"
  >("tous");

  const { stats, referrals } = useReferral();
  const [badges, setBadges] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentDate, setCurrentDate] = useState<number | null>(null);

  // 🎯 Récupérer les règles de parrainage depuis le backend
  const { userToUserReward, userToMerchantReward, loading: rulesLoading } = useReferralRules('USER');

  useEffect(() => {
    async function fetchRewards() {
      setLoading(true);
      setError(null);
      try {
        const token = typeof window !== "undefined" ? localStorage.getItem("access_token_user") : "";
        
        // Récupérer les badges
        const badgesRes = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/users/me/rewards-details`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (!badgesRes.ok) throw new Error("Erreur lors du chargement des récompenses.");
        const badgesData = await badgesRes.json();
        setBadges(badgesData.badges || []);
      } catch (err: any) {
        setError(err.message || "Erreur inconnue");
      } finally {
        setLoading(false);
      }
    }
    fetchRewards();
    setCurrentDate(Date.now());
  }, []);

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    const day = date.getDate().toString().padStart(2, "0");
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const formatNumber = (num: number) => {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
  };

  const calculateProgress = (progress: number, total: number) => {
    return Math.min(Math.round((progress / total) * 100), 100);
  };

  // Logique de comptage mise à jour
  const getCountByCategory = (category: string) => {
    if (category === "parrainage") {
      return referrals.length;
    }
    if (category === "tous") {
      return badges.length + referrals.length;
    }
    return badges.filter((b) => b.category === category).length;
  };

  const getEarnedCountByCategory = (category: string) => {
    if (category === "parrainage") {
      return referrals.filter((r) => r.status === "completed").length;
    }
    if (category === "tous") {
      return (
        badges.filter((b) => b.earned).length +
        referrals.filter((r) => r.status === "completed").length
      );
    }
    return badges.filter((b) => b.category === category && b.earned).length;
  };

  return (
    <div className="bg-white min-h-screen pb-20">
      <PageHeader title="Récompenses" emoji="🏆" showBackButton={true} />
      {loading ? (
        <div className="px-5 py-10 text-center text-gray-500">
          Chargement des récompenses...
        </div>
      ) : error ? (
        <div className="px-5 py-10 text-center text-red-500">{error}</div>
      ) : (
        <>
          <div className="px-5">
            <div className="my-4 relative bg-gradient-to-br from-amber-400 to-amber-600 text-white p-5 rounded-xl overflow-hidden shadow-lg">
              <div className="absolute right-0 top-0 w-40 h-40 rounded-full bg-gradient-to-br from-white/20 to-amber-500/10 -mr-20 -mt-20 blur-xl"></div>
              <div className="absolute left-0 bottom-0 w-40 h-40 rounded-full bg-gradient-to-br from-amber-700/20 to-amber-800/20 -ml-20 -mb-20 blur-xl"></div>
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm opacity-80">Total de récompenses</p>
                  <div className="px-2 py-0.5 bg-white/20 rounded-full text-xs backdrop-blur-sm">
                    Mise à jour: {currentDate ? formatDate(currentDate) : "..."}
                  </div>
                </div>
                <h1 className="text-3xl font-bold">
                  {formatNumber(stats.totalEarned)} DA
                </h1>
                <div className="mt-4 flex items-center">
                  <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center mr-3 backdrop-blur-sm">
                    <span className="text-lg">🎁</span>
                  </div>
                  <div className="flex-grow">
                    <div className="flex justify-between items-center">
                      <p className="font-medium text-sm">Parrainage</p>
                      <p className="font-bold">
                        {formatNumber(stats.totalEarned)} DA
                      </p>
                    </div>
                  </div>
                </div>
                <div className="mt-5 flex justify-between">
                  <Link
                    href="/inviter"
                    className="flex-1 mr-2 py-2 bg-white/20 backdrop-blur-sm text-white text-sm rounded-lg flex items-center justify-center hover:bg-white/30 active:scale-95 transition-all"
                  >
                    <span className="mr-2">👥</span>
                    Inviter
                  </Link>
                  <Link
                    href="/historique"
                    className="flex-1 ml-2 py-2 bg-white/20 backdrop-blur-sm text-white text-sm rounded-lg flex items-center justify-center hover:bg-white/30 active:scale-95 transition-all"
                  >
                    <span className="mr-2">📊</span>
                    Historique
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      <div className="px-5 mb-4">
        <div className="grid grid-cols-3 gap-2">
          {["tous", "badges", "parrainage"].map((category) => {
            const emoji = category === "badges" ? "🏅" : category === "parrainage" ? "🎁" : "🏆";
            const label = category.charAt(0).toUpperCase() + category.slice(1);
            return (
              <button
                key={category}
                onClick={() =>
                  setActiveCategory(category as typeof activeCategory)
                }
                className={`py-3 px-3 rounded-xl text-xs font-medium flex flex-col items-center gap-1 transition-all duration-200 border ${
                  activeCategory === category
                    ? "bg-black text-white border-black shadow-lg scale-105"
                    : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50 hover:border-gray-300"
                }`}
              >
                <span className="text-xl">{emoji}</span>
                <span className="text-[10px] leading-tight text-center">{label}</span>
                <span className={`text-[9px] px-1.5 py-0.5 rounded-full ${activeCategory === category ? "bg-white/20" : "bg-gray-100"}`}>
                  {getEarnedCountByCategory(category)}/{getCountByCategory(category)}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="px-5 space-y-6">
        {(activeCategory === "tous" || activeCategory === "badges") && (
          // ... La section des badges reste inchangée ...
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold flex items-center">
                <span className="mr-2">🏅</span> Mes badges
              </h2>
              <span className="text-sm text-gray-500">
                {badges.filter((b) => b.earned).length} sur {badges.length}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {badges.map((badge) => (
                <div
                  key={badge.id}
                  className={`bg-white border border-gray-100 p-3 rounded-xl shadow-sm ${
                    !badge.earned && "opacity-70"
                  }`}
                >
                  <div className="flex items-center mb-2">
                    <div
                      className={`w-10 h-10 rounded-full ${badge.color} flex items-center justify-center text-xl mr-2`}
                    >
                      <span>{badge.icon}</span>
                    </div>
                    <div>
                      <p className="font-medium text-sm line-clamp-1">
                        {badge.name}
                      </p>
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full ${
                          badge.earned
                            ? "bg-green-100 text-green-700"
                            : "bg-gray-100 text-gray-500"
                        }`}
                      >
                        {badge.earned ? "Obtenu" : "En cours"}
                      </span>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 mb-1.5 line-clamp-2 h-8">
                    {badge.description}
                  </p>
                  {!badge.earned && badge.progress && badge.total && (
                    <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-amber-500 rounded-full"
                        style={{
                          width: `${calculateProgress(
                            badge.progress,
                            badge.total
                          )}%`,
                        }}
                      ></div>
                      <p className="text-xs text-gray-500 mt-1 text-right">
                        {badge.progress}/{badge.total}
                      </p>
                    </div>
                  )}
                  {badge.earned && badge.date && (
                    <p className="text-xs text-gray-400 text-right mt-1">
                      Obtenu le {badge.date}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {(activeCategory === "tous" || activeCategory === "parrainage") && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold flex items-center">
                <span className="mr-2">🎁</span> Programme de parrainage
              </h2>
              <span className="text-sm text-gray-500">
                {stats.totalInvited} invités
              </span>
            </div>

            <div className="bg-white border border-gray-100 rounded-xl shadow-sm overflow-hidden">
              <div className="p-4 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-indigo-50">
                <div className="flex justify-between items-center">
                  <p className="font-medium">Gagnez à chaque invitation</p>
                  <Link
                    href="/inviter"
                    className="px-3 py-1 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 active:scale-[0.98] transition-all"
                  >
                    Inviter
                  </Link>
                </div>
              </div>
              <div className="divide-y divide-gray-100">
                <div className="p-4 flex items-center justify-between hover:bg-gray-50">
                  <div className="flex items-center">
                    <span className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-lg mr-3">
                      👨
                    </span>
                    <div>
                      <p className="font-medium text-sm">Ami</p>
                      <p className="text-xs text-gray-500">
                        Pour chaque ami qui s'inscrit
                      </p>
                    </div>
                  </div>
                  <div className="bg-green-50 text-green-700 px-3 py-1 rounded-lg text-sm font-medium">
                    +{userToUserReward} DA
                  </div>
                </div>
                <div className="p-4 flex items-center justify-between hover:bg-gray-50">
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
                    +{userToMerchantReward} DA
                  </div>
                </div>
              </div>
            </div>

            {/* 👇 CORRECTION 2 : On ajoute la liste des filleuls ici */}
            <div className="space-y-3 pt-2">
              <h3 className="text-md font-semibold">Vos invitations</h3>
              {referrals && referrals.length > 0 ? (
                referrals.map((referral) => (
                  <div
                    key={referral.id}
                    className="bg-gray-50 rounded-xl p-3 flex items-center justify-between"
                  >
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                        <span className="text-blue-700 font-semibold">
                          {referral.name ? referral.name.charAt(0) : "?"}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium">
                          {referral.name || "Utilisateur Anonyme"}
                        </p>
                        <p className="text-xs text-gray-500">
                          Inscrit le{" "}
                          {new Date(referral.date).toLocaleDateString("fr-FR")}
                        </p>
                      </div>
                    </div>
                    <span
                      className={`text-xs px-2 py-1 rounded-full ${
                        referral.status === "completed"
                          ? "bg-green-100 text-green-700"
                          : "bg-yellow-100 text-yellow-700"
                      }`}
                    >
                      {referral.status === "completed"
                        ? "Complété"
                        : "En attente"}
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-500 text-center py-4">
                  Vous n'avez pas encore parrainé d'amis.
                </p>
              )}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
