// Utilitaire pour calculer les commissions côté marchand

interface CommissionRule {
  id: string;
  action: string;
  type: 'fixed' | 'percentage';
  value: number;
  minAmount?: number;
  maxAmount?: number;
  isActive: boolean;
}

let commissionRulesCache: CommissionRule[] = [];
let lastFetchTime = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

/**
 * Récupère les règles de commission depuis le backend
 */
export async function fetchCommissionRules(token: string, target: 'USER' | 'MERCHANT' = 'MERCHANT'): Promise<CommissionRule[]> {
  const now = Date.now();
  
  // Utiliser le cache si disponible et récent
  if (commissionRulesCache.length > 0 && (now - lastFetchTime) < CACHE_DURATION) {
    return commissionRulesCache;
  }

  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/commission-rules?target=${target}`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    if (!response.ok) {
      throw new Error('Impossible de charger les règles de commission');
    }

    const rules = await response.json();
    commissionRulesCache = rules; // Les règles sont déjà filtrées (actives uniquement) côté backend
    lastFetchTime = now;
    
    return commissionRulesCache;
  } catch (error) {
    void 0;
    return [];
  }
}

/**
 * Calcule la commission pour une transaction donnée
 * @param action Type d'action (merchant_payment, merchant_withdrawal, etc.)
 * @param amount Montant de la transaction
 * @param rules Règles de commission (optionnel, sinon utilise le cache)
 * @returns Montant de la commission en DZD
 */
export function calculateCommission(
  action: string,
  amount: number,
  rules?: CommissionRule[]
): number {
  const applicableRules = rules || commissionRulesCache;
  
  // Trouver la règle applicable
  const rule = applicableRules.find(r => 
    r.action === action && 
    r.isActive &&
    (!r.minAmount || amount >= r.minAmount) &&
    (!r.maxAmount || amount <= r.maxAmount)
  );

  if (!rule) return 0;

  // Calculer la commission
  if (rule.type === 'fixed') {
    return rule.value;
  } else if (rule.type === 'percentage') {
    return (amount * rule.value) / 100;
  }

  return 0;
}

/**
 * Formatte un montant avec la commission
 */
export function formatAmountWithCommission(amount: number, commission: number): string {
  const total = amount + commission;
  return `${total.toLocaleString('fr-DZ')} DZD`;
}

/**
 * Retourne le détail de la commission
 */
export function getCommissionDetails(
  action: string,
  amount: number,
  rules?: CommissionRule[]
): { commission: number; total: number; rule?: CommissionRule } {
  const applicableRules = rules || commissionRulesCache;
  
  const rule = applicableRules.find(r => 
    r.action === action && 
    r.isActive &&
    (!r.minAmount || amount >= r.minAmount) &&
    (!r.maxAmount || amount <= r.maxAmount)
  );

  const commission = calculateCommission(action, amount, applicableRules);
  const total = amount + commission;

  return { commission, total, rule };
}

