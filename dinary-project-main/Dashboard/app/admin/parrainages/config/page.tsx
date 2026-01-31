"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Settings, 
  Save, 
  RefreshCw, 
  Users, 
  Store,
  Zap,
  TrendingUp,
  ShoppingCart,
  UserPlus,
  CheckCircle,
  AlertCircle,
  Edit3,
  X
} from "lucide-react";

interface ReferralRule {
  id: string;
  referrerType: 'USER' | 'MERCHANT';
  refereeType: 'USER' | 'MERCHANT';
  requiredAction: 'FIRST_TRANSACTION' | 'FIRST_RECHARGE' | 'FIRST_SALE' | 'ACCOUNT_CREATED';
  referrerReward: number;
  refereeReward: number;
  isActive: boolean;
  description: string;
  createdAt: string;
  updatedAt: string;
}

export default function ReferralConfigPage() {
  const { token } = useAuth();
  const [rules, setRules] = useState<ReferralRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState<string | null>(null);
  const [initialized, setInitialized] = useState(false);
  
  // État pour le modal d'édition
  const [editingRule, setEditingRule] = useState<ReferralRule | null>(null);
  const [editedValues, setEditedValues] = useState<Partial<ReferralRule>>({});

  const fetchRules = async () => {
    if (!token) return;
    setLoading(true);
    setError(null);

    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
      const response = await fetch(`${baseUrl}/admin/referral-rules`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        throw new Error('Impossible de récupérer les règles');
      }

      const data = await response.json();
      setRules(data);
      setInitialized(data.length > 0);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const initializeRules = async () => {
    if (!token) return;
    setSaving('init');

    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
      const response = await fetch(`${baseUrl}/admin/referral-rules/initialize`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        throw new Error('Impossible d\'initialiser les règles');
      }

      await fetchRules();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(null);
    }
  };

  const openEditModal = (rule: ReferralRule) => {
    setEditingRule(rule);
    setEditedValues({
      requiredAction: rule.requiredAction,
      referrerReward: rule.referrerReward,
      refereeReward: rule.refereeReward,
      isActive: rule.isActive,
    });
  };

  const closeEditModal = () => {
    setEditingRule(null);
    setEditedValues({});
  };

  const updateRule = async (ruleId: string, updates: Partial<ReferralRule>) => {
    if (!token) return;
    setSaving(ruleId);

    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
      const response = await fetch(`${baseUrl}/admin/referral-rules/${ruleId}`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      });

      if (!response.ok) {
        throw new Error('Impossible de mettre à jour la règle');
      }

      await fetchRules();
      closeEditModal();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(null);
    }
  };

  const handleSaveChanges = () => {
    if (editingRule) {
      updateRule(editingRule.id, editedValues);
    }
  };

  useEffect(() => {
    fetchRules();
  }, [token]);

  const getRuleIcon = (referrerType: string, refereeType: string) => {
    if (referrerType === 'USER' && refereeType === 'USER') {
      return <Users className="h-6 w-6" />;
    }
    if (referrerType === 'USER' && refereeType === 'MERCHANT') {
      return <Store className="h-6 w-6" />;
    }
    if (referrerType === 'MERCHANT' && refereeType === 'USER') {
      return <UserPlus className="h-6 w-6" />;
    }
    return <ShoppingCart className="h-6 w-6" />;
  };

  const getActionLabel = (action: string) => {
    switch (action) {
      case 'FIRST_TRANSACTION':
        return 'Première transaction';
      case 'FIRST_RECHARGE':
        return 'Première recharge';
      case 'FIRST_SALE':
        return 'Première vente';
      case 'ACCOUNT_CREATED':
        return 'Création du compte';
      default:
        return action;
    }
  };

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'FIRST_TRANSACTION':
        return <TrendingUp className="h-4 w-4" />;
      case 'FIRST_RECHARGE':
        return <Zap className="h-4 w-4" />;
      case 'FIRST_SALE':
        return <ShoppingCart className="h-4 w-4" />;
      case 'ACCOUNT_CREATED':
        return <UserPlus className="h-4 w-4" />;
      default:
        return <CheckCircle className="h-4 w-4" />;
    }
  };

  const getRuleColor = (referrerType: string, refereeType: string) => {
    if (referrerType === 'USER' && refereeType === 'USER') {
      return 'bg-blue-100 text-blue-600';
    }
    if (referrerType === 'USER' && refereeType === 'MERCHANT') {
      return 'bg-purple-100 text-purple-600';
    }
    if (referrerType === 'MERCHANT' && refereeType === 'USER') {
      return 'bg-green-100 text-green-600';
    }
    return 'bg-orange-100 text-orange-600';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-dinary-turquoise"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              ⚙️ Configuration des Parrainages
            </h1>
            <p className="text-gray-600 mt-1">
              Configurez les récompenses et conditions pour chaque type de parrainage
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={fetchRules}
              variant="outline"
              className="flex items-center gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Actualiser
            </Button>
            {!initialized && (
              <Button
                onClick={initializeRules}
                disabled={saving === 'init'}
                className="flex items-center gap-2 bg-dinary-turquoise text-white hover:bg-opacity-90"
              >
                {saving === 'init' ? (
                  <RefreshCw className="h-4 w-4 animate-spin" />
                ) : (
                  <Settings className="h-4 w-4" />
                )}
                Initialiser les Règles
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="p-6">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6 flex items-center gap-2">
            <AlertCircle className="h-5 w-5" />
            <p>{error}</p>
          </div>
        )}

        {!initialized && rules.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <Settings className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Aucune règle configurée
              </h3>
              <p className="text-gray-600 mb-6">
                Initialisez les règles par défaut pour commencer à configurer votre système de parrainage
              </p>
              <Button
                onClick={initializeRules}
                disabled={saving === 'init'}
                className="bg-dinary-turquoise text-white hover:bg-opacity-90"
              >
                {saving === 'init' ? (
                  <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <Settings className="h-4 w-4 mr-2" />
                )}
                Initialiser les Règles par Défaut
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {rules.map((rule) => (
              <Card key={rule.id} className="hover:shadow-lg transition-shadow">
                <CardHeader className={`${getRuleColor(rule.referrerType, rule.refereeType)} rounded-t-lg`}>
                  <div className="flex items-center gap-3">
                    {getRuleIcon(rule.referrerType, rule.refereeType)}
                    <div>
                      <CardTitle className="text-lg">
                        {rule.referrerType === 'USER' ? 'Client' : 'Marchand'} → {rule.refereeType === 'USER' ? 'Client' : 'Marchand'}
                      </CardTitle>
                      <p className="text-sm opacity-90 mt-1">{rule.description}</p>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="p-6 space-y-4">
                  {/* Affichage en lecture seule */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-500 mb-1">
                        Action Requise
                      </label>
                      <div className="flex items-center gap-2">
                        {getActionIcon(rule.requiredAction)}
                        <span className="font-medium">{getActionLabel(rule.requiredAction)}</span>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-500 mb-1">
                        Statut
                      </label>
                      <Badge variant={rule.isActive ? "default" : "outline"}>
                        {rule.isActive ? 'Actif' : 'Inactif'}
                      </Badge>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-500 mb-1">
                        Récompense Parrain
                      </label>
                      <p className="text-2xl font-bold text-dinary-turquoise">{rule.referrerReward} DA</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-500 mb-1">
                        Récompense Filleul
                      </label>
                      <p className="text-2xl font-bold text-dinary-turquoise">{rule.refereeReward} DA</p>
                    </div>
                  </div>

                  {/* Résumé */}
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-700">
                      <strong>Résumé :</strong> Quand un {rule.refereeType === 'USER' ? 'client' : 'marchand'} parrainé effectue sa{' '}
                      <strong>{getActionLabel(rule.requiredAction).toLowerCase()}</strong>, le parrain reçoit{' '}
                      <strong className="text-dinary-turquoise">{rule.referrerReward} DA</strong>
                      {rule.refereeReward > 0 && (
                        <> et le filleul reçoit <strong className="text-dinary-turquoise">{rule.refereeReward} DA</strong></>
                      )}.
                    </p>
                  </div>

                  {/* Bouton Modifier */}
                  <Button
                    onClick={() => openEditModal(rule)}
                    className="w-full bg-dinary-turquoise text-white hover:bg-opacity-90 flex items-center justify-center gap-2"
                  >
                    <Edit3 className="h-4 w-4" />
                    Modifier cette règle
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Légende */}
        {rules.length > 0 && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>💡 Comment ça fonctionne ?</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <h4 className="font-semibold mb-2">📊 Types de Parrainage</h4>
                  <ul className="space-y-1 text-gray-600">
                    <li>• <strong>Client → Client</strong> : Un client parraine un autre client</li>
                    <li>• <strong>Client → Marchand</strong> : Un client parraine un marchand</li>
                    <li>• <strong>Marchand → Client</strong> : Un marchand parraine un client</li>
                    <li>• <strong>Marchand → Marchand</strong> : Un marchand parraine un autre marchand</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">⚡ Actions Requises</h4>
                  <ul className="space-y-1 text-gray-600">
                    <li>• <strong>Première transaction</strong> : Le filleul envoie de l'argent</li>
                    <li>• <strong>Première recharge</strong> : Le filleul recharge son compte</li>
                    <li>• <strong>Première vente</strong> : Le marchand réalise sa première vente</li>
                    <li>• <strong>Création du compte</strong> : Dès l'inscription (instantané)</li>
                  </ul>
                </div>
              </div>
              <div className="mt-4 p-4 bg-dinary-turquoise bg-opacity-10 rounded-lg">
                <p className="text-sm text-gray-700">
                  <strong>✨ Automatique :</strong> Une fois configurées, les récompenses sont distribuées automatiquement 
                  quand les conditions sont remplies. Vous n'avez plus besoin d'intervenir manuellement !
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Modal d'édition */}
        {editingRule && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              {/* Header du modal */}
              <div className={`${getRuleColor(editingRule.referrerType, editingRule.refereeType)} p-6 flex items-center justify-between rounded-t-lg`}>
                <div className="flex items-center gap-3">
                  {getRuleIcon(editingRule.referrerType, editingRule.refereeType)}
                  <div>
                    <h2 className="text-xl font-bold">
                      Modifier : {editingRule.referrerType === 'USER' ? 'Client' : 'Marchand'} → {editingRule.refereeType === 'USER' ? 'Client' : 'Marchand'}
                    </h2>
                    <p className="text-sm opacity-90 mt-1">{editingRule.description}</p>
                  </div>
                </div>
                <button
                  onClick={closeEditModal}
                  className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Contenu du modal */}
              <div className="p-6 space-y-6">
                {/* Action Requise */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Action Requise
                  </label>
                  <select
                    value={editedValues.requiredAction || editingRule.requiredAction}
                    onChange={(e) => setEditedValues({...editedValues, requiredAction: e.target.value as any})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-dinary-turquoise focus:border-transparent"
                  >
                    <option value="FIRST_TRANSACTION">Première transaction</option>
                    <option value="FIRST_RECHARGE">Première recharge</option>
                    <option value="FIRST_SALE">Première vente</option>
                    <option value="ACCOUNT_CREATED">Création du compte</option>
                  </select>
                  <div className="flex items-center gap-2 mt-2 text-sm text-gray-600">
                    {getActionIcon(editedValues.requiredAction || editingRule.requiredAction)}
                    <span>{getActionLabel(editedValues.requiredAction || editingRule.requiredAction)}</span>
                  </div>
                </div>

                {/* Récompense Parrain */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Récompense pour le Parrain
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      value={editedValues.referrerReward ?? editingRule.referrerReward}
                      onChange={(e) => setEditedValues({...editedValues, referrerReward: parseFloat(e.target.value)})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-dinary-turquoise focus:border-transparent"
                      min="0"
                      step="50"
                    />
                    <span className="absolute right-3 top-2 text-gray-500">DA</span>
                  </div>
                </div>

                {/* Récompense Filleul */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Récompense pour le Filleul
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      value={editedValues.refereeReward ?? editingRule.refereeReward}
                      onChange={(e) => setEditedValues({...editedValues, refereeReward: parseFloat(e.target.value)})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-dinary-turquoise focus:border-transparent"
                      min="0"
                      step="50"
                    />
                    <span className="absolute right-3 top-2 text-gray-500">DA</span>
                  </div>
                </div>

                {/* Statut actif/inactif */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Statut de la règle
                  </label>
                  <div className="flex items-center gap-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        checked={editedValues.isActive ?? editingRule.isActive}
                        onChange={() => setEditedValues({...editedValues, isActive: true})}
                        className="w-4 h-4 text-dinary-turquoise"
                      />
                      <span>Active</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        checked={!(editedValues.isActive ?? editingRule.isActive)}
                        onChange={() => setEditedValues({...editedValues, isActive: false})}
                        className="w-4 h-4 text-gray-400"
                      />
                      <span>Inactive</span>
                    </label>
                  </div>
                </div>

                {/* Résumé avec les nouvelles valeurs */}
                <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
                  <p className="text-sm font-medium text-blue-900 mb-2">
                    📋 Aperçu de la nouvelle règle :
                  </p>
                  <p className="text-sm text-blue-800">
                    Quand un {editingRule.refereeType === 'USER' ? 'client' : 'marchand'} parrainé effectue sa{' '}
                    <strong>{getActionLabel(editedValues.requiredAction || editingRule.requiredAction).toLowerCase()}</strong>, le parrain reçoit{' '}
                    <strong className="text-dinary-turquoise">{editedValues.referrerReward ?? editingRule.referrerReward} DA</strong>
                    {(editedValues.refereeReward ?? editingRule.refereeReward) > 0 && (
                      <> et le filleul reçoit <strong className="text-dinary-turquoise">{editedValues.refereeReward ?? editingRule.refereeReward} DA</strong></>
                    )}.
                  </p>
                </div>

                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded flex items-center gap-2">
                    <AlertCircle className="h-5 w-5" />
                    <p>{error}</p>
                  </div>
                )}
              </div>

              {/* Footer du modal */}
              <div className="border-t border-gray-200 p-6 flex items-center justify-end gap-3">
                <Button
                  onClick={closeEditModal}
                  variant="outline"
                  disabled={saving === editingRule.id}
                >
                  Annuler
                </Button>
                <Button
                  onClick={handleSaveChanges}
                  disabled={saving === editingRule.id}
                  className="bg-dinary-turquoise text-white hover:bg-opacity-90 flex items-center gap-2"
                >
                  {saving === editingRule.id ? (
                    <>
                      <RefreshCw className="h-4 w-4 animate-spin" />
                      Enregistrement...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4" />
                      Valider la modification
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

