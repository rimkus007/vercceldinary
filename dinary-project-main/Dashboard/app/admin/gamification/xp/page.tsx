"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Star,
  Users,
  Zap,
  Plus,
  Edit,
  Trash2,
  X,
  Trophy,
  Crown,
} from "lucide-react";
// Assure-toi que le chemin d'importation est correct
import { useAuth } from "@/contexts/AuthContext";
import { motion, AnimatePresence } from "framer-motion";

// --- INTERFACES POUR LES DONNÉES DYNAMIQUES ---
interface XpRule {
  id: string;
  action: string;
  xpValue: number;
  description: string | null;
  isActive: boolean;
  role: "USER" | "MERCHANT"; // Ajoute le rôle ici si l'API le renvoie
}

interface Level {
  id: string;
  level: number;
  name: string;
  xpRequired: number;
  icon?: string | null; // Icon est optionnel dans le schéma
  // isActive n'est généralement pas sur Level, mais peut-être sur LevelRule si tu l'as ajouté
}

interface UserProgression {
  id: string;
  username: string;
  currentLevel: number;
  totalXP: number;
  xpToNextLevel: number;
  progressPercentage: number;
}

interface GamificationStats {
  totalUsers: number;
  totalXPAwarded: number;
  activeRules: number;
  avgLevel: number;
}

// --- ✨ NOUVEAU : Listes d'actions prédéfinies ---
// !! ADAPTE CES LISTES AVEC TES VRAIES ACTIONS BACKEND !!
const USER_ACTIONS = [
  { value: "transfer", label: "Envoyer de l'argent (Transfert)" },
  { value: "payment", label: "Payer un marchand (Payment QR)" },
  { value: "recharge", label: "Recharger son compte (Recharge)" },
  { value: "referral", label: "Parrainer un ami (Referral)" },
  { value: "verify_identity", label: "Vérifier son identité" },
  { value: "first_login", label: "Première connexion" },
  // Ajoute d'autres actions spécifiques aux clients ici
];

const MERCHANT_ACTIONS = [
  { value: "RECEIVE_PAYMENT", label: "Recevoir un paiement" },
  { value: "ADD_PRODUCT", label: "Ajouter un produit" },
  { value: "COMPLETE_PROFILE", label: "Compléter son profil" },
  { value: "VERIFY_IDENTITY", label: "Vérifier son identité (Marchand)" },
  { value: "FIRST_SALE", label: "Première vente réalisée" },
  { value: "RECHARGE_CLIENT", label: "Recharger un client" },
  { value: "WITHDRAWAL_REQUEST", label: "Demander un retrait" },
  { value: "REACH_SALES_GOAL", label: "Atteindre l'objectif de ventes" },
  // Ajoute d'autres actions spécifiques aux marchands ici
];
// --- Fin des nouvelles listes ---

