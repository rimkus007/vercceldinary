# Déployer sur Vercel

- Pré-requis: compte Vercel, dépôt Git connecté, Node.js 18+, Next.js 16+
- Projet Next.js situé dans le dossier `Dashboard`

- Étapes:
  1. Connectez votre dépôt à Vercel et importez-le comme nouveau projet.
  2. Dans les paramètres du projet, définissez le répertoire racine sur `Dashboard`.
  3. Vérifiez que le build est `npm run build` et que la sortie est `.next`.
  4. Déployez; Vercel détectera automatiquement Next.js et réalisera le build.

- Option: vous pouvez aussi utiliser la CLI:
  - npm i -g vercel
  - vercel --prod
  - Lors de l’import, spécifiez Dashboard comme répertoire racine.

- Si vous voulez déployer le backend NestJS également, considérez:
  - le déployer séparément (par ex sur Render, Railway, ou AWS) ou
  - ré-héberger les endpoints NestJS en tant que serverless functions sur Vercel après adaptation.
