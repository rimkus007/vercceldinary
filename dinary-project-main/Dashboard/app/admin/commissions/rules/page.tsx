"use client";

import { useState, useEffect, useCallback } from "react";
import { Settings, Plus, Edit3, Trash2, Info } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { motion, AnimatePresence } from "framer-motion";

// --- INTERFACES POUR LA STRUCTURE DES DONNÉES ---
interface CommissionRule {
  id: string;
  action: string;
  description?: string;
  isActive: boolean;
  type: "fixed" | "percentage";
  value: number;
  minAmount?: number;
  maxAmount?: number;
  target?: "USER" | "MERCHANT";
}

interface RuleFormData {
  action: string;
  type: "fixed" | "percentage";
  value: number;
  minAmount?: number;
  maxAmount?: number;
  isActive: boolean;
}

// ✅ TOUTES LES ACTIONS POSSIBLES DE COMMISSION
const COMMISSION_ACTIONS = [
  // ============= ACTIONS POUR LES CLIENTS =============
  {
    value: "send_money",
    label: "Envoi d'argent (entre amis)",
    description: "Commission payée par le client qui envoie l'argent",
    icon: "💸",
    category: "Clients",
    applicableTargets: ["USER"] as ("USER" | "MERCHANT")[],
  },
  {
    value: "merchant_payment_client",
    label: "Paiement chez marchand (payé par le client)",
    description: "Commission payée par le client lors d'un achat chez un marchand",
    icon: "🛒",
    category: "Clients",
    applicableTargets: ["USER"] as ("USER" | "MERCHANT")[],
  },
  {
    value: "recharge_virement",
    label: "Recharge par virement bancaire",
    description: "Commission sur les recharges via BaridiMob ou autre virement",
    icon: "🏦",
    category: "Clients",
    applicableTargets: ["USER"] as ("USER" | "MERCHANT")[],
  },
  {
    value: "recharge_merchant",
    label: "Recharge chez marchand",
    description: "Commission sur les recharges chez un commerçant partenaire",
    icon: "🏪",
    category: "Clients",
    applicableTargets: ["USER"] as ("USER" | "MERCHANT")[],
  },
  
  // ============= ACTIONS POUR LES MARCHANDS =============
  {
    value: "merchant_payment",
    label: "Paiement client (payé par le marchand)",
    description: "Commission retenue sur le montant reçu par le marchand",
    icon: "🏪",
    category: "Marchands",
    applicableTargets: ["MERCHANT"] as ("USER" | "MERCHANT")[],
  },
  {
    value: "merchant_withdrawal",
    label: "Retrait vers compte bancaire",
    description: "Commission sur les retraits des marchands vers leurs comptes bancaires",
    icon: "🏦",
    category: "Marchands",
    applicableTargets: ["MERCHANT"] as ("USER" | "MERCHANT")[],
  },
  {
    value: "merchant_recharge_virement",
    label: "Recharge par virement bancaire",
    description: "Commission sur les recharges de compte marchand via virement bancaire",
    icon: "💳",
    category: "Marchands",
    applicableTargets: ["MERCHANT"] as ("USER" | "MERCHANT")[],
  },
];

// Grouper par catégorie
const groupedActions = COMMISSION_ACTIONS.reduce((acc, action) => {
  if (!acc[action.category]) {
    acc[action.category] = [];
  }
  acc[action.category].push(action);
  return acc;
}, {} as Record<string, typeof COMMISSION_ACTIONS>);

