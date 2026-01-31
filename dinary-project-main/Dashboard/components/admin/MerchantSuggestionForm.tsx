'use client';

import { useState } from 'react';
import { X } from 'lucide-react';
import { Merchant } from '@/types/merchant';

interface SuggestedMerchant {
  name: string;
  address: string;
  category: string;
  contactName?: string;
  contactPhone?: string;
  location: {
    lat: number;
    lng: number;
  };
  suggestedBy: {
    id: string;
    name: string;
    phone: string;
  };
  suggestedAt: string;
  status: 'pending' | 'approved' | 'rejected';
}

interface MerchantSuggestionFormProps {
  suggestion: SuggestedMerchant;
  onClose: () => void;
  onApprove: (merchant: Merchant) => void;
  onReject: (id: string) => void;
}

export default function MerchantSuggestionForm({
  suggestion,
  onClose,
  onApprove,
  onReject
}: MerchantSuggestionFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleApprove = async () => {
    setIsSubmitting(true);
    try {
      const newMerchant: Merchant = {
        id: crypto.randomUUID(),
        name: suggestion.name,
        category: suggestion.category,
        rating: 0,
        location: suggestion.location,
        address: suggestion.address,
        status: 'active',
        tags: [],
        services: []
      };
      
      await onApprove(newMerchant);
      onClose();
    } catch (error) {
      /* log removed */
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReject = async () => {
    setIsSubmitting(true);
    try {
      await onReject(suggestion.suggestedBy.id);
      onClose();
    } catch (error) {
      /* log removed */
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg max-w-lg w-full mx-4">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold">Suggestion de commerçant</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {/* Informations du commerçant */}
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-4">
            <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
              🏪 Informations du commerce suggéré
            </h3>
            <div className="space-y-2 text-sm">
              <p className="flex items-start gap-2">
                <span className="font-medium text-gray-600 min-w-[100px]">Nom :</span>
                <span className="font-semibold text-gray-900">{suggestion.name}</span>
              </p>
              <p className="flex items-start gap-2">
                <span className="font-medium text-gray-600 min-w-[100px]">Adresse :</span>
                <span className="text-gray-800">{suggestion.address}</span>
              </p>
              <p className="flex items-start gap-2">
                <span className="font-medium text-gray-600 min-w-[100px]">Catégorie :</span>
                <span className="text-gray-800 capitalize">{suggestion.category}</span>
              </p>
              {suggestion.contactName && (
                <p className="flex items-start gap-2">
                  <span className="font-medium text-gray-600 min-w-[100px]">Contact :</span>
                  <span className="text-gray-800 font-medium">{suggestion.contactName}</span>
                </p>
              )}
              {suggestion.contactPhone && (
                <p className="flex items-start gap-2">
                  <span className="font-medium text-gray-600 min-w-[100px]">Téléphone :</span>
                  <span className="text-gray-800 font-medium">{suggestion.contactPhone}</span>
                </p>
              )}
              <p className="flex items-start gap-2">
                <span className="font-medium text-gray-600 min-w-[100px]">Coordonnées :</span>
                <span className="text-gray-700 font-mono text-xs">{suggestion.location.lat.toFixed(6)}, {suggestion.location.lng.toFixed(6)}</span>
              </p>
            </div>
          </div>

          {/* Informations du suggéreur */}
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-xl p-4">
            <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
              👤 Suggéré par
            </h3>
            <div className="space-y-2 text-sm">
              <p className="flex items-start gap-2">
                <span className="font-medium text-gray-600 min-w-[100px]">Nom :</span>
                <span className="font-semibold text-gray-900">{suggestion.suggestedBy.name}</span>
              </p>
              <p className="flex items-start gap-2">
                <span className="font-medium text-gray-600 min-w-[100px]">Téléphone :</span>
                <span className="text-gray-800">{suggestion.suggestedBy.phone}</span>
              </p>
              <p className="flex items-start gap-2">
                <span className="font-medium text-gray-600 min-w-[100px]">Date :</span>
                <span className="text-gray-800">{new Date(suggestion.suggestedAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
              </p>
            </div>
          </div>

          {/* Aperçu sur la carte */}
          <div>
            <h3 className="font-medium text-gray-700 mb-2">Aperçu sur la carte</h3>
            <div className="h-48 bg-gray-100 rounded-lg">
              <iframe
                className="w-full h-full rounded-lg"
                frameBorder="0"
                src={`https://www.openstreetmap.org/export/embed.html?bbox=${suggestion.location.lng - 0.01},${suggestion.location.lat - 0.01},${suggestion.location.lng + 0.01},${suggestion.location.lat + 0.01}&layer=mapnik&marker=${suggestion.location.lat},${suggestion.location.lng}`}
              />
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 p-4 bg-gray-50 rounded-b-lg">
          <button
            onClick={handleReject}
            disabled={isSubmitting}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Rejeter
          </button>
          <button
            onClick={handleApprove}
            disabled={isSubmitting}
            className="px-4 py-2 text-sm font-medium text-white bg-dinary-turquoise rounded-md hover:bg-dinary-turquoise-dark"
          >
            Approuver
          </button>
        </div>
      </div>
    </div>
  );
}
