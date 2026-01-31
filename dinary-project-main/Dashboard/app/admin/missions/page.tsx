"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import {
  Target,
  Search,
  Award,
  Users,
  Store,
  Plus,
  Trash2,
  Edit,
  X,
  CheckCircle,
  Clock,
  TrendingUp,
  Zap,
  Gift,
  Wallet,
  CreditCard,
  Send,
  ShoppingBag,
  UserPlus,
  Shield,
  DollarSign,
  Download,
  Sparkles,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";

// Interface Mission
interface Mission {
  id: string;
  title: string;
  description: string;
  xpReward: number;
  goal: number;
  type: string;
  icon: string;
  status: "ACTIVE" | "DRAFT";
  role: "USER" | "MERCHANT";
  createdAt: string;
  updatedAt: string;
}

// Interface pour les missions suggérées
interface SuggestedMission {
  title: string;
  description: string;
  type: string;
  icon: string;
  xpReward: number;
  goal: number;
  category: string;
  difficulty: "facile" | "moyen" | "difficile";
}

// Liste complète des missions suggérées pour CLIENTS
const SUGGESTED_USER_MISSIONS: SuggestedMission[] = [
  // === DÉBUTANT (Facile) ===
  {
    title: "Premier pas",
    description: "Effectue ton premier virement à un ami",
    type: "send_money",
    icon: "💸",
    xpReward: 50,
    goal: 1,
    category: "Débutant",
    difficulty: "facile",
  },
  {
    title: "Premier achat",
    description: "Effectue ton premier paiement chez un marchand",
    type: "merchant_payment",
    icon: "🛒",
    xpReward: 50,
    goal: 1,
    category: "Débutant",
    difficulty: "facile",
  },
  {
    title: "Compte approvisionné",
    description: "Recharge ton compte pour la première fois",
    type: "recharge",
    icon: "💳",
    xpReward: 30,
    goal: 1,
    category: "Débutant",
    difficulty: "facile",
  },
  {
    title: "Ambassadeur",
    description: "Parraine ton premier ami",
    type: "referral",
    icon: "🤝",
    xpReward: 100,
    goal: 1,
    category: "Débutant",
    difficulty: "facile",
  },
  {
    title: "Compte vérifié",
    description: "Vérifie ton identité",
    type: "verify_identity",
    icon: "✅",
    xpReward: 150,
    goal: 1,
    category: "Débutant",
    difficulty: "facile",
  },

  // === INTERMÉDIAIRE (Moyen) ===
  {
    title: "Généreux",
    description: "Envoie de l'argent 5 fois",
    type: "send_money",
    icon: "🎁",
    xpReward: 200,
    goal: 5,
    category: "Intermédiaire",
    difficulty: "moyen",
  },
  {
    title: "Client fidèle",
    description: "Effectue 10 paiements chez des marchands",
    type: "merchant_payment",
    icon: "🏪",
    xpReward: 300,
    goal: 10,
    category: "Intermédiaire",
    difficulty: "moyen",
  },
  {
    title: "Compte actif",
    description: "Recharge ton compte 3 fois",
    type: "recharge",
    icon: "⚡",
    xpReward: 150,
    goal: 3,
    category: "Intermédiaire",
    difficulty: "moyen",
  },
  {
    title: "Réseau grandissant",
    description: "Parraine 3 amis",
    type: "referral",
    icon: "👥",
    xpReward: 500,
    goal: 3,
    category: "Intermédiaire",
    difficulty: "moyen",
  },

  // === EXPERT (Difficile) ===
  {
    title: "Maître des virements",
    description: "Envoie de l'argent 20 fois",
    type: "send_money",
    icon: "🌟",
    xpReward: 500,
    goal: 20,
    category: "Expert",
    difficulty: "difficile",
  },
  {
    title: "VIP Shopping",
    description: "Effectue 25 paiements chez des marchands",
    type: "merchant_payment",
    icon: "👑",
    xpReward: 750,
    goal: 25,
    category: "Expert",
    difficulty: "difficile",
  },
  {
    title: "Super parrain",
    description: "Parraine 10 amis",
    type: "referral",
    icon: "🚀",
    xpReward: 2000,
    goal: 10,
    category: "Expert",
    difficulty: "difficile",
  },
  {
    title: "Compte premium",
    description: "Recharge ton compte 10 fois",
    type: "recharge",
    icon: "💎",
    xpReward: 400,
    goal: 10,
    category: "Expert",
    difficulty: "difficile",
  },
];

