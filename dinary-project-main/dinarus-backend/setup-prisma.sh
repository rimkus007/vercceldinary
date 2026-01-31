#!/bin/bash

echo "🔧 Installation et configuration Prisma pour Dinary..."

# Installer Prisma si nécessaire
echo "📦 Installation de Prisma..."
npm install prisma @prisma/client --save-dev

# Installer les dépendances manquantes
echo "📦 Installation des dépendances de sécurité..."
npm install @nestjs/throttler speakeasy qrcode @types/qrcode @types/speakeasy

# Générer le client Prisma
echo "🔄 Génération du client Prisma..."
npx prisma generate

# Créer la migration pour les nouvelles fonctionnalités de sécurité
echo "🗄️ Création de la migration de sécurité..."
npx prisma migrate dev --name add-security-features

echo "✅ Configuration Prisma terminée!"
echo "📝 Les erreurs TypeScript devraient maintenant être résolues."
