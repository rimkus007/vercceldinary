// Utilities pour le calcul des revenus et commissions

// Cette fonction calcule les commissions sur les transactions
export function calculateCommissions(transaction: {
  type: 'payment' | 'withdrawal' | 'transfer';
  amount: number;
}) {
  let commission = 0;
  
  switch (transaction.type) {
    case 'payment':
      // 1.5% de commission sur chaque paiement en magasin
      commission = transaction.amount * 0.015;
      break;
    case 'withdrawal':
      // 1% de commission sur chaque retrait commerçant
      commission = transaction.amount * 0.01;
      break;
    case 'transfer':
      // 5 DZD pour chaque virement instantané
      commission = 5;
      break;
    default:
      commission = 0;
  }
  
  return commission;
}

// Fonction pour suivre le solde du compte BaridiMob
export function updateBaridiMobBalance(
  currentBalance: number,
  transactions: Array<{
    type: 'recharge' | 'withdrawal';
    amount: number;
  }>
) {
  let newBalance = currentBalance;
  
  transactions.forEach(transaction => {
    if (transaction.type === 'recharge') {
      // Entrée : recharge client
      newBalance += transaction.amount;
    } else if (transaction.type === 'withdrawal') {
      // Sortie : retrait commerçant
      newBalance -= transaction.amount;
    }
  });
  
  return newBalance;
}
