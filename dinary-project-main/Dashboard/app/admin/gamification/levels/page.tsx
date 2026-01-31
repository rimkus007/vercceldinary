"use client";

import { useState, useEffect, useCallback } from "react";
import { Trophy, Plus, Edit, Trash2, X, Star, Shield } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { motion, AnimatePresence } from "framer-motion";

// Liste d'emojis disponibles pour les niveaux
const AVAILABLE_EMOJIS = [
  { emoji: "🏆", label: "Trophée" },
  { emoji: "⭐", label: "Étoile" },
  { emoji: "👑", label: "Couronne" },
  { emoji: "💎", label: "Diamant" },
  { emoji: "🎖️", label: "Médaille" },
  { emoji: "🥇", label: "Médaille d'or" },
  { emoji: "🥈", label: "Médaille d'argent" },
  { emoji: "🥉", label: "Médaille de bronze" },
  { emoji: "🌟", label: "Étoile brillante" },
  { emoji: "✨", label: "Étincelles" },
  { emoji: "🔥", label: "Feu" },
  { emoji: "⚡", label: "Éclair" },
  { emoji: "🚀", label: "Fusée" },
  { emoji: "💪", label: "Muscle" },
  { emoji: "🎯", label: "Cible" },
  { emoji: "🏅", label: "Médaille sportive" },
  { emoji: "🎓", label: "Diplôme" },
  { emoji: "🔰", label: "Débutant" },
  { emoji: "🛡️", label: "Bouclier" },
  { emoji: "⚔️", label: "Épées" },
];

// Interface pour les règles de niveau
interface LevelRule {
  id: string;
  level: number;
  name: string;
  xpRequired: number;
  icon?: string;
}

