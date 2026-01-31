'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

// Types pour les transactions
export interface Transaction {
  id: string;
  amount: number;
  type: 'recharge' | 'payment' | 'transfer' | 'refund' | 'bonus';
  status: 'pending' | 'completed' | 'failed';
  description?: string;
  date: number;  // Timestamp
  reference?: string;
  method?: string;
}

// Type pour les recharges administratives
export interface AdminRecharge {
  id: string;
  amount: number;
  status: 'pending' | 'completed' | 'failed';
  date: number;  // Timestamp
  description?: string;
  adminName?: string;
  reference?: string;
}

// Interface pour le contexte de recharge
interface RechargeContextType {
  balance: number;
  transactions: Transaction[];
  pendingAdminRecharges: AdminRecharge[];
  completedAdminRecharges: AdminRecharge[];
  refreshTransactions: () => void;
  simulateAdminRecharge: (amount: number, adminName?: string, description?: string) => void;
}

// Création du contexte
const RechargeContext = createContext<RechargeContextType | undefined>(undefined);

// Données fictives pour les transactions
const mockTransactions: Transaction[] = [
  {
    id: '1',
    amount: 1000,
    type: 'recharge',
    status: 'completed',
    description: 'Recharge via BaridiMob',
    date: Date.now() - 1000 * 60 * 60 * 24 * 2, // 2 jours avant
    reference: 'BARID-123456',
    method: 'baridimob'
  },
  {
    id: '2',
    amount: 500,
    type: 'payment',
    status: 'completed',
    description: 'Paiement à Supermarché ABC',
    date: Date.now() - 1000 * 60 * 60 * 24 * 5, // 5 jours avant
  },
  {
    id: '3',
    amount: 2000,
    type: 'recharge',
    status: 'completed',
    description: 'Recharge via carte CIB',
    date: Date.now() - 1000 * 60 * 60 * 24 * 10, // 10 jours avant
    reference: 'CIB-789012',
    method: 'cib'
  }
];

// Données fictives pour les recharges administratives
const mockAdminRecharges: AdminRecharge[] = [
  {
    id: 'admin-1',
    amount: 3000,
    status: 'completed',
    date: Date.now() - 1000 * 60 * 60 * 24 * 3, // 3 jours avant
    description: 'Remboursement commande #B7890',
    adminName: 'Sarah Admin'
  },
  {
    id: 'admin-2',
    amount: 1500,
    status: 'completed',
    date: Date.now() - 1000 * 60 * 60 * 24 * 15, // 15 jours avant
    description: 'Bonus de parrainage',
    adminName: 'Karim Support'
  }
];

// Hook personnalisé pour utiliser le contexte de recharge
export const useRecharge = () => {
  const context = useContext(RechargeContext);
  if (context === undefined) {
    throw new Error('useRecharge doit être utilisé à l\'intérieur d\'un RechargeProvider');
  }
  return context;
};

// Fournisseur du contexte
export const RechargeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // États
  const [balance, setBalance] = useState<number>(4500); // Solde initial fictif
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [adminRecharges, setAdminRecharges] = useState<AdminRecharge[]>([]);

  // Séparer les recharges admin en cours et complétées
  const pendingAdminRecharges = adminRecharges.filter(recharge => recharge.status === 'pending');
  const completedAdminRecharges = adminRecharges.filter(recharge => recharge.status === 'completed');

  // Charger les données au montage du composant
  useEffect(() => {
    // Dans une app réelle, ce serait un appel API
    // Ici on utilise des données fictives
    setTransactions(mockTransactions);
    setAdminRecharges(mockAdminRecharges);
    
    // Charger depuis le localStorage si disponible
    const storedBalance = localStorage.getItem('dinary_balance');
    if (storedBalance) {
      setBalance(parseFloat(storedBalance));
    }
    
    const storedTransactions = localStorage.getItem('dinary_transactions');
    if (storedTransactions) {
      try {
        setTransactions(JSON.parse(storedTransactions));
      } catch (error) {
        
      }
    }
    
    const storedAdminRecharges = localStorage.getItem('dinary_admin_recharges');
    if (storedAdminRecharges) {
      try {
        setAdminRecharges(JSON.parse(storedAdminRecharges));
      } catch (error) {
        
      }
    }
  }, []);

  // Sauvegarder les données quand elles changent
  useEffect(() => {
    localStorage.setItem('dinary_balance', balance.toString());
  }, [balance]);
  
  useEffect(() => {
    localStorage.setItem('dinary_transactions', JSON.stringify(transactions));
  }, [transactions]);
  
  useEffect(() => {
    localStorage.setItem('dinary_admin_recharges', JSON.stringify(adminRecharges));
  }, [adminRecharges]);

  // Simuler une recharge administrative
  const simulateAdminRecharge = (amount: number, adminName?: string, description?: string) => {
    const newRecharge: AdminRecharge = {
      id: `admin-${Date.now()}`,
      amount,
      status: 'pending',
      date: Date.now(),
      description: description || 'Recharge administrative',
      adminName: adminName || 'Administrateur'
    };
    
    // Ajouter la nouvelle recharge
    setAdminRecharges(prev => [newRecharge, ...prev]);
    
    // Simuler la confirmation après un délai
    setTimeout(() => {
      setAdminRecharges(prev => 
        prev.map(r => 
          r.id === newRecharge.id ? { ...r, status: 'completed' } : r
        )
      );
      
      // Mettre à jour le solde
      setBalance(prev => prev + amount);
      
      // Ajouter à l'historique des transactions
      const newTransaction: Transaction = {
        id: `trans-${Date.now()}`,
        amount,
        type: 'recharge',
        status: 'completed',
        description: `Recharge administrative: ${description || ''}`,
        date: Date.now(),
        reference: newRecharge.id
      };
      
      setTransactions(prev => [newTransaction, ...prev]);
      
    }, 15000); // Compléter après 15 secondes
  };

  // Rafraîchir les transactions (simule un appel API)
  const refreshTransactions = () => {
    // Dans une app réelle, ce serait un appel API
    
    
    // Vérifier les recharges en attente et les compléter automatiquement si elles sont "mûres"
    setAdminRecharges(prev => 
      prev.map(recharge => {
        // Compléter les recharges en attente après 15 secondes
        if (recharge.status === 'pending' && Date.now() - recharge.date > 15000) {
          // Mettre à jour le solde
          setBalance(balance => balance + recharge.amount);
          
          // Ajouter à l'historique des transactions
          const newTransaction: Transaction = {
            id: `trans-${Date.now()}-${recharge.id}`,
            amount: recharge.amount,
            type: 'recharge',
            status: 'completed',
            description: `Recharge administrative: ${recharge.description || ''}`,
            date: Date.now(),
            reference: recharge.id
          };
          
          setTransactions(prev => [newTransaction, ...prev]);
          
          return { ...recharge, status: 'completed' };
        }
        return recharge;
      })
    );
  };

  // Valeur du contexte
  const value = {
    balance,
    transactions,
    pendingAdminRecharges,
    completedAdminRecharges,
    refreshTransactions,
    simulateAdminRecharge
  };

  return (
    <RechargeContext.Provider value={value}>
      {children}
    </RechargeContext.Provider>
  );
};t.Provider>
  );
};