export default function XPSystemPage() {
  const [xpRules, setXpRules] = useState<XpRule[]>([]);
  const [levels, setLevels] = useState<Level[]>([]);
  const [userProgressions, setUserProgressions] = useState<UserProgression[]>(
    []
  );
  const [stats, setStats] = useState<GamificationStats | null>(null);

  const [activeTab, setActiveTab] = useState<"rules" | "levels" | "users">(
    "rules"
  );
  const [loading, setLoading] = useState(true);
  const { token } = useAuth();

  const [ruleRole, setRuleRole] = useState<"USER" | "MERCHANT">("USER");

  // États pour le modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentRule, setCurrentRule] = useState<Partial<XpRule>>({
    action: "",
  });
  const [error, setError] = useState<string | null>(null);

  const fetchAllData = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      const [rulesRes, levelsRes, usersRes, statsRes] = await Promise.all([
        fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/admin/gamification/xp-rules?role=${ruleRole}`,
          { headers: { Authorization: `Bearer ${token}` } }
        ),
        fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/admin/gamification/level-rules?role=${ruleRole}`,
          { headers: { Authorization: `Bearer ${token}` } }
        ),
        // Ne fetch les progressions user que si on est sur le rôle USER
        ruleRole === "USER"
          ? fetch(
              `${process.env.NEXT_PUBLIC_API_URL}/admin/gamification/user-progressions`,
              { headers: { Authorization: `Bearer ${token}` } }
            )
          : Promise.resolve(new Response(JSON.stringify([]))), // Renvoie un tableau vide pour MERCHANT
        // Fetch les stats pour USER et MERCHANT
        fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/admin/gamification/stats${ruleRole === "MERCHANT" ? "?role=MERCHANT" : ""}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        ),
      ]);

      if (!rulesRes.ok || !levelsRes.ok) {
        // Ne vérifie plus usersRes et statsRes ici
        throw new Error("Impossible de charger les règles ou les niveaux.");
      }
      setXpRules(await rulesRes.json());
      setLevels(await levelsRes.json());

      // Met à jour conditionnellement les progressions utilisateur
      if (ruleRole === "USER") {
        try {
          setUserProgressions(usersRes.ok ? await usersRes.json() : []);
        } catch (e) {
          /* log removed */
          setUserProgressions([]);
        }
      } else {
        setUserProgressions([]); // Vide les progressions si on est sur MERCHANT
      }

      // Met à jour les stats pour USER et MERCHANT
      try {
        setStats(statsRes.ok ? await statsRes.json() : null);
      } catch (e) {
        /* log removed */
        setStats(null);
      }
    } catch (error: any) {
      /* log removed */
      setError(error.message || "Impossible de charger les données.");
    } finally {
      setLoading(false);
    }
  }, [token, ruleRole]);

  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  // Fonctions de gestion du modal (CRUD)
  const openModalForCreate = () => {
    setIsEditing(false);
    const defaultAction =
      (ruleRole === "USER"
        ? USER_ACTIONS[0]?.value
        : MERCHANT_ACTIONS[0]?.value) || "";
    setCurrentRule({
      action: defaultAction,
      xpValue: 10,
      description: "",
      isActive: true,
    });
    setIsModalOpen(true);
    setError(null);
  };

  const openModalForEdit = (rule: XpRule) => {
    setIsEditing(true);
    setCurrentRule(rule);
    setIsModalOpen(true);
    setError(null);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    // Optionnel : Réinitialiser currentRule après fermeture
    // setCurrentRule({ action: "" });
  };

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value, type } = e.target;
    if (type === "checkbox") {
      const { checked } = e.target as HTMLInputElement;
      setCurrentRule((prev) => ({ ...prev, [name]: checked }));
    } else {
      setCurrentRule((prev) => ({
        ...prev,
        [name]: name === "xpValue" ? parseInt(value) || 0 : value,
      }));
    }
  };

  const handleSaveRule = async () => {
    if (!currentRule.action) {
      setError("Veuillez sélectionner une action.");
      return;
    }
    if (!currentRule.xpValue || currentRule.xpValue <= 0) {
      setError("La valeur XP doit être un nombre positif.");
      return;
    }

    const url = isEditing
      ? `${process.env.NEXT_PUBLIC_API_URL}/admin/gamification/xp-rules/${currentRule.id}`
      : `${process.env.NEXT_PUBLIC_API_URL}/admin/gamification/xp-rules`;
    const method = isEditing ? "PATCH" : "POST";

    // Affiche un indicateur de chargement dans le modal
    const saveButton = document.querySelector(
      'button[type="button"][onClick="handleSaveRule"]'
    ); // Trouvez le bouton Sauvegarder
    const originalButtonText = saveButton
      ? saveButton.innerHTML
      : "Sauvegarder";
    if (saveButton) saveButton.innerHTML = "Sauvegarde...";

    try {
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
        throw new Error(
          errData.message || "Échec de la sauvegarde de la règle."
        );
      }
      closeModal();
      await fetchAllData();
    } catch (err: any) {
      setError(err.message || "Une erreur est survenue.");
      if (saveButton) saveButton.innerHTML = originalButtonText; // Restaure le texte si erreur
    }
    // Ne restaure le texte que si pas d'erreur, car le modal se ferme
    // else if (saveButton) saveButton.innerHTML = originalButtonText;
  };

  const handleDeleteRule = async (ruleId: string) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer cette règle ?")) {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/admin/gamification/xp-rules/${ruleId}`,
          {
            method: "DELETE",
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        if (!response.ok) throw new Error("Échec de la suppression.");
        await fetchAllData();
      } catch (error) {
        /* log removed */
        // Afficher l'erreur dans le UI plutôt qu'un simple alert
        setError("Une erreur est survenue lors de la suppression.");
      }
    }
  };

  // --- Affichage du chargement ---
  if (loading && !isModalOpen) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // --- Affichage de l'erreur globale ---
  if (error && !isModalOpen) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen text-center p-6">
        <p className="text-red-600 font-semibold mb-4">Erreur</p>
        <p className="text-gray-700 bg-red-50 p-3 rounded-lg mb-6">{error}</p>
        <button
          onClick={() => fetchAllData()} // Permet de réessayer
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Réessayer
        </button>
      </div>
    );
  }

  // --- Sélectionne la bonne liste d'actions pour le modal ---
  const availableActions =
    ruleRole === "USER" ? USER_ACTIONS : MERCHANT_ACTIONS;

  return (
    <>
      <div className="p-6 max-w-7xl mx-auto">
        {/* --- Header --- */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-2">
                Gestion du Système d'XP
              </h1>
              <p className="text-gray-600">
                Gérez les points d'expérience, les niveaux et la progression des{" "}
                {ruleRole === "MERCHANT" ? "commerçants" : "utilisateurs"}.
              </p>
            </div>
            <button
              onClick={openModalForCreate}
              className="flex items-center px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:opacity-90 transition-all shadow-lg"
            >
              <Plus className="w-5 h-5 mr-2" />
              Ajouter une Règle
            </button>
          </div>

          {/* --- Sélecteur de rôle --- */}
          <div className="flex items-center gap-2 mb-6">
            <button
              type="button"
              onClick={() => setRuleRole("USER")}
              className={`px-6 py-3 rounded-xl text-sm font-semibold transition-all ${
                ruleRole === "USER"
                  ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg"
                  : "bg-white text-gray-700 border-2 border-gray-200 hover:border-indigo-300"
              }`}
            >
              👤 Clients
            </button>
            <button
              type="button"
              onClick={() => setRuleRole("MERCHANT")}
              className={`px-6 py-3 rounded-xl text-sm font-semibold transition-all ${
                ruleRole === "MERCHANT"
                  ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg"
                  : "bg-white text-gray-700 border-2 border-gray-200 hover:border-indigo-300"
              }`}
            >
              🏪 Commerçants
            </button>
          </div>

          {/* --- Cartes de statistiques --- */}
          {stats && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8"
            >
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-2xl shadow-md border border-blue-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-blue-700 mb-1">
                      Utilisateurs
                    </p>
                    <p className="text-3xl font-bold text-blue-900">
                      {stats.totalUsers.toLocaleString()}
                    </p>
                  </div>
                  <Users className="w-10 h-10 text-blue-600" />
                </div>
              </div>
              <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-2xl shadow-md border border-green-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-green-700 mb-1">
                      XP Distribués
                    </p>
                    <p className="text-3xl font-bold text-green-900">
                      {stats.totalXPAwarded.toLocaleString()}
                    </p>
                  </div>
                  <Star className="w-10 h-10 text-green-600" />
                </div>
              </div>
              <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-2xl shadow-md border border-purple-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-purple-700 mb-1">
                      Règles Actives
                    </p>
                    <p className="text-3xl font-bold text-purple-900">
                      {stats.activeRules}
                    </p>
                  </div>
                  <Zap className="w-10 h-10 text-purple-600" />
                </div>
              </div>
              <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-6 rounded-2xl shadow-md border border-orange-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-orange-700 mb-1">
                      Niveau Moyen
                    </p>
                    <p className="text-3xl font-bold text-orange-900">
                      {stats.avgLevel.toFixed(1)}
                    </p>
                  </div>
                  <Trophy className="w-10 h-10 text-orange-600" />
                </div>
              </div>
            </motion.div>
          )}
        </div>

        {/* --- Onglets et contenu --- */}
        <div className="bg-white rounded-lg shadow-sm border mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex">
              <button
                onClick={() => setActiveTab("rules")}
                className={`px-6 py-3 text-sm font-medium border-b-2 ${
                  activeTab === "rules"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                Règles d'XP
              </button>
              <button
                onClick={() => setActiveTab("levels")}
                className={`px-6 py-3 text-sm font-medium border-b-2 ${
                  activeTab === "levels"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                Système de Niveaux
              </button>
              {/* Onglet Utilisateurs conditionnel */}
              {ruleRole === "USER" && (
                <button
                  onClick={() => setActiveTab("users")}
                  className={`px-6 py-3 text-sm font-medium border-b-2 ${
                    activeTab === "users"
                      ? "border-blue-500 text-blue-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                >
                  Progression Utilisateurs
                </button>
              )}
            </nav>
          </div>
          <div className="p-6">
            {/* --- Contenu Onglet Règles d'XP --- */}
            {activeTab === "rules" && (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Action
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Valeur XP
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Description
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Statut
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {xpRules.map((rule) => (
                      <tr key={rule.id}>
                        <td className="px-6 py-4 whitespace-nowrap font-mono text-sm text-gray-800">
                          {rule.action}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-blue-600">
                          {rule.xpValue} XP
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600 max-w-sm truncate">
                          {rule.description || "-"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              rule.isActive
                                ? "bg-green-100 text-green-800"
                                : "bg-gray-100 text-gray-800"
                            }`}
                          >
                            {rule.isActive ? "Active" : "Inactive"}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button
                            onClick={() => openModalForEdit(rule)}
                            className="text-blue-600 hover:text-blue-900 mr-4"
                          >
                            <Edit size={18} />
                          </button>
                          <button
                            onClick={() => handleDeleteRule(rule.id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            <Trash2 size={18} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {xpRules.length === 0 && (
                  <p className="text-center text-gray-500 py-6">
                    Aucune règle d'XP définie pour les{" "}
                    {ruleRole === "USER" ? "clients" : "commerçants"}.
                  </p>
                )}
              </div>
            )}
            {/* --- Contenu Onglet Niveaux --- */}
            {activeTab === "levels" && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {levels.map((level) => (
                  <div
                    key={level.id}
                    className="border rounded-lg p-6 bg-gradient-to-br from-white to-gray-50 shadow-sm hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <span className="text-3xl">{level.icon || "🏆"}</span>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-800">
                            Niveau {level.level}
                          </h3>
                          <p className="text-sm text-gray-600">{level.name}</p>
                        </div>
                      </div>
                      {/* Afficher une couronne spéciale pour les niveaux élevés ? */}
                      {level.level >= 5 && (
                        <Crown className="w-6 h-6 text-yellow-500 opacity-70" />
                      )}
                    </div>
                    <p className="text-md text-blue-600 font-semibold">
                      XP Requis:{" "}
                      <span className="text-xl">
                        {level.xpRequired.toLocaleString()}
                      </span>
                    </p>
                  </div>
                ))}
                {levels.length === 0 && (
                  <p className="text-center text-gray-500 py-6 col-span-full">
                    Aucun niveau défini pour les{" "}
                    {ruleRole === "USER" ? "clients" : "commerçants"}.
                  </p>
                )}
              </div>
            )}
            {/* --- Contenu Onglet Progression Utilisateurs (Conditionnel) --- */}
            {activeTab === "users" && ruleRole === "USER" && (
              <div className="space-y-4">
                {userProgressions.map((user) => (
                  <div
                    key={user.id}
                    className="border rounded-lg p-6 bg-white shadow-sm"
                  >
                    <div className="flex flex-col md:flex-row items-start md:items-center justify-between">
                      <div className="mb-4 md:mb-0">
                        <h3 className="text-lg font-semibold text-gray-800">
                          {user.username}
                        </h3>
                        <p className="text-sm text-gray-600">
                          Niveau {user.currentLevel} •{" "}
                          {user.totalXP.toLocaleString()} XP Total
                        </p>
                      </div>
                      <div className="text-right w-full md:w-1/3">
                        <div className="text-sm text-gray-600 mb-1">
                          {user.xpToNextLevel > 0
                            ? `${user.xpToNextLevel.toLocaleString()} XP restants`
                            : "Niveau Max atteint !"}
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
                          <div
                            className="bg-gradient-to-r from-blue-500 to-purple-600 h-2.5 rounded-full"
                            style={{ width: `${user.progressPercentage}%` }}
                          ></div>
                        </div>
                        <div className="text-xs text-gray-500 mt-1 text-right">
                          {user.progressPercentage}%
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                {userProgressions.length === 0 && (
                  <p className="text-center text-gray-500 py-6">
                    Aucune donnée de progression disponible.
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* --- Modal pour Ajouter/Modifier une Règle d'XP --- */}
      <AnimatePresence>
        {isModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black bg-opacity-60 backdrop-blur-sm p-4"
            onClick={closeModal} // Ferme si on clique en dehors
          >
            <motion.div
              initial={{ y: 50, opacity: 0, scale: 0.95 }}
              animate={{ y: 0, opacity: 1, scale: 1.0 }}
              exit={{ y: 50, opacity: 0, scale: 0.95 }}
              transition={{ type: "spring", stiffness: 400, damping: 25 }}
              className="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden"
              onClick={(e) => e.stopPropagation()} // Empêche la fermeture si on clique dedans
            >
              {/* Header du Modal */}
              <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-6">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-bold">
                    {isEditing ? "Modifier la Règle" : "Ajouter une Règle"} pour{" "}
                    {ruleRole === "USER" ? "Client" : "Commerçant"}
                  </h2>
                  <button
                    onClick={closeModal}
                    className="p-1 hover:bg-white/20 rounded-full transition-colors"
                  >
                    <X size={20} />
                  </button>
                </div>
              </div>

              {/* Contenu du Modal (Formulaire) */}
              <div className="p-6 max-h-[60vh] overflow-y-auto">
                {error && (
                  <p className="text-red-600 bg-red-50 p-3 rounded-md text-sm mb-4">
                    {error}
                  </p>
                )}
                <div className="space-y-4">
                  {/* --- Menu déroulant Action --- */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Action*
                    </label>
                    <select
                      name="action"
                      value={currentRule.action || ""}
                      onChange={handleInputChange}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm"
                    >
                      <option value="" disabled>
                        -- Sélectionner une action --
                      </option>
                      {availableActions.map((actionOption) => (
                        <option
                          key={actionOption.value}
                          value={actionOption.value}
                        >
                          {actionOption.label} ({actionOption.value})
                        </option>
                      ))}
                    </select>
                    <p className="text-xs text-gray-500 mt-1">
                      Identifiant technique entre parenthèses.
                    </p>
                  </div>

                  {/* --- Input Valeur XP --- */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Valeur XP*
                    </label>
                    <input
                      type="number"
                      name="xpValue"
                      value={currentRule.xpValue || ""} // Affiche vide si 0 pour forcer la saisie
                      onChange={handleInputChange}
                      min="1"
                      placeholder="Ex: 50"
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm"
                    />
                  </div>

                  {/* --- Textarea Description --- */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Description (Optionnel)
                    </label>
                    <textarea
                      name="description"
                      value={currentRule.description || ""}
                      onChange={handleInputChange}
                      rows={3}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm"
                      placeholder="À quoi correspond cette règle ?"
                    />
                  </div>

                  {/* --- Checkbox Active --- */}
                  <div className="flex items-center pt-2">
                    <input
                      id="isActive"
                      name="isActive"
                      type="checkbox"
                      checked={currentRule.isActive ?? true}
                      onChange={handleInputChange}
                      className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <label
                      htmlFor="isActive"
                      className="ml-2 block text-sm text-gray-900"
                    >
                      Règle active (donnera de l'XP)
                    </label>
                  </div>
                </div>
              </div>

              {/* Footer du Modal (Boutons) */}
              <div className="bg-gray-50 px-6 py-4 flex justify-end gap-3 border-t border-gray-200">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-6 py-2 bg-white text-gray-700 rounded-lg hover:bg-gray-100 transition-colors border border-gray-300"
                >
                  Annuler
                </button>
                <button
                  type="button"
                  onClick={handleSaveRule}
                  className="px-6 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:opacity-90 transition-opacity"
                >
                  Sauvegarder la Règle
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
