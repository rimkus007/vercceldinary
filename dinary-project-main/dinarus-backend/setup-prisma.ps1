# Script PowerShell pour configuration Prisma

Write-Host "🔧 Installation et configuration Prisma pour Dinary..." -ForegroundColor Green

# Installer Prisma si nécessaire
Write-Host "📦 Installation de Prisma..." -ForegroundColor Yellow
npm install prisma @prisma/client --save-dev

# Installer les dépendances manquantes
Write-Host "📦 Installation des dépendances de sécurité..." -ForegroundColor Yellow
npm install @nestjs/throttler speakeasy qrcode @types/qrcode @types/speakeasy

# Générer le client Prisma
Write-Host "🔄 Génération du client Prisma..." -ForegroundColor Yellow
npx prisma generate

# Créer la migration pour les nouvelles fonctionnalités de sécurité
Write-Host "🗄️ Création de la migration de sécurité..." -ForegroundColor Yellow
npx prisma migrate dev --name add-security-features

Write-Host "✅ Configuration Prisma terminée!" -ForegroundColor Green
Write-Host "📝 Les erreurs TypeScript devraient maintenant être résolues." -ForegroundColor Cyan
