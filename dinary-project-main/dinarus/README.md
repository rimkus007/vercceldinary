# Dinarus - Portefeuille Électronique Gamifié

Dinarus est une application de paiement par QR code gamifiée qui fonctionne comme un portefeuille électronique avec des fonctionnalités de néobanque. Cette application permet aux utilisateurs d'effectuer des paiements, de gérer leur argent, et de gagner des points et récompenses à travers un système de gamification.

## Fonctionnalités

- **Paiement par QR Code** : Scannez et payez rapidement et en toute sécurité
- **Portefeuille Électronique** : Gérez votre solde, effectuez des transferts et suivez vos dépenses
- **Système de Gamification** : Gagnez des points, montez en niveau et recevez des récompenses
- **Historique des Transactions** : Consultez l'historique complet de vos mouvements financiers
- **Profil Utilisateur** : Gérez vos informations personnelles et préférences de confidentialité

## Structure de l'Application

L'application est construite avec Next.js 14, en utilisant l'architecture App Router, TypeScript et Tailwind CSS.

### Pages Principales

- **Accueil (/)** : Présentation de l'application et ses fonctionnalités
- **Portefeuille (/wallet)** : Gestion du solde et transactions
- **Scanner QR Code (/encaisser)** : Interface de paiement par QR code
- **Récompenses (/rewards)** : Système de points et badges
- **Historique (/historique)** : Liste des transactions avec filtres
- **Profil (/profile)** : Gestion du compte utilisateur
- Pages additionnelles pour le registre, les statistiques, les retraits, etc.

### Architecture Technique

- **Frontend** : Next.js 14 avec App Router et TypeScript
- **Styling** : Tailwind CSS pour un design responsive
- **Composants** : Organisation modulaire dans le répertoire "components"
- **Routing** : Système de routage basé sur les dossiers de Next.js

## Démarrage

```bash
# Installer les dépendances
npm install

# Lancer le serveur de développement
npm run dev

# Créer une version de production
npm run build
npm run start
```

## Technologies Utilisées

- [Next.js 14](https://nextjs.org/)
- [React](https://reactjs.org/)
- [TypeScript](https://www.typescriptlang.org/)
- [Tailwind CSS](https://tailwindcss.com/)

## Contribution

Les contributions sont les bienvenues. N'hésitez pas à ouvrir une issue ou à soumettre une pull request.

## Licence

Ce projet est sous licence MIT.
