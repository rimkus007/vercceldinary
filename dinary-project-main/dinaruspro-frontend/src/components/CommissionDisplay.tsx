import React, { useEffect, useState } from 'react';
import { Info } from 'lucide-react';
import { calculateCommission, fetchCommissionRules, getCommissionDetails } from '@/lib/commissions';
import { useAuth } from '@/context/AuthContext';

interface CommissionDisplayProps {
  action: string;
  amount: number;
  onCommissionCalculated?: (commission: number, total: number) => void;
}

export function CommissionDisplay({ action, amount, onCommissionCalculated }: CommissionDisplayProps) {
  const { token } = useAuth();
  const [commission, setCommission] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadAndCalculate() {
      if (!token || !amount || amount <= 0) {
        setCommission(0);
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        await fetchCommissionRules(token, 'MERCHANT');
        const details = getCommissionDetails(action, amount);
        void 0;
        setCommission(details.commission);
        
        if (onCommissionCalculated) {
          onCommissionCalculated(details.commission, details.total);
        }
      } catch (error) {
        void 0;
        setCommission(0);
      } finally {
        setIsLoading(false);
      }
    }

    loadAndCalculate();
  }, [action, amount, token, onCommissionCalculated]);

  if (isLoading) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mt-4">
        <div className="flex items-center gap-2">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
          <span className="text-sm text-gray-600">Calcul de la commission...</span>
        </div>
      </div>
    );
  }

  // Toujours afficher, même si commission = 0
  if (commission === 0) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-lg p-4 mt-4">
        <div className="flex items-start gap-2">
          <Info className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-medium text-green-900 mb-1">
              Aucuns frais de transaction
            </p>
            <div className="space-y-1 text-sm text-green-800">
              <div className="flex justify-between">
                <span>Montant :</span>
                <span className="font-medium">{amount.toLocaleString('fr-DZ')} DZD</span>
              </div>
              <div className="flex justify-between">
                <span>Commission :</span>
                <span className="font-medium">0 DZD</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-green-200">
                <span className="font-semibold">Total à débiter :</span>
                <span className="font-bold text-green-900">{amount.toLocaleString('fr-DZ')} DZD</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const total = amount + commission;

  return (
    <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 mt-4">
      <div className="flex items-start gap-2">
        <Info className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          <p className="text-sm font-medium text-purple-900 mb-2">
            Frais de transaction
          </p>
          <div className="space-y-1 text-sm text-purple-800">
            <div className="flex justify-between">
              <span>Montant :</span>
              <span className="font-medium">{amount.toLocaleString('fr-DZ')} DZD</span>
            </div>
            <div className="flex justify-between">
              <span>Commission :</span>
              <span className="font-medium">{commission.toLocaleString('fr-DZ')} DZD</span>
            </div>
            <div className="flex justify-between pt-2 border-t border-purple-200">
              <span className="font-semibold">Total à payer :</span>
              <span className="font-bold text-purple-900">{total.toLocaleString('fr-DZ')} DZD</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

