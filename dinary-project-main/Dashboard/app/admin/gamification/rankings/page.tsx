"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import {
  Trophy,
  Medal,
  Crown,
  Star,
  Award,
  Users,
  Zap,
  Search,
  Eye,
  X,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { motion, AnimatePresence } from "framer-motion";

// Interface pour les données utilisateur
interface RankedUser {
  id: string;
  username: string;
  level: number;
  totalXP: number;
  weeklyXP: number;
  rank: number;
  previousRank: number;
  achievements: number;
  streakDays: number;
  tier: "bronze" | "silver" | "gold" | "platinum" | "diamond";
}

// Interface pour les statistiques
interface RankingStats {
  totalUsers: number;
  totalXPAwarded: number;
  topPerformer: RankedUser | null;
}

export default function RankingsPage() {
  const [globalRanking, setGlobalRanking] = useState<RankedUser[]>([]);
  const [weeklyRanking, setWeeklyRanking] = useState<RankedUser[]>([]);
  const [stats, setStats] = useState<RankingStats | null>(null);

  const [selectedBoard, setSelectedBoard] = useState<"global" | "weekly">(
    "global"
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedUser, setSelectedUser] = useState<RankedUser | null>(null);
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const { token } = useAuth();

  const fetchData = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      const [globalRes, weeklyRes, statsRes] = await Promise.all([
        fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/admin/gamification/rankings`,
          { headers: { Authorization: `Bearer ${token}` } }
        ),
        fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/admin/gamification/rankings/weekly`,
          { headers: { Authorization: `Bearer ${token}` } }
        ),
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/gamification/stats`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      if (!globalRes.ok || !weeklyRes.ok || !statsRes.ok)
        throw new Error("Erreur de chargement des données.");

      const globalData = await globalRes.json();
      const weeklyData = await weeklyRes.json();
      const statsData = await statsRes.json();

      setGlobalRanking(globalData);
      setWeeklyRanking(weeklyData);
      setStats({
        totalUsers: statsData.totalUsers,
        totalXPAwarded: statsData.totalXPAwarded,
        topPerformer: globalData[0] || null,
      });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const displayedUsers = useMemo(() => {
    const users = selectedBoard === "global" ? globalRanking : weeklyRanking;
    if (!searchTerm) return users;
    return users.filter((user) =>
      user.username.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [selectedBoard, globalRanking, weeklyRanking, searchTerm]);

  const getRankIcon = (rank: number) => {
    if (rank === 1) return (
      <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full shadow-lg">
        <Crown className="w-7 h-7 text-white" />
      </div>
    );
    if (rank === 2) return (
      <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-br from-gray-300 to-gray-500 rounded-full shadow-lg">
        <Medal className="w-7 h-7 text-white" />
      </div>
    );
    if (rank === 3) return (
      <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-br from-orange-400 to-orange-600 rounded-full shadow-lg">
        <Award className="w-7 h-7 text-white" />
      </div>
    );
    return (
      <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full text-white font-bold text-lg shadow-md">
        #{rank}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }
  if (error) {
    return <div className="text-center p-8 text-red-500">{error}</div>;
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Classements</h1>
          <p className="text-gray-600">
            Suivez les classements et la compétition entre utilisateurs.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-gradient-to-br from-blue-500 to-indigo-600 p-6 rounded-2xl shadow-lg text-white">
          <p className="text-sm font-medium opacity-90 mb-2">
            Utilisateurs Classés
          </p>
          <p className="text-4xl font-bold">
            {stats?.totalUsers.toLocaleString()}
          </p>
        </div>
        <div className="bg-gradient-to-br from-purple-500 to-pink-600 p-6 rounded-2xl shadow-lg text-white">
          <p className="text-sm font-medium opacity-90 mb-2">
            Total XP Distribué
          </p>
          <p className="text-4xl font-bold">
            {stats?.totalXPAwarded.toLocaleString()}
          </p>
        </div>
        <div className="bg-gradient-to-br from-orange-500 to-red-600 p-6 rounded-2xl shadow-lg text-white">
          <p className="text-sm font-medium opacity-90 mb-2">Meilleur Joueur</p>
          <p className="text-2xl font-bold">
            {stats?.topPerformer?.username || "N/A"}
          </p>
        </div>
        <div className="bg-gradient-to-br from-green-500 to-teal-600 p-6 rounded-2xl shadow-lg text-white">
          <p className="text-sm font-medium opacity-90 mb-2">XP du Meilleur</p>
          <p className="text-2xl font-bold">
            {stats?.topPerformer?.totalXP.toLocaleString() || 0} XP
          </p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border mb-6">
        <div className="p-6 border-b border-gray-200">
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex gap-3">
              <button
                onClick={() => setSelectedBoard("global")}
                className={`px-6 py-3 rounded-xl text-sm font-bold transition-all shadow-md ${
                  selectedBoard === "global"
                    ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white scale-105"
                    : "bg-white text-gray-700 hover:bg-gray-50 border-2 border-gray-200"
                }`}
              >
                🏆 Classement Général
              </button>
              <button
                onClick={() => setSelectedBoard("weekly")}
                className={`px-6 py-3 rounded-xl text-sm font-bold transition-all shadow-md ${
                  selectedBoard === "weekly"
                    ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white scale-105"
                    : "bg-white text-gray-700 hover:bg-gray-50 border-2 border-gray-200"
                }`}
              >
                ⭐ Champions de la Semaine
              </button>
            </div>
            <div className="relative ml-auto">
              <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Chercher un utilisateur..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg"
              />
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gradient-to-r from-indigo-600 to-purple-600">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-bold text-white uppercase tracking-wider">Rang</th>
                <th className="px-6 py-4 text-left text-sm font-bold text-white uppercase tracking-wider">Utilisateur</th>
                <th className="px-6 py-4 text-left text-sm font-bold text-white uppercase tracking-wider">Niveau</th>
                <th className="px-6 py-4 text-left text-sm font-bold text-white uppercase tracking-wider">
                  {selectedBoard === "weekly" ? "XP Semaine" : "XP Total"}
                </th>
                <th className="px-6 py-4 text-left text-sm font-bold text-white uppercase tracking-wider">Succès</th>
                <th className="px-6 py-4 text-left text-sm font-bold text-white uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {displayedUsers.map((user) => {
                // Couleurs spéciales pour le top 3
                let rowBgClass = "hover:bg-gray-50";
                if (user.rank === 1) rowBgClass = "bg-gradient-to-r from-yellow-50 to-amber-50 hover:from-yellow-100 hover:to-amber-100";
                else if (user.rank === 2) rowBgClass = "bg-gradient-to-r from-gray-50 to-slate-50 hover:from-gray-100 hover:to-slate-100";
                else if (user.rank === 3) rowBgClass = "bg-gradient-to-r from-orange-50 to-red-50 hover:from-orange-100 hover:to-red-100";
                
                return (
                  <tr key={user.id} className={rowBgClass}>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {getRankIcon(user.rank)}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center font-bold text-white text-lg shadow-md">
                          {user.username.charAt(0).toUpperCase()}
                        </div>
                        <div className="text-base font-bold text-gray-900">
                          {user.username}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-bold text-lg text-indigo-600">{user.level}</td>
                    <td className="px-6 py-4 font-bold text-xl text-purple-600">
                      {selectedBoard === "weekly"
                        ? user.weeklyXP.toLocaleString()
                        : user.totalXP.toLocaleString()}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Trophy className="w-5 h-5 text-yellow-500" />
                        <span className="font-semibold text-gray-900">{user.achievements}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            setSelectedUser(user);
                            setIsUserModalOpen(true);
                          }}
                          className="p-2 hover:bg-indigo-100 rounded-full transition-colors"
                          title="Voir les détails"
                        >
                          <Eye size={20} className="text-indigo-600" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal de détails utilisateur */}
      <AnimatePresence>
        {isUserModalOpen && selectedUser && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black bg-opacity-60 backdrop-blur-sm p-4"
            onClick={() => setIsUserModalOpen(false)}
          >
            <motion.div
              initial={{ y: 50, opacity: 0, scale: 0.95 }}
              animate={{ y: 0, opacity: 1, scale: 1.0 }}
              exit={{ y: 50, opacity: 0, scale: 0.95 }}
              transition={{ type: "spring", stiffness: 400, damping: 25 }}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-6">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-3xl font-bold">
                      {selectedUser.username.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold mb-1">
                        {selectedUser.username}
                      </h2>
                      <div className="flex items-center gap-2">
                        {getRankIcon(selectedUser.rank)}
                        <span className="text-sm opacity-90">
                          Rang #{selectedUser.rank}
                        </span>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => setIsUserModalOpen(false)}
                    className="p-2 hover:bg-white/20 rounded-full transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Body */}
              <div className="p-6 space-y-6">
                {/* Stats principales */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4">
                    <div className="flex items-center gap-2 text-blue-600 mb-2">
                      <Star className="w-5 h-5" />
                      <span className="text-sm font-medium">Niveau</span>
                    </div>
                    <p className="text-3xl font-bold text-blue-900">
                      {selectedUser.level}
                    </p>
                  </div>
                  <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4">
                    <div className="flex items-center gap-2 text-purple-600 mb-2">
                      <Zap className="w-5 h-5" />
                      <span className="text-sm font-medium">XP Total</span>
                    </div>
                    <p className="text-3xl font-bold text-purple-900">
                      {selectedUser.totalXP.toLocaleString()}
                    </p>
                  </div>
                  <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4">
                    <div className="flex items-center gap-2 text-green-600 mb-2">
                      <Trophy className="w-5 h-5" />
                      <span className="text-sm font-medium">Succès</span>
                    </div>
                    <p className="text-3xl font-bold text-green-900">
                      {selectedUser.achievements}
                    </p>
                  </div>
                  <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-4">
                    <div className="flex items-center gap-2 text-orange-600 mb-2">
                      <Star className="w-5 h-5" />
                      <span className="text-sm font-medium">Rang</span>
                    </div>
                    <p className="text-3xl font-bold text-orange-900">
                      #{selectedUser.rank}
                    </p>
                  </div>
                </div>

                {/* XP de la semaine */}
                <div className="border-t border-gray-200 pt-4">
                  <div className="text-center">
                    <p className="text-sm font-medium text-gray-600 mb-1">
                      XP cette semaine
                    </p>
                    <p className="text-3xl font-bold text-indigo-600">
                      {selectedUser.weeklyXP.toLocaleString()}
                    </p>
                  </div>
                </div>

              </div>

              {/* Footer */}
              <div className="bg-gray-50 px-6 py-4 flex justify-end">
                <button
                  onClick={() => setIsUserModalOpen(false)}
                  className="px-6 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:opacity-90 transition-opacity"
                >
                  Fermer
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
