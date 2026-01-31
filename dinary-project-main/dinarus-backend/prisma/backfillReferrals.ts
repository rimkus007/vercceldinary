// Fichier : backend/prisma/backfillReferrals.ts

import { PrismaClient } from '@prisma/client';
import { nanoid } from 'nanoid';

const prisma = new PrismaClient();

async function main() {
  

  // On cherche tous les utilisateurs qui n'ont pas encore de code
  const usersToUpdate = await prisma.user.findMany({
    where: {
      referralCode: null,
    },
  });

  if (usersToUpdate.length === 0) {
    
    return;
  }

  

  // On boucle sur chaque utilisateur et on lui assigne un nouveau code unique
  for (const user of usersToUpdate) {
    const newReferralCode = `DINARY-${nanoid(6).toUpperCase()}`;
    await prisma.user.update({
      where: { id: user.id },
      data: { referralCode: newReferralCode },
    });
    
  }

  
}

main()
  .catch((e) => {
    
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

    await prisma.$disconnect();
  });
