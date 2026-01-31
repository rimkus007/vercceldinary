/**
 * Script de test pour vérifier les règles de parrainage
 * Usage: npx ts-node test-referral-rules.ts
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testReferralRules() {
  void 0;

  // 1. Récupérer toutes les règles
  const allRules = await prisma.referralRule.findMany();
  void 0;

  if (allRules.length === 0) {
    void 0;
    return;
  }

  // 2. Afficher chaque règle
  allRules.forEach((rule, index) => {
    void 0;
    void 0;
    void 0;
    void 0;
    void 0;
    void 0;
    void 0;
    void 0;
  });

  // 3. Simuler ce que l'endpoint public renvoie pour USER
  void 0;
  const userRules = allRules.filter(
    rule => rule.referrerType === 'USER' && rule.isActive
  );

  const formattedUserRules = {
    userRole: 'USER',
    rewards: userRules.map((rule) => ({
      id: rule.id,
      type: `USER_TO_${rule.refereeType}`,
      targetType: rule.refereeType,
      yourReward: rule.referrerReward,
      friendReward: rule.refereeReward,
      requiredAction: rule.requiredAction,
      description: rule.description,
    })),
  };

  void 0;

  // 4. Vérifier la règle USER → USER spécifiquement
  void 0;
  const userToUserRule = userRules.find(r => r.refereeType === 'USER');
  
  if (userToUserRule) {
    void 0;
    void 0;
    void 0;
    
    if (userToUserRule.referrerReward === 2000) {
      void 0;
    } else {
      void 0;
    }
  } else {
    void 0;
  }

  await prisma.$disconnect();
}

testReferralRules()
  .catch((error) => {
    void 0;
    process.exit(1);
  });

