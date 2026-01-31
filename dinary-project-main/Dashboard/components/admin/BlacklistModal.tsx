import { useState } from 'react';
import { BlacklistEntry } from '@/types/security';
import { X, Plus } from 'lucide-react';

interface BlacklistModalProps {
  entry?: BlacklistEntry;
  onClose: () => void;
  onSave: (entry: Omit<BlacklistEntry, 'id'>) => void;
}

export default function BlacklistModal({
  entry,
  onClose,
  onSave
}: BlacklistModalProps) {
  const [formData, setFormData] = useState<Omit<BlacklistEntry, 'id'>>({
    type: entry?.type || 'ip',
    value: entry?.value || '',
    reason: entry?.reason || '',
    addedBy: entry?.addedBy || '',
    addedAt: entry?.addedAt || new Date().toISOString(),
    expiresAt: entry?.expiresAt,
    notes: entry?.notes || ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg max-w-lg w-full mx-4">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-800">
            {entry ? 'Modifier une entrée' : 'Ajouter à la liste noire'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Type
            </label>
            <select
              value={formData.type}
              onChange={(e) => setFormData({
                ...formData,
                type: e.target.value as BlacklistEntry['type']
              })}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
            >
              <option value="ip">Adresse IP</option>
              <option value="email">Email</option>
              <option value="phone">Téléphone</option>
              <option value="device">Appareil</option>
              <option value="name">Nom</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Valeur
            </label>
            <input
              type="text"
              value={formData.value}
              onChange={(e) => setFormData({
                ...formData,
                value: e.target.value
              })}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
              placeholder={formData.type === 'ip' ? '192.168.1.1' :
                formData.type === 'email' ? 'example@email.com' :
                formData.type === 'phone' ? '+1234567890' :
                'Entrez la valeur...'}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Raison
            </label>
            <input
              type="text"
              value={formData.reason}
              onChange={(e) => setFormData({
                ...formData,
                reason: e.target.value
              })}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
              placeholder="Raison du blocage..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Date d'expiration (optionnel)
            </label>
            <input
              type="datetime-local"
              value={formData.expiresAt ? new Date(formData.expiresAt).toISOString().slice(0, 16) : ''}
              onChange={(e) => setFormData({
                ...formData,
                expiresAt: e.target.value ? new Date(e.target.value).toISOString() : undefined
              })}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Notes (optionnel)
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({
                ...formData,
                notes: e.target.value
              })}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 h-32"
              placeholder="Notes additionnelles..."
            />
          </div>

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-primary-600 text-white hover:bg-primary-700 rounded-lg flex items-center gap-2"
            >
              <Plus size={16} />
              {entry ? 'Mettre à jour' : 'Ajouter'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
