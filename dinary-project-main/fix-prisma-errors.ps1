# Script pour corriger les erreurs Prisma et TypeScript

Write-Host "🔧 Correction des erreurs Prisma et TypeScript..." -ForegroundColor Green

cd dinarus-backend

Write-Host "📦 Nettoyage des dépendances Prisma..." -ForegroundColor Yellow
Remove-Item -Recurse -Force node_modules -ErrorAction SilentlyContinue
Remove-Item package-lock.json -ErrorAction SilentlyContinue

Write-Host "📦 Réinstallation des dépendances..." -ForegroundColor Yellow
npm install

Write-Host "🔄 Génération du client Prisma..." -ForegroundColor Yellow
npx prisma generate

Write-Host "🗄️ Synchronisation de la base de données..." -ForegroundColor Yellow
npx prisma db push

Write-Host "✅ Corrections terminées!" -ForegroundColor Green
Write-Host "🚀 Vous pouvez maintenant lancer: npm run dev:all" -ForegroundColor Cyan
