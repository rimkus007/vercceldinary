// scripts/backfillStatusAndRoles.ts
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Helper: normalisation sécurisée vers USER/MERCHANT
function normalizeAudienceRole(value: any): 'USER' | 'MERCHANT' {
  const v = String(value ?? '')
    .toUpperCase()
    .trim();
  return v === 'MERCHANT' ? 'MERCHANT' : 'USER';
}

// Helper: normalisation statut user
function normalizeUserStatus(
  value: any,
): 'active' | 'inactive' | 'pending' | 'suspended' {
  const v = String(value ?? '')
    .toLowerCase()
    .trim();
  if (v === 'inactive' || v === 'pending' || v === 'suspended') return v as any;
  return 'active';
}

// Helper: normalisation statut merchant
function normalizeMerchantStatus(
  value: any,
): 'pending' | 'active' | 'inactive' {
  const v = String(value ?? '')
    .toLowerCase()
    .trim();
  if (v === 'active' || v === 'inactive') return v as any;
  return 'pending';
}

async function main() {
  

  // 1) USERS: status
  // Même si la migration met un default, on normalise au cas où l’historique contienne autre chose.
  
  const users = await prisma.user.findMany({
    select: { id: true, status: true },
  });
  let userUpdates = 0;

  for (const u of users) {
    const next = normalizeUserStatus(u.status);
    if (u.status !== next) {
      await prisma.user.update({ where: { id: u.id }, data: { status: next } });
      userUpdates++;
    }
  }
  

  // 2) MERCHANTS: status basé sur isApproved
  // Règle: si isApproved = true -> active ; sinon on garde la valeur (mais on nettoie en 'pending' si incohérent)
  
  const merchants = await prisma.merchant.findMany({
    select: { id: true, status: true, isApproved: true },
  });
  let merchantUpdates = 0;

  for (const m of merchants) {
    let next: 'pending' | 'active' | 'inactive';
    if (m.isApproved) next = 'active';
    else next = normalizeMerchantStatus(m.status);

    if (m.status !== next) {
      await prisma.merchant.update({
        where: { id: m.id },
        data: { status: next },
      });
      merchantUpdates++;
    }
  }
  

  // 3) XpRule.role -> USER par défaut
  
  const xpRules = await prisma.xpRule.findMany({
    select: { id: true, role: true } as any,
  });
  let xpRoleUpdates = 0;

  for (const r of xpRules) {
    const next = normalizeAudienceRole((r as any).role ?? 'USER');
    if ((r as any).role !== next) {
      await prisma.xpRule.update({
        where: { id: r.id },
        data: { role: next } as any,
      });
      xpRoleUpdates++;
    }
  }
  

  // 4) LevelRule.role -> USER par défaut
  
  const levelRules = await prisma.levelRule.findMany({
    select: { id: true, role: true } as any,
  });
  let levelRoleUpdates = 0;

  for (const r of levelRules) {
    const next = normalizeAudienceRole((r as any).role ?? 'USER');
    if ((r as any).role !== next) {
      await prisma.levelRule.update({
        where: { id: r.id },
        data: { role: next } as any,
      });
      levelRoleUpdates++;
    }
  }
  

  // 5) CommissionRule.target -> USER par défaut
  
  const commissionRules = await prisma.commissionRule.findMany({
    select: { id: true, target: true } as any,
  });
  let commissionTargetUpdates = 0;

  for (const r of commissionRules) {
    const next = normalizeAudienceRole((r as any).target ?? 'USER');
    if ((r as any).target !== next) {
      await prisma.commissionRule.update({
        where: { id: r.id },
        data: { target: next } as any,
      });
      commissionTargetUpdates++;
    }
  }
  

  
}

main()
  .catch((e) => {
    
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
