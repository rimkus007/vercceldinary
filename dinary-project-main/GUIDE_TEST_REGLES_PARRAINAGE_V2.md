# 🎯 Guide de Test - Règles de Parrainage Dynamiques v2

## ✅ Modifications apportées (v2)

### Nouvelle UX Admin
- **Affichage en lecture seule** : Les règles sont affichées en mode lecture seule dans les cartes
- **Bouton "Modifier"** : Un bouton explicite pour ouvrir le modal d'édition
- **Modal de confirmation** : Tous les changements se font dans un modal avec un bouton "Valider la modification"
- **Aperçu en temps réel** : Le modal affiche un aperçu de la nouvelle règle avant validation

## 🔧 Comment utiliser le nouveau système

### Étape 1 : Ouvrir la page de configuration

1. Aller sur `/admin/parrainages/config`
2. Vous voyez toutes les règles en mode **lecture seule**
3. Chaque carte affiche :
   - Action requise
   - Statut (Actif/Inactif)
   - Récompense Parrain
   - Récompense Filleul
   - Résumé de la règle

### Étape 2 : Modifier une règle

1. **Cliquer sur le bouton "Modifier cette règle"** (bouton turquoise en bas de chaque carte)
2. Un **modal s'ouvre** avec tous les champs éditables :
   - Action Requise (dropdown)
   - Récompense pour le Parrain (input numérique)
   - Récompense pour le Filleul (input numérique)
   - Statut de la règle (Radio : Active / Inactive)
3. **Modifier les valeurs** comme vous le souhaitez
4. **Voir l'aperçu** de la nouvelle règle dans l'encadré bleu
5. **Cliquer sur "Valider la modification"** pour sauvegarder
6. Le modal se ferme automatiquement après la sauvegarde

### Étape 3 : Vérifier les changements

1. La carte de la règle modifiée affiche les **nouvelles valeurs**
2. Les changements sont **immédiatement sauvegardés** dans la base de données

## 📋 Tests à effectuer

### Test 1 : Modifier la règle Client → Client

#### Dans l'admin (`localhost:3002/admin/parrainages/config`)

1. **Cliquer sur "Modifier cette règle"** sur la carte "Client → Client"
2. **Changer** :
   - Récompense Parrain : `500` → `2000` (comme dans votre screenshot)
   - Récompense Filleul : `100` → `100` (inchangé)
3. **Vérifier l'aperçu** dans l'encadré bleu :
   - "le parrain reçoit **2000 DA**"
   - "le filleul reçoit **100 DA**"
4. **Cliquer sur "Valider la modification"**
5. ✅ Le modal se ferme
6. ✅ La carte affiche maintenant "2000 DA" pour le parrain

#### Vérification côté client (`localhost:3000/inviter`)

**IMPORTANT** : Il faut actualiser la page pour que le hook recharge les règles

1. **Actualiser la page** (F5 ou Ctrl+R)
2. ✅ La bannière jaune doit afficher "2000 DA par ami"
3. ✅ La section "Comment ça marche" doit afficher "2000 DA par ami"

#### Vérification côté client (`localhost:3000/rewards`)

1. **Actualiser la page** (F5)
2. **Aller sur l'onglet "Parrainage"**
3. ✅ La carte "Ami" doit afficher "+2000 DA"

### Test 2 : Modifier la règle Client → Marchand

#### Dans l'admin

1. **Cliquer sur "Modifier cette règle"** sur la carte "Client → Marchand"
2. **Changer** :
   - Récompense Parrain : `1000` → `1500`
3. **Valider**

#### Vérification côté client

1. **Actualiser `/inviter`**
2. ✅ La bannière affiche "2000 DA par ami et 1500 DA par commerçant"
3. ✅ La section "Comment ça marche" affiche "1500 DA par commerçant"
4. **Actualiser `/rewards`**
5. ✅ La carte "Commerçant" affiche "+1500 DA"

### Test 3 : Modifier la règle Marchand → Marchand

#### Dans l'admin

