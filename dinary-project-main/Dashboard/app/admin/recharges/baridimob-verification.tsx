'use client';

import { useState } from 'react';
import { CheckCircle, AlertCircle, InfoIcon } from 'lucide-react';

interface BaridimobVerificationProps {
  baridimobReference?: string;
  transactionDate?: string;
  onUpdate: (data: { baridimobReference?: string; transactionDate?: string }) => void;
}

export default function BaridimobVerification({ 
  baridimobReference, 
  transactionDate, 
  onUpdate 
}: BaridimobVerificationProps) {
  const [referenceValid, setReferenceValid] = useState<boolean | null>(null);

  // Fonction fictive pour simuler une vérification de référence
  const checkReference = (ref: string) => {
    // Dans une vraie implémentation, ceci ferait un appel API
    // pour vérifier la validité de la référence
    return ref && ref.startsWith('BRDM-');
  };

  const handleReferenceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newRef = e.target.value;
    onUpdate({ baridimobReference: newRef });
    if (newRef) {
      setReferenceValid(checkReference(newRef));
    } else {
      setReferenceValid(null);
    }
  };

  return (
    <div className="mt-3 border-t pt-3">
      <div className="bg-blue-50 p-3 rounded-md border border-blue-100 mb-3">
        <h4 className="text-sm font-semibold text-blue-700 flex items-center mb-2">
          <InfoIcon className="w-4 h-4 mr-1" />
          Vérification BaridiMob requise
        </h4>
        <p className="text-sm text-blue-600">
          L'utilisateur a effectué un virement via BaridiMob. Veuillez vérifier:
          <ul className="list-disc pl-5 mt-1">
            <li>La référence du virement correspond à celle fournie par l'utilisateur</li>
            <li>Le montant du virement correspond au montant de la recharge</li>
            <li>Le virement a bien été reçu dans votre compte BaridiMob</li>
          </ul>
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Référence BaridiMob
          </label>
          <div className="relative">
            <input
              type="text"
              className={`w-full py-2 px-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-dinary-turquoise ${
                referenceValid === true ? 'border-green-300' : 
                referenceValid === false ? 'border-red-300' : ''
              }`}
              value={baridimobReference || ''}
              placeholder="Ex: BRDM-12345678"
              onChange={handleReferenceChange}
            />
            {referenceValid === true ? (
              <CheckCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-green-500" />
            ) : referenceValid === false ? (
              <AlertCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-red-500" />
            ) : baridimobReference ? (
              <AlertCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-yellow-500" />
            ) : null}
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Format attendu: BRDM-XXXXXXXX
          </p>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Date de transaction
          </label>
          <input
            type="datetime-local"
            className="w-full py-2 px-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-dinary-turquoise"
            value={transactionDate ? transactionDate.slice(0, 16) : ''}
            onChange={(e) => onUpdate({ transactionDate: e.target.value })}
          />
        </div>
      </div>
    </div>
  );
}
