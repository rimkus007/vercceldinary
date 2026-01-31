# Dinary - Système de suggestion de commerces

## Aperçu

Cette fonctionnalité permet aux utilisateurs de Dinary de suggérer des commerçants qu'ils aimeraient voir rejoindre la plateforme. Cette stratégie d'acquisition indirecte s'inspire du modèle utilisé par Doctolib, où les utilisateurs demandent aux professionnels s'ils peuvent utiliser la plateforme.

## Fonctionnalités implémentées

### 1. Modal de suggestion de commerce
- Formulaire en 2 étapes pour une meilleure expérience utilisateur
- Première étape : informations essentielles (nom, adresse, catégorie)
- Deuxième étape : informations complémentaires (contact, notes)
- Animation de confirmation après soumission
- Validation des champs obligatoires

### 2. Intégration à la page carte
- Bouton flottant "Suggérer un commerce" en bas à droite de l'écran
- Accès à l'historique des suggestions via un lien secondaire
- Indication du nombre de suggestions déjà faites par l'utilisateur

### 3. Page d'historique des suggestions
- Affichage des commerces suggérés par l'utilisateur
- Indication du statut de chaque suggestion (en attente, contacté, ajouté)
- Affichage des points gagnés pour les suggestions abouties
- Explication du fonctionnement du système de récompense

### 4. Persistance des données
- Stockage des suggestions dans localStorage
- Récupération des suggestions lors du chargement de la page

## Système de récompense

Les utilisateurs sont incités à suggérer des commerces grâce à un système de récompense:
- Points de fidélité accordés lorsqu'un commerçant suggéré rejoint effectivement la plateforme
- Statuts différents permettant de suivre la progression de chaque suggestion
- Reconnaissance de la contribution des utilisateurs au développement du réseau Dinary

## Améliorations futures possibles

1. **Système de recherche d'adresse**
   - Intégration d'une API de géocodage pour faciliter la saisie des adresses

2. **Amélioration du système de récompense**
   - Badges spéciaux pour les utilisateurs ayant référé plusieurs commerces
   - Niveaux de récompense progressifs selon le nombre de suggestions réussies

3. **Tableau de bord administrateur**
   - Interface pour les administrateurs permettant de gérer les suggestions
   - Statistiques sur le taux de conversion des suggestions
   - Automatisation des prises de contact avec les commerçants suggérés

4. **Fonctionnalité de partage**
   - Permettre aux utilisateurs d'envoyer directement une invitation au commerçant
   - QR code spécifique à scanner par le commerçant pour rejoindre facilement

## Comment utiliser

1. Depuis la page carte, cliquez sur le bouton "Suggérer un commerce"
2. Remplissez les informations requises dans le formulaire en 2 étapes
3. Soumettez votre suggestion et recevez une confirmation
4. Consultez l'historique de vos suggestions via le lien "Mes suggestions"