// Liste complète des missions suggérées pour MARCHANDS
const SUGGESTED_MERCHANT_MISSIONS: SuggestedMission[] = [
  // === DÉBUTANT (Facile) ===
  {
    title: "Premier encaissement",
    description: "Reçois ton premier paiement d'un client",
    type: "receive_payment",
    icon: "💰",
    xpReward: 50,
    goal: 1,
    category: "Débutant",
    difficulty: "facile",
  },
  {
    title: "Profil complété",
    description: "Complète toutes les informations de ton profil marchand",
    type: "complete_profile",
    icon: "📋",
    xpReward: 100,
    goal: 1,
    category: "Débutant",
    difficulty: "facile",
  },
  {
    title: "Marchand vérifié",
    description: "Vérifie l'identité de ton commerce",
    type: "verify_identity",
    icon: "✅",
    xpReward: 200,
    goal: 1,
    category: "Débutant",
    difficulty: "facile",
  },
  {
    title: "Premier service",
    description: "Recharge le compte d'un client pour la première fois",
    type: "recharge_client",
    icon: "🔋",
    xpReward: 75,
    goal: 1,
    category: "Débutant",
    difficulty: "facile",
  },

  // === INTERMÉDIAIRE (Moyen) ===
  {
    title: "Commerce actif",
    description: "Reçois 10 paiements de clients",
    type: "receive_payment",
    icon: "🏪",
    xpReward: 300,
    goal: 10,
    category: "Intermédiaire",
    difficulty: "moyen",
  },
  {
    title: "Service de recharge",
    description: "Recharge 5 comptes clients",
    type: "recharge_client",
    icon: "⚡",
    xpReward: 250,
    goal: 5,
    category: "Intermédiaire",
    difficulty: "moyen",
  },
  {
    title: "Gestion financière",
    description: "Effectue 3 demandes de retrait",
    type: "withdrawal",
    icon: "🏦",
    xpReward: 150,
    goal: 3,
    category: "Intermédiaire",
    difficulty: "moyen",
  },

  // === EXPERT (Difficile) ===
  {
    title: "Commerce populaire",
    description: "Reçois 50 paiements de clients",
    type: "receive_payment",
    icon: "🌟",
    xpReward: 1000,
    goal: 50,
    category: "Expert",
    difficulty: "difficile",
  },
  {
    title: "Champion des paiements",
    description: "Reçois 100 paiements de clients",
    type: "receive_payment",
    icon: "👑",
    xpReward: 2500,
    goal: 100,
    category: "Expert",
    difficulty: "difficile",
  },
  {
    title: "Partenaire privilégié",
    description: "Recharge 20 comptes clients",
    type: "recharge_client",
    icon: "💎",
    xpReward: 800,
    goal: 20,
    category: "Expert",
    difficulty: "difficile",
  },
  {
    title: "Expert financier",
    description: "Effectue 10 demandes de retrait",
    type: "withdrawal",
    icon: "🚀",
    xpReward: 500,
    goal: 10,
    category: "Expert",
    difficulty: "difficile",
  },
];

// Actions disponibles pour le formulaire
const USER_ACTIONS = [
  { value: "send_money", label: "💸 Envoyer de l'argent" },
  { value: "merchant_payment", label: "🛒 Paiement marchand" },
  { value: "recharge", label: "💳 Recharge de compte" },
  { value: "referral", label: "🤝 Parrainage" },
  { value: "verify_identity", label: "✅ Vérification d'identité" },
];

const MERCHANT_ACTIONS = [
  { value: "receive_payment", label: "💰 Recevoir un paiement" },
  { value: "complete_profile", label: "📋 Compléter le profil" },
  { value: "verify_identity", label: "✅ Vérification d'identité" },
  { value: "recharge_client", label: "🔋 Recharger un client" },
  { value: "withdrawal", label: "🏦 Demande de retrait" },
];

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";

