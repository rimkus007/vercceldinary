// Fichier : backend/prisma/seed.ts

import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

// ---- Typage des données marchands (évite les TS2339: type 'never') ----
type MerchantSeed = {
  email: string;
  username: string;
  fullName: string;
  name: string;
  address: string;
  category: string; // adapte en enum si ton schema utilise un enum
  latitude: number;
  longitude: number;
  products: { name: string; price: number; stock: number; category: string }[];
};

async function main() {
  void 0;

  // --- Création de l'Administrateur ---
  const adminPassword = await bcrypt.hash('adminpassword', 10);
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@dinary.com' },
    update: {},
    create: {
      email: 'admin@dinary.com',
      username: 'Admin',
      fullName: 'Admin Dinary',
      phoneNumber: '+213500000000',
      hashedPassword: adminPassword,
      role: 'ADMIN',
      isVerified: true,
    },
  });
  await prisma.userProfile.upsert({
    where: { userId: adminUser.id },
    update: {},
    create: { userId: adminUser.id },
  });
  await prisma.wallet.upsert({
    where: { userId: adminUser.id },
    update: {},
    create: { userId: adminUser.id, balance: 1000000 }, // Wallet pour l'admin
  });
  void 0;

  // --- Création d'un Utilisateur de Test ---
  const userPassword = await bcrypt.hash('userpassword', 10);
  const regularUser = await prisma.user.upsert({
    where: { email: 'user@example.com' },
    update: {},
    create: {
      email: 'user@example.com',
      username: 'TestUser',
      fullName: 'Utilisateur de Test',
      phoneNumber: '+213511111111',
      hashedPassword: userPassword,
      role: 'USER',
      isVerified: true,
    },
  });
  await prisma.userProfile.upsert({
    where: { userId: regularUser.id },
    update: {},
    create: { userId: regularUser.id },
  });
  await prisma.wallet.upsert({
    where: { userId: regularUser.id },
    update: {},
    create: { userId: regularUser.id },
  });
  void 0;

  // --- Création d'un Marchand de Test ---
  const merchantPassword = await bcrypt.hash('merchantpassword', 10);
  const merchantUser = await prisma.user.upsert({
    where: { email: 'merchant@example.com' },
    update: {},
    create: {
      email: 'merchant@example.com',
      username: 'TestMerchant',
      fullName: 'Marchand de Test',
      phoneNumber: '+213522222222',
      hashedPassword: merchantPassword,
      role: 'MERCHANT',
      isVerified: true,
    },
  });
  await prisma.userProfile.upsert({
    where: { userId: merchantUser.id },
    update: {},
    create: { userId: merchantUser.id },
  });
  await prisma.wallet.upsert({
    where: { userId: merchantUser.id },
    update: {},
    create: { userId: merchantUser.id },
  });
  await prisma.merchant.upsert({
    where: { userId: merchantUser.id },
    update: {},
    create: {
      userId: merchantUser.id,
      name: 'Boutique de Test',
      address: '123 Rue du Test, 06000 Nice',
      category: 'retail',
      latitude: 43.7,
      longitude: 7.25,
      isApproved: true,
      status: 'active',
      rating: 4.5,
    },
  });
  void 0;

  // --- Données des commerçants de Nice AVEC leurs produits ---
  const niceMerchantsData: MerchantSeed[] = [
    {
      email: 'boulangerie.massena@example.com',
      username: 'BoulangerieMassena',
      fullName: 'Boulanger Jean',
      name: 'Boulangerie de la Place',
      address: '1 Place Masséna, 06000 Nice',
      category: 'grocery',
      latitude: 43.6975,
      longitude: 7.2701,
      products: [
        {
          name: 'Croissant au beurre',
          price: 1.2,
          stock: 50,
          category: 'viennoiserie',
        },
        {
          name: 'Pain au chocolat',
          price: 1.5,
          stock: 40,
          category: 'viennoiserie',
        },
        {
          name: 'Baguette Tradition',
          price: 1.1,
          stock: 100,
          category: 'pain',
        },
      ],
    },
    {
      email: 'cafe.promenade@example.com',
      username: 'CafePromenade',
      fullName: 'Alice Martin',
      name: 'Café des Anglais',
      address: '50 Promenade des Anglais, 06000 Nice',
      category: 'restaurants',
      latitude: 43.694,
      longitude: 7.255,
      products: [
        { name: 'Espresso', price: 2.5, stock: 200, category: 'boisson' },
        { name: 'Café Latte', price: 4.0, stock: 150, category: 'boisson' },
        { name: 'Cappuccino', price: 4.2, stock: 150, category: 'boisson' },
        { name: 'Thé vert bio', price: 3.8, stock: 80, category: 'boisson' },
        {
          name: "Jus d'orange pressé",
          price: 5.0,
          stock: 50,
          category: 'boisson',
        },
      ],
    },
    {
      email: 'souvenirs.vieuxnice@example.com',
      username: 'SouvenirsVieuxNice',
      fullName: 'Pierre Durand',
      name: 'Souvenirs du Vieux-Nice',
      address: '10 Rue de la Préfecture, 06300 Nice',
      category: 'retail',
      latitude: 43.6963,
      longitude: 7.2765,
      products: [
        {
          name: 'Porte-clés "I Love Nice"',
          price: 5.0,
          stock: 300,
          category: 'souvenir',
        },
        {
          name: 'Magnet Vieux-Nice',
          price: 4.5,
          stock: 400,
          category: 'souvenir',
        },
        {
          name: 'T-shirt "Riviera"',
          price: 20.0,
          stock: 100,
          category: 'vetement',
        },
      ],
    },
  ];

  for (const data of niceMerchantsData) {
    const hashed = await bcrypt.hash('password123', 10);

    await prisma.$transaction(async (tx) => {
      const mUser = await tx.user.upsert({
        where: { email: data.email },
        update: {},
        create: {
          email: data.email,
          username: data.username,
          fullName: data.fullName,
          phoneNumber: `+3360000${Math.floor(Math.random() * 10000)}`,
          hashedPassword: hashed,
          role: 'MERCHANT',
          isVerified: true,
        },
      });

      // Profil + wallet
      await tx.userProfile.upsert({
        where: { userId: mUser.id },
        update: {},
        create: { userId: mUser.id },
      });
      await tx.wallet.upsert({
        where: { userId: mUser.id },
        update: {},
        create: { userId: mUser.id },
      });

      await tx.merchant.upsert({
        where: { userId: mUser.id },
        update: {
          latitude: data.latitude,
          longitude: data.longitude,
        },
        create: {
          userId: mUser.id,
          name: data.name,
          address: data.address,
          category: data.category,
          latitude: data.latitude,
          longitude: data.longitude,
          isApproved: true,
          status: 'active',
          rating: Math.random() * 2 + 3,
          products: {
            create: data.products,
          },
        },
      });

      void 0;
    });
  }

  void 0;
}

main()
  .catch((e) => {
    void 0;
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