export default function CommissionRulesPage() {
  const { token } = useAuth();
  const [rules, setRules] = useState<CommissionRule[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // États pour le formulaire/modal
  const [showForm, setShowForm] = useState(false);
  const [editingRule, setEditingRule] = useState<CommissionRule | null>(null);
  const [formData, setFormData] = useState<Partial<RuleFormData>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Cible sélectionnée pour les règles de commission
  const [ruleTarget, setRuleTarget] = useState<"USER" | "MERCHANT">("USER");

  // Fonction pour charger les règles depuis l'API
  const loadRules = useCallback(async () => {
    if (!token) {
      setError("Vous n'êtes pas authentifié.");
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/admin/commission-rules?target=${ruleTarget}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (!response.ok) {
        throw new Error("Impossible de charger les règles de commission.");
      }
      const data = await response.json();
      setRules(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [token, ruleTarget]);

  useEffect(() => {
    loadRules();
  }, [loadRules]);

  // Fonctions pour gérer le modal
  const openModalForCreate = () => {
    setEditingRule(null);
    setFormData({
      action: "send_money",
      type: "percentage",
      value: 1.5,
      minAmount: 0,
      maxAmount: 100000,
      isActive: true,
    });
    setShowForm(true);
  };

  const openModalForEdit = (rule: CommissionRule) => {
    setEditingRule(rule);
    setFormData({
      action: rule.action,
      type: rule.type,
      value: rule.value,
      minAmount: rule.minAmount,
      maxAmount: rule.maxAmount,
      isActive: rule.isActive,
    });
    setShowForm(true);

    // Met à jour la cible courante lors de l'édition pour refléter la règle sélectionnée
    if (rule.target) {
      setRuleTarget(rule.target);
    }
  };

  // Logique de sauvegarde (Création ou Mise à jour)
  const handleSaveRule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    setIsSubmitting(true);

    const url = editingRule
      ? `${process.env.NEXT_PUBLIC_API_URL}/admin/commission-rules/${editingRule.id}`
      : `${process.env.NEXT_PUBLIC_API_URL}/admin/commission-rules`;
    const method = editingRule ? "PATCH" : "POST";

    try {
      // Ajoute la cible sélectionnée au payload pour la création/mise à jour
      const payload = { ...formData, target: ruleTarget };
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
        throw new Error(errData.message || "Échec de la sauvegarde");
      }
      setShowForm(false);
      await loadRules();
    } catch (err: any) {
      alert(`Erreur: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Logique de suppression
  const handleDeleteRule = async (ruleId: string) => {
    if (!token || !window.confirm("Supprimer cette règle ?")) return;
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/admin/commission-rules/${ruleId}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (!response.ok) throw new Error("Échec de la suppression");
      await loadRules();
    } catch (err: any) {
      alert(`Erreur: ${err.message}`);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    const isCheckbox = type === "checkbox";
    const checked = isCheckbox ? (e.target as HTMLInputElement).checked : false;

    setFormData((prev) => ({
      ...prev,
      [name]: isCheckbox
        ? checked
        : name === "value" || name === "minAmount" || name === "maxAmount"
        ? parseFloat(value)
        : value,
    }));
  };

  // Helper pour afficher la description de la structure
  const formatStructureDescription = (rule: CommissionRule) => {
    if (!rule.type) return "Non définie";
    return rule.type === "fixed"
      ? `${rule.value} DZD fixe`
      : `${rule.value}% du montant`;
  };

  // Helper pour obtenir le label d'une action
  const getActionLabel = (actionValue: string) => {
    const action = COMMISSION_ACTIONS.find((a) => a.value === actionValue);
    return action ? `${action.icon} ${action.label}` : actionValue;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center p-8 text-red-500 bg-red-50 rounded-lg">
        {error}
      </div>
    );
  }

  return (
    <>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Règles de Commission
            </h1>
            <p className="text-gray-600 mt-1">
              Configurez les commissions pour chaque type d'action sur la plateforme
            </p>
          </div>
          <button
            onClick={openModalForCreate}
            className="flex items-center px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:shadow-lg transition-shadow"
          >
            <Plus className="w-4 h-4 mr-2" /> Nouvelle Règle
          </button>
        </div>

        {/* Sélecteur de cible */}
        <div className="flex items-center gap-2 bg-white p-4 rounded-lg shadow-sm border">
          <span className="text-sm font-medium text-gray-700">
            Afficher les règles pour :
          </span>
          <button
            type="button"
            onClick={() => setRuleTarget("USER")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              ruleTarget === "USER"
                ? "bg-blue-600 text-white shadow-md"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            👤 Clients
          </button>
          <button
            type="button"
            onClick={() => setRuleTarget("MERCHANT")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              ruleTarget === "MERCHANT"
                ? "bg-purple-600 text-white shadow-md"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            🏪 Commerçants
          </button>
        </div>

        {/* Règles actives */}
        <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
          <div className="p-6 space-y-4">
            {rules.length === 0 ? (
              <div className="text-center py-12">
                <Settings className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                <p className="text-gray-500 text-lg font-medium">
                  Aucune règle de commission configurée
                </p>
                <p className="text-gray-400 text-sm mt-1">
                  Cliquez sur "Nouvelle Règle" pour commencer
                </p>
              </div>
            ) : (
              rules.map((rule) => (
                <div
                  key={rule.id}
                  className={`border rounded-lg p-5 transition-all hover:shadow-md ${
                    rule.isActive
                      ? "border-green-200 bg-gradient-to-r from-green-50 to-white"
                      : "border-gray-200 bg-gray-50 opacity-70"
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">
                        {getActionLabel(rule.action)}
                      </h3>
                      <p className="text-sm text-gray-600 mb-2">
                        <span className="font-medium">Structure:</span>{" "}
                        {formatStructureDescription(rule)}
                      </p>
                      {(rule.minAmount != null || rule.maxAmount != null) && (
                        <p className="text-xs text-gray-500 flex items-center gap-1">
                          <Info className="w-3 h-3" />
                          Applicable entre {rule.minAmount ?? 0} DZD et{" "}
                          {rule.maxAmount ?? "illimité"} DZD
                        </p>
                      )}
                    </div>
                    <div className="flex items-center space-x-3 ml-4">
                      <span
                        className={`px-3 py-1 text-xs font-bold rounded-full ${
                          rule.isActive
                            ? "bg-green-100 text-green-700"
                            : "bg-gray-200 text-gray-600"
                        }`}
                      >
                        {rule.isActive ? "✓ ACTIVE" : "✗ INACTIVE"}
                      </span>
                      <button
                        onClick={() => openModalForEdit(rule)}
                        className="p-2 hover:bg-blue-100 rounded-lg transition-colors"
                        title="Modifier"
                      >
                        <Edit3 className="w-5 h-5 text-blue-600" />
                      </button>
                      <button
                        onClick={() => handleDeleteRule(rule.id)}
                        className="p-2 hover:bg-red-100 rounded-lg transition-colors"
                        title="Supprimer"
                      >
                        <Trash2 className="w-5 h-5 text-red-600" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Section d'information - Toutes les actions possibles */}
        <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl shadow-sm border border-blue-100 p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Info className="w-6 h-6 text-blue-600" />
            {ruleTarget === "USER" ? "Actions pour les Clients 👤" : "Actions pour les Marchands 🏪"}
          </h2>
          <div className="space-y-4">
            {Object.entries(groupedActions)
              .filter(([category]) => 
                ruleTarget === "USER" ? category === "Clients" : category === "Marchands"
              )
              .map(([category, actions]) => (
              <div key={category}>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {actions
                    .filter((action) => action.applicableTargets.includes(ruleTarget))
                    .map((action) => (
                    <div
                      key={action.value}
                      className="bg-white rounded-lg p-4 border border-gray-200 hover:border-blue-300 hover:shadow-sm transition-all"
                    >
                      <div className="flex items-start gap-3">
                        <span className="text-2xl">{action.icon}</span>
                        <div className="flex-1">
                          <p className="font-semibold text-gray-900 text-sm">
                            {action.label}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            {action.description}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Modal pour créer/éditer une règle */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50"
          >
            <motion.div
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 50, opacity: 0 }}
              className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col"
            >
              <form onSubmit={handleSaveRule} className="flex flex-col h-full">
                {/* Header */}
                <div className="p-6 border-b bg-gradient-to-r from-blue-600 to-purple-600">
                  <h2 className="text-2xl font-bold text-white">
                    {editingRule ? "Modifier la Règle" : "Nouvelle Règle de Commission"}
                  </h2>
                  <p className="text-blue-100 text-sm mt-1">
                    Définissez les paramètres de la commission
                  </p>
                </div>

                {/* Body */}
                <div className="p-6 space-y-4 overflow-y-auto flex-grow">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Type d'action
                    </label>
                    <select
                      name="action"
                      value={formData.action || ""}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    >
                      {Object.entries(groupedActions).map(([category, actions]) => (
                        <optgroup key={category} label={category}>
                          {actions.map((action) => (
                            <option key={action.value} value={action.value}>
                              {action.icon} {action.label}
                            </option>
                          ))}
                        </optgroup>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Type de calcul
                      </label>
                      <select
                        name="type"
                        value={formData.type || "percentage"}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        required
                      >
                        <option value="percentage">Pourcentage (%)</option>
                        <option value="fixed">Montant fixe (DZD)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Valeur
                      </label>
                      <input
                        type="number"
                        name="value"
                        value={formData.value || 0}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        required
                        step="0.01"
                        min="0"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Montant min (DZD)
                      </label>
                      <input
                        type="number"
                        name="minAmount"
                        value={formData.minAmount || ""}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Optionnel"
                        min="0"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Montant max (DZD)
                      </label>
                      <input
                        type="number"
                        name="maxAmount"
                        value={formData.maxAmount || ""}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Optionnel"
                        min="0"
                      />
                    </div>
                  </div>

                  <div className="flex items-center pt-2">
                    <input
                      id="isActive"
                      name="isActive"
                      type="checkbox"
                      checked={formData.isActive || false}
                      onChange={handleInputChange}
                      className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <label
                      htmlFor="isActive"
                      className="ml-2 block text-sm font-medium text-gray-900"
                    >
                      Activer cette règle immédiatement
                    </label>
                  </div>
                </div>

                {/* Footer */}
                <div className="bg-gray-50 px-6 py-4 flex justify-end gap-3 border-t">
                  <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:shadow-lg transition-all disabled:opacity-50"
                    disabled={isSubmitting}
                  >
                    {isSubmitting
                      ? "Sauvegarde..."
                      : editingRule
                      ? "Mettre à jour"
                      : "Créer"}
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
