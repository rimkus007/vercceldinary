# Améliorations de la page Support du Marchand

## 📋 Modifications effectuées

### 1. **Page de Support Complète** (`dinaruspro-frontend/src/app/support/page.tsx`)

#### Nouvelles fonctionnalités :
- ✅ **Page sans scroll** : La page utilise maintenant `h-screen` et `overflow-hidden` pour tenir sur un seul écran
- ✅ **Système d'onglets** : 3 onglets distincts
  - 💬 **Chat** : Discussion en direct avec l'administration
  - ❓ **FAQ** : Questions fréquentes pour les marchands
  - 🎫 **Tickets** : Système de création et suivi de tickets de support

#### Structure de la page :
```
┌─────────────────────────────────┐
│ Header fixe (← Support)         │
├─────────────────────────────────┤
│ Onglets : Chat | FAQ | Tickets  │
├─────────────────────────────────┤
│                                 │
│  Contenu selon l'onglet actif   │
│  (avec scroll interne)          │
│                                 │
├─────────────────────────────────┤
│ Bottom Navbar (64px)            │
└─────────────────────────────────┘
```

**Note importante :** La page utilise `fixed inset-0 bottom-16` pour prendre toute la hauteur de l'écran MOINS l'espace de la bottom navbar (64px/4rem), assurant qu'il n'y a aucun scroll global.

#### Onglet Chat :
- Zone de messages avec scroll interne uniquement
- Zone de saisie fixe en bas
- Support des fichiers joints
- Affichage des statuts de lecture
- Design moderne avec dégradés purple/blue

#### Onglet FAQ :
- Questions fréquentes spécifiques aux marchands :
  - Comment encaisser un paiement ?
  - Comment retirer mes fonds ?
  - Comment gérer mon inventaire ?
  - Comment suivre mes ventes ?
  - Quels sont les frais de transaction ?
- Interface avec accordéons animés

#### Onglet Tickets :
- Formulaire de création de ticket avec :
  - Catégorie (Question générale, Problème de compte, Paiement, Technique, Inventaire, Autre)
  - Priorité (Basse, Normale, Haute, Urgente)
  - Sujet
  - Message détaillé
- Liste des tickets récents avec leur statut
- Design cohérent avec le reste de l'application

### 2. **Système de Notifications Amélioré** (`dinaruspro-frontend/src/components/Notifications.tsx`)

#### Nouvelles fonctionnalités :
- ✅ **Notifications de messages admin** : Le marchand reçoit maintenant une notification dans la cloche 🔔 quand l'admin lui envoie un message
- ✅ **Vérification automatique** : Polling toutes les 5 secondes pour détecter les nouveaux messages
- ✅ **Navigation intelligente** : Cliquer sur une notification de message redirige vers la page de support (onglet Chat)
- ✅ **Marquer comme lu** : Les notifications peuvent être marquées comme lues individuellement

#### Fonctionnement :
1. Vérification régulière des messages via `/merchants/me/chat`
2. Détection des nouveaux messages de l'admin
3. Création automatique d'une notification locale
4. Affichage dans le panneau de notifications avec icône 💬
5. Au clic, redirection vers `/support` et marquage comme lu

### 3. **Types de Notifications**
Les notifications peuvent maintenant avoir un `type` et un `link` :
- **type** : `'system'` | `'message'`
- **link** : URL vers laquelle rediriger l'utilisateur au clic

## 🎨 Design et UX

### Caractéristiques du design :
- **Couleurs cohérentes** : Dégradés purple-600 → blue-600
- **Animations** : Utilisation de Framer Motion pour les transitions
- **Responsive** : Fonctionne sur mobile et desktop
- **Sans scroll global** : Seuls les contenus des onglets ont un scroll interne
- **Icônes modernes** : Utilisation de Lucide React pour les icônes

### Accessibilité :
- Labels appropriés pour les champs de formulaire
- Navigation au clavier possible
- Contrastes de couleurs respectés
- Indicateurs visuels clairs (statuts, badges)

## 🔧 Utilisation

### Pour le marchand :
1. Accéder à la page via le menu de navigation ou via `/support`
2. Utiliser les onglets pour naviguer entre Chat, FAQ et Tickets
3. Recevoir des notifications dans la cloche quand l'admin envoie un message
4. Cliquer sur la notification pour accéder directement au chat

### Pour l'admin :
- Les messages envoyés aux marchands via `/merchants/:id/chat` génèrent automatiquement des notifications côté marchand

## 📱 Tests recommandés

1. **Test du chat** :
   - Envoyer un message au marchand depuis l'admin
   - Vérifier que la notification apparaît dans la cloche
   - Cliquer sur la notification et vérifier la redirection

2. **Test des onglets** :
   - Naviguer entre les 3 onglets
   - Vérifier que le contenu s'affiche correctement
   - Tester le scroll interne de chaque onglet

3. **Test des tickets** :
   - Créer un ticket de support
   - Vérifier l'envoi du formulaire

4. **Test responsive** :
   - Tester sur différentes tailles d'écran
   - Vérifier que la page reste sans scroll global

## 🚀 Prochaines étapes possibles

- [ ] Connecter le système de tickets au backend
- [ ] Ajouter des sons de notification
- [ ] Permettre le marquage de plusieurs notifications comme lues
- [ ] Ajouter des filtres pour les tickets (par statut, par date)
- [ ] Ajouter la recherche dans la FAQ
- [ ] Permettre l'envoi d'images dans le chat
- [ ] Ajouter des réactions aux messages

## 📝 Notes techniques

### Fichiers modifiés :
1. `dinaruspro-frontend/src/app/support/page.tsx` - Page de support complète
2. `dinaruspro-frontend/src/components/Notifications.tsx` - Système de notifications amélioré

### Solution au problème de scroll :

**Problème initial :** Le layout de l'application (`dinaruspro-frontend/src/app/layout.tsx`) ajoute un `pb-16` (padding-bottom de 64px) pour faire de la place à la `BottomNavbar`. Quand la page utilisait `h-screen`, elle prenait 100vh de hauteur, mais le padding du layout créait un scroll indésirable.

**Solution appliquée :**
```tsx
<div className="fixed inset-0 bottom-16 bg-gradient-to-br from-purple-50 to-blue-50 flex flex-col overflow-hidden">
```

- `fixed` : Position fixe sur l'écran (ignore le padding du layout)
- `inset-0` : Équivaut à `top-0 right-0 left-0 bottom-0` (couvre tout l'écran)
- `bottom-16` : Mais avec un décalage de 64px en bas pour laisser l'espace à la BottomNavbar
- `overflow-hidden` : Empêche tout scroll sur le conteneur principal

Cette approche garantit que la page occupe exactement l'espace disponible entre le haut de l'écran et la bottom navbar, sans aucun scroll global. Seuls les contenus internes (messages, FAQ, tickets) ont leur propre scroll.

### Dépendances utilisées :
- `framer-motion` : Animations
- `lucide-react` : Icônes
- `next/navigation` : Navigation et routing

### API endpoints utilisés :
- `GET /merchants/me/chat` : Récupérer les messages
- `POST /merchants/me/chat` : Envoyer un message
- `GET /merchants/me/notifications` : Récupérer les notifications
- `POST /merchants/me/notifications/:id/read` : Marquer une notification comme lue