// Liste d'emojis disponibles pour les missions
const AVAILABLE_EMOJIS = [
  { emoji: "🎯", label: "Cible" },
  { emoji: "💰", label: "Argent" },
  { emoji: "🚀", label: "Fusée" },
  { emoji: "⭐", label: "Étoile" },
  { emoji: "🏆", label: "Trophée" },
  { emoji: "💎", label: "Diamant" },
  { emoji: "🔥", label: "Feu" },
  { emoji: "⚡", label: "Éclair" },
  { emoji: "🎁", label: "Cadeau" },
  { emoji: "🎉", label: "Fête" },
  { emoji: "💳", label: "Carte bancaire" },
  { emoji: "💸", label: "Billets" },
  { emoji: "🏪", label: "Boutique" },
  { emoji: "🛒", label: "Panier" },
  { emoji: "📱", label: "Téléphone" },
  { emoji: "✅", label: "Validation" },
  { emoji: "🔔", label: "Cloche" },
  { emoji: "👥", label: "Groupe" },
  { emoji: "🤝", label: "Poignée de main" },
  { emoji: "💼", label: "Mallette" },
  { emoji: "📊", label: "Graphique" },
  { emoji: "🎖️", label: "Médaille" },
  { emoji: "🌟", label: "Étoile brillante" },
  { emoji: "💪", label: "Muscle" },
  { emoji: "🎪", label: "Cirque" },
  { emoji: "🔋", label: "Batterie" },
  { emoji: "🏦", label: "Banque" },
  { emoji: "🎓", label: "Diplôme" },
  { emoji: "🚪", label: "Porte" },
  { emoji: "📈", label: "Croissance" },
];

