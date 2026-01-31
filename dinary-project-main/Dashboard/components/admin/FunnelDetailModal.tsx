"use client";

import { X, Users, TrendingDown, TrendingUp } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface FunnelStage {
  stage: string;
  users: number;
  conversionRate: number;
  dropOffRate: number;
  icon: React.ReactNode;
}

interface FunnelDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  stage: FunnelStage | null;
  previousStage?: FunnelStage | null;
  nextStage?: FunnelStage | null;
}

export default function FunnelDetailModal({
  isOpen,
  onClose,
  stage,
  previousStage,
  nextStage,
}: FunnelDetailModalProps) {
  if (!isOpen || !stage) return null;

  const usersLost = previousStage ? previousStage.users - stage.users : 0;
  const lossPercentage = previousStage && previousStage.users > 0
    ? ((usersLost / previousStage.users) * 100).toFixed(1)
    : '0';

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                {stage.icon}
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900">{stage.stage}</h3>
                <p className="text-sm text-gray-500">Détails de l'étape</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Main Stats */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="p-4 bg-blue-50 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Utilisateurs</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {stage.users.toLocaleString()}
                  </p>
                </div>
                <Users className="h-8 w-8 text-blue-600" />
              </div>
            </div>

            <div className="p-4 bg-green-50 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Taux de Conversion</p>
                  <p className="text-2xl font-bold text-green-600">
                    {stage.conversionRate.toFixed(1)}%
                  </p>
                </div>
                <TrendingUp className="h-8 w-8 text-green-600" />
              </div>
            </div>
          </div>

          {/* Conversion Analysis */}
          {previousStage && (
            <div className="mb-6">
              <h4 className="font-medium text-gray-900 mb-3">Analyse de Conversion</h4>
              <div className="space-y-3">
                <div className="p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-600">Étape précédente</span>
                    <Badge variant="outline">{previousStage.stage}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">
                      {previousStage.users.toLocaleString()} utilisateurs
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-center">
                  <TrendingDown className="h-5 w-5 text-red-500" />
                </div>

                <div className="p-4 border border-red-200 bg-red-50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-600">Utilisateurs perdus</span>
                    <Badge className="bg-red-100 text-red-800">
                      {lossPercentage}% d'abandon
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-bold text-red-600">
                      {usersLost.toLocaleString()} utilisateurs
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Drop-off Rate */}
          {stage.dropOffRate > 0 && (
            <div className="mb-6">
              <h4 className="font-medium text-gray-900 mb-3">Taux d'Abandon</h4>
              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600">
                    Pourcentage d'utilisateurs qui abandonnent à cette étape
                  </span>
                  <span className="text-2xl font-bold text-red-600">
                    {stage.dropOffRate.toFixed(1)}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3 mt-3">
                  <div
                    className="bg-red-500 h-3 rounded-full transition-all"
                    style={{ width: `${stage.dropOffRate}%` }}
                  ></div>
                </div>
              </div>
            </div>
          )}

          {/* Next Stage Preview */}
          {nextStage && (
            <div className="mb-6">
              <h4 className="font-medium text-gray-900 mb-3">Prochaine Étape</h4>
              <div className="p-4 border border-gray-200 rounded-lg bg-gradient-to-r from-blue-50 to-transparent">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      {nextStage.icon}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{nextStage.stage}</p>
                      <p className="text-sm text-gray-500">
                        {nextStage.users.toLocaleString()} utilisateurs ({nextStage.conversionRate.toFixed(1)}%)
                      </p>
                    </div>
                  </div>
                  <Badge className="bg-blue-100 text-blue-800">
                    Suivant
                  </Badge>
                </div>
              </div>
            </div>
          )}

          {/* Recommendations */}
          <div className="mb-6">
            <h4 className="font-medium text-gray-900 mb-3">Recommandations</h4>
            <div className="space-y-2">
              {stage.dropOffRate > 30 && (
                <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-sm text-yellow-800">
                    ⚠️ Taux d'abandon élevé ({stage.dropOffRate.toFixed(1)}%) - Optimisez cette étape en priorité
                  </p>
                </div>
              )}
              {stage.conversionRate < 50 && stage.dropOffRate > 0 && (
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-blue-800">
                    💡 Analysez les raisons d'abandon et simplifiez le parcours utilisateur
                  </p>
                </div>
              )}
              {stage.conversionRate >= 80 && (
                <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-sm text-green-800">
                    ✅ Excellente performance ! Continuez sur cette lancée
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end">
            <Button onClick={onClose} className="bg-blue-600 hover:bg-blue-700 text-white">
              Fermer
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}