export default function LevelRulesPage() {
  const [levelRules, setLevelRules] = useState<LevelRule[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { token } = useAuth();

  // Rôle sélectionné pour les règles de niveau : 'USER' (clients) ou 'MERCHANT' (commerçants)
  const [ruleRole, setRuleRole] = useState<"USER" | "MERCHANT">("USER");

  // États pour le modal de création/édition
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentRule, setCurrentRule] = useState<Partial<LevelRule>>({});

  const fetchLevelRules = useCallback(async () => {
    if (!token) return;
    setIsLoading(true);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/admin/gamification/level-rules?role=${ruleRole}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (!response.ok)
        throw new Error("Impossible de charger les règles de niveaux.");
      const data = await response.json();
      setLevelRules(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [token, ruleRole]);

  useEffect(() => {
    fetchLevelRules();
  }, [fetchLevelRules]);

  // Fonctions de gestion du modal (CRUD)
  const openModalForCreate = () => {
    setIsEditing(false);
    setCurrentRule({
      level:
        (levelRules.length > 0
          ? Math.max(...levelRules.map((r) => r.level))
          : 0) + 1,
      name: "",
      xpRequired: 0,
      icon: "🏆",
    });
    setIsModalOpen(true);
  };

  const openModalForEdit = (rule: LevelRule) => {
    setIsEditing(true);
    setCurrentRule(rule);
    setIsModalOpen(true);
  };

  const closeModal = () => setIsModalOpen(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setCurrentRule((prev) => ({
      ...prev,
      [name]: type === "number" ? parseInt(value) || 0 : value,
    }));
  };

  const handleSaveRule = async () => {
    if (
      !currentRule.name ||
      currentRule.level == null ||
      currentRule.xpRequired == null
    ) {
      alert("Veuillez remplir tous les champs requis.");
      return;
    }

    const url = isEditing
      ? `${process.env.NEXT_PUBLIC_API_URL}/admin/gamification/level-rules/${currentRule.id}`
      : `${process.env.NEXT_PUBLIC_API_URL}/admin/gamification/level-rules`;
    const method = isEditing ? "PATCH" : "POST";

    try {
      // Transmet le rôle sélectionné pour la règle
      const payload = { ...currentRule, role: ruleRole };
      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });
      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.message || "Échec de l'opération.");
      }
      closeModal();
      await fetchLevelRules();
    } catch (err: any) {
      alert("Erreur: " + err.message);
    }
  };

  const handleDeleteRule = async (ruleId: string) => {
    if (
      window.confirm(
        "Êtes-vous sûr de vouloir supprimer cette règle de niveau ?"
      )
    ) {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/admin/gamification/level-rules/${ruleId}`,
          {
            method: "DELETE",
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        if (!response.ok) throw new Error("Échec de la suppression.");
        await fetchLevelRules();
      } catch (error: any) {
        alert("Erreur: " + error.message);
      }
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return <div className="text-center p-8 text-red-500">{error}</div>;
  }

  // Calcul des statistiques
  const totalLevels = levelRules.length;
  const maxXP = levelRules.length > 0 ? Math.max(...levelRules.map(r => r.xpRequired)) : 0;
  const avgXP = levelRules.length > 0 ? Math.round(levelRules.reduce((sum, r) => sum + r.xpRequired, 0) / levelRules.length) : 0;

  return (
    <>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-2">
              🎯 Règles des Niveaux
            </h1>
            <p className="text-gray-600">
              Définissez les paliers de progression pour les{" "}
              {ruleRole === "MERCHANT" ? "commerçants" : "utilisateurs"}.
            </p>
          </div>
          <button
            onClick={openModalForCreate}
            className="flex items-center px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:from-indigo-700 hover:to-purple-700 shadow-lg transition-all font-bold"
          >
            <Plus className="w-5 h-5 mr-2" />
            Ajouter un Niveau
          </button>
        </div>

        {/* Sélecteur de rôle pour filtrer les règles selon le public ciblé */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setRuleRole("USER")}
            className={`px-6 py-3 rounded-xl text-sm font-bold transition-all shadow-md ${
              ruleRole === "USER"
                ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white scale-105"
                : "bg-white text-gray-700 hover:bg-gray-50 border-2 border-gray-200"
            }`}
          >
            👥 Clients
          </button>
          <button
            type="button"
            onClick={() => setRuleRole("MERCHANT")}
            className={`px-6 py-3 rounded-xl text-sm font-bold transition-all shadow-md ${
              ruleRole === "MERCHANT"
                ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white scale-105"
                : "bg-white text-gray-700 hover:bg-gray-50 border-2 border-gray-200"
            }`}
          >
            🏪 Commerçants
          </button>
        </div>

        {/* Statistiques */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-br from-blue-500 to-indigo-600 p-6 rounded-2xl shadow-lg text-white"
          >
            <div className="flex items-center gap-3 mb-2">
              <Star className="w-8 h-8" />
              <p className="text-sm font-medium opacity-90">Niveaux Définis</p>
            </div>
            <p className="text-4xl font-bold">{totalLevels}</p>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-gradient-to-br from-purple-500 to-pink-600 p-6 rounded-2xl shadow-lg text-white"
          >
            <div className="flex items-center gap-3 mb-2">
              <Trophy className="w-8 h-8" />
              <p className="text-sm font-medium opacity-90">XP Maximum</p>
            </div>
            <p className="text-4xl font-bold">{maxXP.toLocaleString()}</p>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-gradient-to-br from-orange-500 to-red-600 p-6 rounded-2xl shadow-lg text-white"
          >
            <div className="flex items-center gap-3 mb-2">
              <Shield className="w-8 h-8" />
              <p className="text-sm font-medium opacity-90">XP Moyen</p>
            </div>
            <p className="text-4xl font-bold">{avgXP.toLocaleString()}</p>
          </motion.div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gradient-to-r from-indigo-600 to-purple-600">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-bold text-white uppercase tracking-wider">
                    Icône
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-white uppercase tracking-wider">
                    Niveau
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-white uppercase tracking-wider">
                    Nom du Niveau
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-white uppercase tracking-wider">
                    XP Requis
                  </th>
                  <th className="px-6 py-4 text-right text-sm font-bold text-white uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {levelRules.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-16 text-center">
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex flex-col items-center gap-4"
                      >
                        <div className="text-7xl">🎯</div>
                        <div>
                          <p className="text-xl font-bold text-gray-900 mb-2">
                            Aucun niveau défini
                          </p>
                          <p className="text-gray-600 mb-6">
                            Créez votre premier niveau pour commencer la progression !
                          </p>
                          <button
                            onClick={openModalForCreate}
                            className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:from-indigo-700 hover:to-purple-700 font-bold shadow-lg transition-all"
                          >
                            ✨ Créer un niveau
                          </button>
                        </div>
                      </motion.div>
                    </td>
                  </tr>
                ) : (
                  levelRules.map((rule, index) => (
                    <motion.tr 
                      key={rule.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="hover:bg-gradient-to-r hover:from-indigo-50 hover:to-purple-50 transition-all"
                    >
                      <td className="px-6 py-4">
                        <div className="text-4xl">{rule.icon || "🏆"}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full text-white font-bold text-lg shadow-md">
                          {rule.level}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-bold text-lg text-gray-900">{rule.name}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-bold text-xl text-purple-600">
                          {rule.xpRequired.toLocaleString()} XP
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => openModalForEdit(rule)}
                            className="p-2 hover:bg-indigo-100 rounded-full transition-colors"
                            title="Modifier"
                          >
                            <Edit size={20} className="text-indigo-600" />
                          </button>
                          <button
                            onClick={() => handleDeleteRule(rule.id)}
                            className="p-2 hover:bg-red-100 rounded-full transition-colors"
                            title="Supprimer"
                          >
                            <Trash2 size={20} className="text-red-600" />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {isModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
          >
            <motion.div
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 50, opacity: 0 }}
              className="bg-white rounded-lg shadow-xl w-full max-w-md"
            >
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSaveRule();
                }}
              >
                <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-4 rounded-t-lg">
                  <div className="flex justify-between items-center">
                    <h2 className="text-2xl font-bold text-white">
                      {isEditing ? "✏️ Modifier le Niveau" : "✨ Nouveau Niveau"}
                    </h2>
                    <button
                      type="button"
                      onClick={closeModal}
                      className="text-white hover:bg-white/20 rounded-full p-1 transition-colors"
                    >
                      <X size={24} />
                    </button>
                  </div>
                </div>
                <div className="p-6">
                  <div className="space-y-5">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">
                          🔢 Niveau
                        </label>
                        <input
                          type="number"
                          name="level"
                          value={currentRule.level || ""}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent font-bold"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">
                          🎨 Icône
                        </label>
                        <select
                          name="icon"
                          value={currentRule.icon || ""}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-2xl"
                        >
                          <option value="">-- Choisir --</option>
                          {AVAILABLE_EMOJIS.map((item) => (
                            <option key={item.emoji} value={item.emoji}>
                              {item.emoji} {item.label}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">
                        📝 Nom du Niveau
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={currentRule.name || ""}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent font-medium"
                        placeholder="Ex: Débutant, Apprenti, Expert..."
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">
                        ⭐ XP Requis
                      </label>
                      <input
                        type="number"
                        name="xpRequired"
                        value={currentRule.xpRequired || 0}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent font-bold"
                        required
                      />
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 px-6 py-4 flex justify-end gap-3 rounded-b-lg">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-100 font-bold transition-all"
                  >
                    Annuler
                  </button>
                  <button 
                    type="submit" 
                    className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:from-indigo-700 hover:to-purple-700 font-bold shadow-lg transition-all"
                  >
                    💾 Sauvegarder
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