export default function MissionsPage() {
  const [missions, setMissions] = useState<Mission[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { token } = useAuth();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMission, setEditingMission] = useState<Mission | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentRole, setCurrentRole] = useState<"USER" | "MERCHANT">("USER");
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Stats
  const stats = useMemo(() => {
    const activeMissions = missions.filter((m) => m.status === "ACTIVE");
    const draftMissions = missions.filter((m) => m.status === "DRAFT");
    const totalXP = missions.reduce((sum, m) => sum + m.xpReward, 0);
    
    return {
      total: missions.length,
      active: activeMissions.length,
      draft: draftMissions.length,
      totalXP,
    };
  }, [missions]);

  // Récupérer les missions
  const fetchMissions = useCallback(async () => {
    if (!token) {
      setError("Authentification requise.");
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(
        `${API_URL}/admin/missions?role=${currentRole}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (!response.ok) {
        const errData = await response
          .json()
          .catch(() => ({ message: "Erreur de récupération des missions" }));
        throw new Error(
          errData.message || "Erreur de récupération des missions"
        );
      }
      const data = await response.json();
      setMissions(data);
    } catch (err: any) {
      setError(err.message);
      setMissions([]);
    } finally {
      setIsLoading(false);
    }
  }, [currentRole, token]);

  useEffect(() => {
    if (token) {
      fetchMissions();
    } else {
      setIsLoading(false);
      setError("Veuillez vous connecter pour accéder à cette page.");
    }
  }, [fetchMissions, token]);

  // Filtrer les missions
  const filteredMissions = useMemo(() => {
    return missions.filter((mission) => {
      const matchesSearch =
        searchTerm === "" ||
        mission.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        mission.type.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus =
        statusFilter === "all" || mission.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [missions, searchTerm, statusFilter]);

  // Créer une mission depuis une suggestion
  const handleCreateFromSuggestion = (suggestion: SuggestedMission) => {
    setEditingMission({
      id: "",
      title: suggestion.title,
      description: suggestion.description,
      type: suggestion.type,
      icon: suggestion.icon,
      xpReward: suggestion.xpReward,
      goal: suggestion.goal,
      status: "DRAFT",
      role: currentRole,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    } as Mission);
    setIsModalOpen(true);
    setShowSuggestions(false);
  };

  const handleOpenCreateModal = () => {
    setEditingMission(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (mission: Mission) => {
    setEditingMission(mission);
    setIsModalOpen(true);
  };

  const handleDeleteMission = async (missionId: string) => {
    if (
      !window.confirm(
        "Êtes-vous sûr de vouloir supprimer cette mission ?\nCette action est irréversible."
      )
    ) {
      return;
    }
    if (!token) {
      alert("Authentification requise.");
      return;
    }
    try {
      const response = await fetch(`${API_URL}/admin/missions/${missionId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        const errData = await response
          .json()
          .catch(() => ({ message: "La suppression a échoué" }));
        throw new Error(errData.message || "La suppression a échoué");
      }
      fetchMissions();
    } catch (err: any) {
      setError(`Erreur lors de la suppression : ${err.message}`);
    }
  };

  const suggestedMissions =
    currentRole === "USER"
      ? SUGGESTED_USER_MISSIONS
      : SUGGESTED_MERCHANT_MISSIONS;

  // Grouper par catégorie
  const groupedSuggestions = useMemo(() => {
    const grouped: Record<string, SuggestedMission[]> = {};
    suggestedMissions.forEach((mission) => {
      if (!grouped[mission.category]) {
        grouped[mission.category] = [];
      }
      grouped[mission.category].push(mission);
    });
    return grouped;
  }, [suggestedMissions]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-2">
          Gestion des Missions
        </h1>
        <p className="text-gray-600">
          Créez et gérez les missions pour motiver vos{" "}
          {currentRole === "USER" ? "clients" : "commerçants"}
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <motion.div
          className="bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl p-6 text-white shadow-lg"
          whileHover={{ scale: 1.02 }}
        >
          <div className="flex items-center justify-between mb-2">
            <Target className="w-8 h-8" />
            <span className="text-3xl font-bold">{stats.total}</span>
          </div>
          <p className="text-sm opacity-90">Total missions</p>
        </motion.div>

        <motion.div
          className="bg-gradient-to-br from-green-500 to-emerald-500 rounded-2xl p-6 text-white shadow-lg"
          whileHover={{ scale: 1.02 }}
        >
          <div className="flex items-center justify-between mb-2">
            <CheckCircle className="w-8 h-8" />
            <span className="text-3xl font-bold">{stats.active}</span>
          </div>
          <p className="text-sm opacity-90">Actives</p>
        </motion.div>

        <motion.div
          className="bg-gradient-to-br from-yellow-500 to-orange-500 rounded-2xl p-6 text-white shadow-lg"
          whileHover={{ scale: 1.02 }}
        >
          <div className="flex items-center justify-between mb-2">
            <Clock className="w-8 h-8" />
            <span className="text-3xl font-bold">{stats.draft}</span>
          </div>
          <p className="text-sm opacity-90">Brouillons</p>
        </motion.div>

        <motion.div
          className="bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl p-6 text-white shadow-lg"
          whileHover={{ scale: 1.02 }}
        >
          <div className="flex items-center justify-between mb-2">
            <Award className="w-8 h-8" />
            <TrendingUp className="w-6 h-6 opacity-80" />
          </div>
          <p className="text-sm opacity-90 mb-1">XP total</p>
          <p className="text-xl font-bold">{stats.totalXP.toLocaleString()}</p>
        </motion.div>
      </div>

      {/* Role Selector & Actions */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div className="flex gap-4">
          <button
            onClick={() => setCurrentRole("USER")}
            className={`px-6 py-3 rounded-xl font-semibold transition-all flex items-center gap-2 ${
              currentRole === "USER"
                ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg"
                : "bg-white text-gray-700 hover:bg-gray-50"
            }`}
          >
            <Users className="w-5 h-5" />
            Clients
          </button>
          <button
            onClick={() => setCurrentRole("MERCHANT")}
            className={`px-6 py-3 rounded-xl font-semibold transition-all flex items-center gap-2 ${
              currentRole === "MERCHANT"
                ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg"
                : "bg-white text-gray-700 hover:bg-gray-50"
            }`}
          >
            <Store className="w-5 h-5" />
            Commerçants
          </button>
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => setShowSuggestions(!showSuggestions)}
            className="px-6 py-3 rounded-xl font-semibold bg-white text-purple-600 hover:bg-purple-50 transition-all flex items-center gap-2 shadow-md"
          >
            <Sparkles className="w-5 h-5" />
            Missions suggérées
          </button>
          <button
            onClick={handleOpenCreateModal}
            className="px-6 py-3 rounded-xl font-semibold bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:opacity-90 transition-all flex items-center gap-2 shadow-lg"
          >
            <Plus className="w-5 h-5" />
            Nouvelle mission
          </button>
        </div>
      </div>

      {/* Missions suggérées */}
      <AnimatePresence>
        {showSuggestions && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-8 overflow-hidden"
          >
            <div className="bg-white rounded-2xl p-6 shadow-lg">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                  <Sparkles className="w-6 h-6 text-purple-600" />
                  Missions suggérées pour{" "}
                  {currentRole === "USER" ? "les clients" : "les commerçants"}
                </h2>
                <button
                  onClick={() => setShowSuggestions(false)}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {Object.entries(groupedSuggestions).map(
                ([category, missions]) => (
                  <div key={category} className="mb-8 last:mb-0">
                    <h3 className="text-lg font-semibold text-gray-700 mb-4 flex items-center gap-2">
                      {category === "Débutant" && <Zap className="w-5 h-5 text-green-500" />}
                      {category === "Intermédiaire" && <Target className="w-5 h-5 text-yellow-500" />}
                      {category === "Expert" && <Award className="w-5 h-5 text-purple-500" />}
                      {category}
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {missions.map((mission, index) => (
                        <motion.div
                          key={index}
                          className="bg-gradient-to-br from-white to-gray-50 rounded-xl p-4 border-2 border-gray-200 hover:border-purple-400 transition-all cursor-pointer"
                          onClick={() => handleCreateFromSuggestion(mission)}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <div className="flex items-start gap-3">
                            <div className="text-3xl">{mission.icon}</div>
                            <div className="flex-1">
                              <h4 className="font-semibold text-gray-800 mb-1">
                                {mission.title}
                              </h4>
                              <p className="text-sm text-gray-600 mb-2">
                                {mission.description}
                              </p>
                              <div className="flex items-center justify-between">
                                <span className="text-xs font-semibold text-purple-600">
                                  {mission.xpReward} XP
                                </span>
                                <span className="text-xs text-gray-500">
                                  Objectif: {mission.goal}
                                </span>
                                <span
                                  className={`text-xs px-2 py-1 rounded-full ${
                                    mission.difficulty === "facile"
                                      ? "bg-green-100 text-green-700"
                                      : mission.difficulty === "moyen"
                                      ? "bg-yellow-100 text-yellow-700"
                                      : "bg-red-100 text-red-700"
                                  }`}
                                >
                                  {mission.difficulty}
                                </span>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                )
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Filters */}
      <div className="bg-white rounded-2xl p-4 shadow-lg mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Rechercher par titre ou type..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white"
          >
            <option value="all">Tous les statuts</option>
            <option value="ACTIVE">Actives</option>
            <option value="DRAFT">Brouillons</option>
          </select>
        </div>
      </div>

      {/* Loading / Error */}
      {isLoading && (
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
        </div>
      )}

      {error && !isLoading && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
          <p className="text-red-600">{error}</p>
        </div>
      )}

      {/* Missions List */}
      {!isLoading && !error && (
        <>
          {filteredMissions.length === 0 ? (
            <div className="bg-white rounded-2xl p-12 text-center shadow-lg">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Target className="w-10 h-10 text-gray-400" />
              </div>
              <p className="text-xl font-semibold text-gray-700 mb-2">
                Aucune mission trouvée
              </p>
              <p className="text-gray-500">
                Créez votre première mission ou utilisez les suggestions !
              </p>
            </div>
          ) : (
            <div className="grid gap-4">
              {filteredMissions.map((mission) => (
                <motion.div
                  key={mission.id}
                  className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow border border-gray-100"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <div className="flex items-start gap-4">
                    <div className="text-4xl">{mission.icon}</div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="text-xl font-bold text-gray-800">
                            {mission.title}
                          </h3>
                          <p className="text-sm text-gray-600 mt-1">
                            {mission.description}
                          </p>
                          <p className="text-xs text-gray-400 font-mono mt-1">
                            Type: {mission.type}
                          </p>
                        </div>
                        <span
                          className={`px-3 py-1 rounded-full text-sm font-semibold ${
                            mission.status === "ACTIVE"
                              ? "bg-green-100 text-green-700"
                              : "bg-yellow-100 text-yellow-700"
                          }`}
                        >
                          {mission.status === "ACTIVE" ? "Active" : "Brouillon"}
                        </span>
                      </div>
                      <div className="flex items-center gap-6 mt-4">
                        <div className="flex items-center gap-2">
                          <Award className="w-5 h-5 text-purple-600" />
                          <span className="text-lg font-bold text-purple-600">
                            {mission.xpReward} XP
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Target className="w-5 h-5 text-blue-600" />
                          <span className="text-sm text-gray-600">
                            Objectif: {mission.goal}
                          </span>
                        </div>
                        <div className="flex-1"></div>
                        <button
                          onClick={() => handleOpenEditModal(mission)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        >
                          <Edit className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleDeleteMission(mission.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </>
      )}

      {/* Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <MissionFormModal
            mission={editingMission}
            onClose={() => setIsModalOpen(false)}
            onSave={fetchMissions}
            currentRole={currentRole}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

// Modal Component
const MissionFormModal = ({
  mission,
  onClose,
  onSave,
  currentRole,
}: {
  mission: Mission | null;
  onClose: () => void;
  onSave: () => void;
  currentRole: "USER" | "MERCHANT";
}) => {
  const initialState = useMemo(
    () => ({
      title: mission?.title || "",
      description: mission?.description || "",
      xpReward: mission?.xpReward || 50,
      goal: mission?.goal || 1,
      type: mission?.type || "",
      icon: mission?.icon || "🎯",
      status: mission?.status || "DRAFT",
      role: mission?.role || currentRole,
    }),
    [mission, currentRole]
  );

  const [formData, setFormData] = useState(initialState);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);
  const { token } = useAuth();

  useEffect(() => {
    setFormData(initialState);
  }, [initialState]);

  const availableActions =
    currentRole === "USER" ? USER_ACTIONS : MERCHANT_ACTIONS;

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value, type } = e.target;
    if (name === "status") {
      setFormData((prev) => ({
        ...prev,
        status: value as "ACTIVE" | "DRAFT",
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]:
          type === "checkbox"
            ? (e.target as HTMLInputElement).checked
            : name === "xpReward" || name === "goal"
            ? parseInt(value) || 0
            : value,
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!formData.type) {
      setModalError("Veuillez sélectionner un type de mission (action).");
      return;
    }
    if (formData.goal <= 0) {
      setModalError("L'objectif doit être supérieur à zéro.");
      return;
    }
    if (formData.xpReward <= 0) {
      setModalError("La récompense XP doit être supérieure à zéro.");
      return;
    }

    setModalError(null);
    setIsSubmitting(true);

    if (!token) {
      setModalError("Erreur d'authentification. Veuillez vous reconnecter.");
      setIsSubmitting(false);
      return;
    }

    const url = mission && mission.id
      ? `${API_URL}/admin/missions/${mission.id}`
      : `${API_URL}/admin/missions`;
    const method = mission && mission.id ? "PATCH" : "POST";

    const payload = { ...formData, role: currentRole };

    try {
      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });
      if (!response.ok) {
        const errData = await response
          .json()
          .catch(() => ({ message: "Échec de l'opération" }));
        throw new Error(errData.message || "Échec de l'opération");
      }
      onSave();
      onClose();
    } catch (error: any) {
      setModalError(error.message || "Une erreur inconnue est survenue.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <motion.div
      className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-4 backdrop-blur-sm"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden"
        initial={{ y: -50, opacity: 0, scale: 0.9 }}
        animate={{ y: 0, opacity: 1, scale: 1.0 }}
        exit={{ y: -50, opacity: 0, scale: 0.9 }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
        onClick={(e) => e.stopPropagation()}
      >
        <form onSubmit={handleSubmit}>
          {/* Header */}
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold">
                {mission && mission.id ? "Modifier la mission" : "Créer une mission"}
              </h2>
              <button
                type="button"
                onClick={onClose}
                className="p-1 hover:bg-white/20 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-sm opacity-90 mt-1">
              Pour les {currentRole === "USER" ? "clients" : "commerçants"}
            </p>
          </div>

          {/* Body */}
          <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
            {modalError && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-red-600 text-sm">{modalError}</p>
              </div>
            )}

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Titre *
              </label>
              <input
                name="title"
                value={formData.title}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                rows={3}
              ></textarea>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Récompense XP *
                </label>
                <input
                  name="xpReward"
                  type="number"
                  min="1"
                  value={formData.xpReward}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Objectif *
                </label>
                <input
                  name="goal"
                  type="number"
                  min="1"
                  value={formData.goal}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Type de mission *
              </label>
              <select
                name="type"
                value={formData.type}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                required
              >
                <option value="">-- Sélectionner --</option>
                {availableActions.map((action) => (
                  <option key={action.value} value={action.value}>
                    {action.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Icône (Emoji)
                </label>
                <select
                  name="icon"
                  value={formData.icon}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-xl"
                >
                  <option value="">-- Choisir un emoji --</option>
                  {AVAILABLE_EMOJIS.map((item) => (
                    <option key={item.emoji} value={item.emoji}>
                      {item.emoji} {item.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Statut
                </label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="DRAFT">Brouillon</option>
                  <option value="ACTIVE">Actif</option>
                </select>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="p-6 bg-gray-50 flex justify-end gap-3 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 bg-white text-gray-700 rounded-lg hover:bg-gray-100 transition-colors border border-gray-300"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:opacity-90 transition-opacity"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Sauvegarde..." : "Sauvegarder"}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
};
