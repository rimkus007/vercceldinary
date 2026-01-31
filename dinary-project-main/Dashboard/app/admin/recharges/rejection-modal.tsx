'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { AlertTriangle, X } from 'lucide-react';

interface RejectionModalProps {
  onClose: () => void;
  onReject: (reason: string, notes: string) => void;
  isVirement: boolean;
}

export default function RejectionModal({ onClose, onReject, isVirement }: RejectionModalProps) {
  const [reason, setReason] = useState<string>('');
  const [notes, setNotes] = useState<string>('');

  const handleSubmit = () => {
    if (!reason && !confirm('Êtes-vous sûr de vouloir rejeter sans préciser de motif ?')) {
      return;
    }
    onReject(reason, notes);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60]">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-start mb-4">
          <h2 className="text-xl font-bold">Rejeter la demande</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X size={20} />
          </button>
        </div>

        {isVirement && (
          <div className="bg-yellow-50 p-4 rounded-md border border-yellow-200 mb-4">
            <h4 className="text-sm font-semibold text-yellow-700 mb-2 flex items-center">
              <AlertTriangle className="h-4 w-4 mr-1" />
              Motifs courants pour BaridiMob
            </h4>
            <ul className="list-disc pl-5 space-y-1 text-sm text-yellow-700">
              <li>Référence BaridiMob introuvable</li>
              <li>Montant du virement incorrect</li>
              <li>Délai de paiement expiré</li>
              <li>Informations du titulaire de compte invalides</li>
            </ul>
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Motif du rejet
            </label>
            <select
              className="w-full p-2 border rounded-md"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            >
              <option value="">Sélectionnez un motif</option>
              <option value="reference_invalide">Référence BaridiMob invalide ou non trouvée</option>
              <option value="montant_incorrect">Montant du virement incorrect</option>
              <option value="delai_expire">Délai de paiement expiré</option>
              <option value="informations_manquantes">Informations incomplètes</option>
              <option value="autre">Autre raison</option>
            </select>
          </div>

          {reason === 'autre' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Précisez la raison
              </label>
              <textarea
                className="w-full p-2 border rounded-md"
                placeholder="Détails supplémentaires..."
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4">
            <Button
              variant="outline"
              onClick={onClose}
            >
              Annuler
            </Button>
            <Button
              className="bg-red-600 hover:bg-red-700"
              onClick={handleSubmit}
            >
              <X className="mr-2 h-4 w-4" />
              Confirmer le rejet
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
