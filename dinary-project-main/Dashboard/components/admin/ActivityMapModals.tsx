"use client";

import React, { useState } from 'react';
import { X, Download } from 'lucide-react';

// ===== Modal de Filtre =====
interface FilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyFilters: (filters: any) => void;
}

export function FilterModal({ isOpen, onClose, onApplyFilters }: FilterModalProps) {
  const [minUsers, setMinUsers] = useState('');
  const [minTransactions, setMinTransactions] = useState('');
  const [minRevenue, setMinRevenue] = useState('');
  const [activityLevel, setActivityLevel] = useState('all');

  if (!isOpen) return null;

  const handleApply = () => {
    const filters = {
      minUsers: minUsers ? parseInt(minUsers) : undefined,
      minTransactions: minTransactions ? parseInt(minTransactions) : undefined,
      minRevenue: minRevenue ? parseInt(minRevenue) : undefined,
      activityLevel: activityLevel !== 'all' ? activityLevel : undefined,
    };
    onApplyFilters(filters);
    onClose();
  };

  const handleReset = () => {
    setMinUsers('');
    setMinTransactions('');
    setMinRevenue('');
    setActivityLevel('all');
    onApplyFilters({});
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/50" onClick={onClose} />
      <div className="relative z-50 bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        <div className="px-6 py-4 border-b flex items-center justify-between">
          <h2 className="text-xl font-semibold">Filtres</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Utilisateurs minimum
            </label>
            <input
              type="number"
              value={minUsers}
              onChange={(e) => setMinUsers(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-dinary-turquoise focus:border-transparent"
              placeholder="Ex: 1000"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Transactions minimum
            </label>
            <input
              type="number"
              value={minTransactions}
              onChange={(e) => setMinTransactions(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-dinary-turquoise focus:border-transparent"
              placeholder="Ex: 5000"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Revenus minimum (DZD)
            </label>
            <input
              type="number"
              value={minRevenue}
              onChange={(e) => setMinRevenue(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-dinary-turquoise focus:border-transparent"
              placeholder="Ex: 100000"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Niveau d'activité
            </label>
            <select
              value={activityLevel}
              onChange={(e) => setActivityLevel(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-dinary-turquoise focus:border-transparent"
            >
              <option value="all">Tous</option>
              <option value="high">Élevé</option>
              <option value="medium">Moyen</option>
              <option value="low">Faible</option>
            </select>
          </div>
        </div>

        <div className="px-6 py-4 border-t flex gap-3">
          <button
            onClick={handleReset}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Réinitialiser
          </button>
          <button
            onClick={handleApply}
            className="flex-1 px-4 py-2 bg-dinary-turquoise text-white rounded-lg hover:bg-opacity-90 transition-colors"
          >
            Appliquer
          </button>
        </div>
      </div>
    </div>
  );
}

// ===== Modal d'Export =====
interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onExport: (format: 'csv' | 'pdf') => void;
}

export function ExportModal({ isOpen, onClose, onExport }: ExportModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/50" onClick={onClose} />
      <div className="relative z-50 bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        <div className="px-6 py-4 border-b flex items-center justify-between">
          <h2 className="text-xl font-semibold">Exporter les données</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6">
          <p className="text-gray-600 mb-6">
            Choisissez le format d'export pour télécharger les données de la carte d'activité.
          </p>

          <div className="space-y-3">
            <button
              onClick={() => {
                onExport('csv');
                onClose();
              }}
              className="w-full flex items-center justify-between px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <Download className="h-5 w-5 text-green-600" />
                <div className="text-left">
                  <div className="font-medium">Export CSV</div>
                  <div className="text-sm text-gray-500">Fichier Excel (.csv)</div>
                </div>
              </div>
              <span className="text-gray-400">→</span>
            </button>

            <button
              onClick={() => {
                onExport('pdf');
                onClose();
              }}
              className="w-full flex items-center justify-between px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <Download className="h-5 w-5 text-red-600" />
                <div className="text-left">
                  <div className="font-medium">Export PDF</div>
                  <div className="text-sm text-gray-500">Document PDF (.pdf)</div>
                </div>
              </div>
              <span className="text-gray-400">→</span>
            </button>
          </div>
        </div>

        <div className="px-6 py-4 border-t">
          <button
            onClick={onClose}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Annuler
          </button>
        </div>
      </div>
    </div>
  );
}