1. **Cliquer sur "Modifier cette règle"** sur la carte "Marchand → Marchand"
2. **Changer** :
   - Récompense Parrain : `1500` → `2500`
3. **Valider**

#### Vérification côté marchand (`localhost:3003/rewards`)

1. **Actualiser la page**
2. **Aller sur l'onglet "Parrainage"**
3. ✅ La carte "Commerçant" doit afficher "+2500 DA"

### Test 4 : Désactiver une règle

#### Dans l'admin

1. **Cliquer sur "Modifier cette règle"** sur n'importe quelle carte
2. **Sélectionner "Inactive"** dans le statut
3. **Valider**
4. ✅ Le badge "Statut" dans la carte affiche maintenant "Inactif"

#### Vérification côté client

1. **Actualiser la page**
2. ✅ Le montant revient à la valeur par défaut (500 DA, 1000 DA ou 1500 DA) car la règle est désactivée

### Test 5 : Modifier l'action requise

#### Dans l'admin

1. **Cliquer sur "Modifier cette règle"**
2. **Changer l'action requise** : "Première transaction" → "Première recharge"
3. **Vérifier l'aperçu** :
   - "effectue sa **première recharge**"
4. **Valider**
5. ✅ La carte affiche maintenant "Première recharge"

## 🐛 Résolution de problèmes

### Problème : Les changements ne s'affichent pas côté client

**Solution** : Actualisez la page (F5)

Les hooks `useReferralRules` chargent les règles au montage du composant. Après avoir modifié une règle dans l'admin, il faut actualiser la page client/marchand pour recharger les nouvelles règles.

**Pour un rechargement automatique** (fonctionnalité avancée non implémentée) :
- Implémentez WebSockets ou Server-Sent Events
- Ou ajoutez un polling toutes les 30 secondes
- Ou ajoutez un bouton "Actualiser les règles"

### Problème : Le modal ne s'ouvre pas

**Vérifications** :
1. Vérifier la console navigateur pour des erreurs
2. Vérifier que les composants UI shadcn/ui sont bien installés
3. Vérifier que le token admin est valide

### Problème : "Impossible de mettre à jour la règle"

**Vérifications** :
1. Vérifier que le backend est bien démarré (`localhost:3001`)
2. Vérifier le token dans localStorage :
   ```javascript
   localStorage.getItem('access_token_admin')
   ```
3. Vérifier la console backend pour les erreurs
4. Vérifier que la règle existe dans la base de données (Prisma Studio)

### Problème : Les montants sont incorrects

**Vérifications** :
1. Ouvrir Prisma Studio : `http://localhost:5555`
2. Aller dans la table `ReferralRule`
3. Vérifier les valeurs de `referrerReward` et `refereeReward`
4. Vérifier que `isActive` est à `true`

## 📊 Workflow complet

```
1. Admin ouvre /admin/parrainages/config
2. Admin clique sur "Modifier cette règle"
3. Admin modifie les valeurs dans le modal
4. Admin vérifie l'aperçu
5. Admin clique sur "Valider la modification"
6. ✅ Modal se ferme
7. ✅ Carte affiche les nouvelles valeurs
8. ✅ Base de données mise à jour

9. Client actualise /inviter ou /rewards (F5)
10. ✅ Les nouvelles valeurs s'affichent
```

## ✨ Améliorations futures possibles

- **Rechargement automatique** : WebSockets pour notifier les clients en temps réel
- **Historique des modifications** : Tableau des anciennes valeurs
- **Validation avancée** : Empêcher des valeurs trop élevées ou négatives
- **Prévisualisation multi-utilisateurs** : Voir comment ça s'affiche pour chaque type d'utilisateur
- **Import/Export** : Sauvegarder et restaurer des configurations

## 🎉 Résumé

Vous avez maintenant un **système de configuration robuste** avec :
- ✅ Affichage clair en lecture seule
- ✅ Modal d'édition avec confirmation
- ✅ Aperçu en temps réel avant validation
- ✅ Synchronisation avec les interfaces client/marchand (après actualisation)
- ✅ Système de validation et gestion d'erreurs

