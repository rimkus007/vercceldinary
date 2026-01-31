# 🎯 Guide de Test - Règles de Parrainage Dynamiques

## ✅ Modifications apportées

### 1. Backend
- Création de l'endpoint public `/admin/referral-rules/public/:userRole`
- Cet endpoint permet aux clients et marchands de récupérer les règles de parrainage sans authentification admin

### 2. Frontend Client (`dinarus`)
- Création du hook `useReferralRules` pour récupérer les règles depuis le backend
- Modification de la page `/inviter` pour afficher les montants dynamiques
- Modification de la page `/rewards` pour afficher les montants dynamiques

### 3. Frontend Marchand (`dinaruspro-frontend`)
- Création du hook `useReferralRules` pour récupérer les règles depuis le backend
- Modification de la page `/rewards` pour afficher les montants dynamiques et les règles de parrainage

## 🔧 Configuration initiale

### Étape 1 : Initialiser les règles par défaut

Si ce n'est pas déjà fait, initialisez les règles de parrainage par défaut en envoyant une requête POST :

```bash
# Depuis le terminal backend
cd dinarus-backend
curl -X POST http://localhost:3001/admin/referral-rules/initialize \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

Ou depuis Prisma Studio :
1. Ouvrir `http://localhost:5555`
2. Aller dans la table `ReferralRule`
3. Vérifier que 4 règles existent :
   - USER → USER : 500 DA (parrain) + 100 DA (filleul)
   - USER → MERCHANT : 1000 DA (parrain) + 0 DA (filleul)
   - MERCHANT → USER : 500 DA (parrain) + 100 DA (filleul)
   - MERCHANT → MERCHANT : 1500 DA (parrain) + 500 DA (filleul)

## 📋 Tests à effectuer

### Test 1 : Affichage des montants par défaut (Client)

#### Page `/inviter` (localhost:3000/inviter)
1. **Se connecter en tant que client**
2. **Vérifications** :
   - ✅ La bannière jaune affiche "500 DA par ami et 1000 DA par commerçant"
   - ✅ La section "Comment ça marche" affiche "500 DA par ami, 1000 DA par commerçant"
   - ✅ L'onglet "Inviter des commerçants" affiche "Recevez 1000 DA pour chaque commerçant"

#### Page `/rewards` (localhost:3000/rewards)
1. **Aller sur l'onglet "Parrainage"**
2. **Vérifications** :
   - ✅ La carte "Ami" affiche "+500 DA"
   - ✅ La carte "Commerçant" affiche "+1000 DA"

### Test 2 : Affichage des montants par défaut (Marchand)

#### Page `/rewards` (localhost:3003/rewards)
1. **Se connecter en tant que marchand**
2. **Aller sur l'onglet "Parrainage"**
3. **Vérifications** :
   - ✅ La carte "Client" affiche "+500 DA"
   - ✅ La carte "Commerçant" affiche "+1500 DA"

### Test 3 : Modification des règles depuis l'admin

#### Page `/admin/parrainages/config`
1. **Se connecter en tant qu'admin**
2. **Modifier une règle** (par exemple : USER → USER)
   - Changer la récompense du parrain de 500 DA à 750 DA
   - Cliquer sur "Mettre à jour"
3. **Vérifier la mise à jour immédiate** :
   - ✅ La carte affiche "750 DA" immédiatement après la modification

#### Vérification côté client
1. **Actualiser la page `/inviter` (client)**
2. **Vérifications** :
   - ✅ La bannière jaune affiche maintenant "750 DA par ami"
   - ✅ La section "Comment ça marche" affiche "750 DA par ami"
   - ✅ La page `/rewards` affiche "+750 DA" pour "Ami"

### Test 4 : Modification d'une règle marchand

#### Page `/admin/parrainages/config`
1. **Modifier la règle MERCHANT → MERCHANT**
   - Changer de 1500 DA à 2000 DA
   - Cliquer sur "Mettre à jour"

#### Vérification côté marchand
1. **Actualiser la page `/rewards` (marchand)**
2. **Vérifications** :
   - ✅ La carte "Commerçant" affiche "+2000 DA"

### Test 5 : Désactivation d'une règle

#### Page `/admin/parrainages/config`
1. **Désactiver la règle USER → MERCHANT**
   - Décocher "Active"
   - Cliquer sur "Mettre à jour"

#### Vérification côté client
1. **Actualiser la page `/inviter` (client)**
2. **Vérifications** :
   - ✅ Le montant revient à la valeur par défaut (1000 DA) car la règle est désactivée

## 🐛 En cas d'erreur

### Si les montants ne s'affichent pas côté client/marchand :

1. **Vérifier la console du navigateur** :
   ```
   Ouvrir les DevTools (F12)
   Aller dans l'onglet Console
   Chercher des erreurs relatives à "referral-rules"
   ```

2. **Vérifier le token d'authentification** :
   ```javascript
   // Dans la console du navigateur
   localStorage.getItem('access_token_user') // Pour les clients
   localStorage.getItem('access_token_merchant') // Pour les marchands
   ```

3. **Vérifier l'endpoint backend** :
   ```bash
   # Depuis le terminal
   curl http://localhost:3001/admin/referral-rules/public/USER \
     -H "Authorization: Bearer YOUR_TOKEN"
   ```

4. **Vérifier les règles dans la base de données** :
   ```bash
   # Ouvrir Prisma Studio
   cd dinarus-backend
   npx prisma studio --port 5555
   # Aller dans la table ReferralRule
   ```

## 📊 Résultat attendu

Après toutes les modifications, les montants affichés dans les pages client et marchand doivent **toujours correspondre** aux règles configurées dans l'admin, sans nécessiter de redémarrage de l'application.

Les utilisateurs verront les nouvelles règles dès qu'ils actualisent la page ou naviguent vers une nouvelle page.

## ✨ Fonctionnalités bonus

- **Valeurs par défaut** : Si l'API ne répond pas, les valeurs par défaut (500 DA, 1000 DA, 1500 DA) sont utilisées
- **Cache** : Les règles sont chargées au montage du composant et réutilisées
- **Refresh manuel** : La fonction `refresh()` du hook permet de recharger les règles manuellement si nécessaire

## 🎉 Conclusion

Les règles de parrainage sont maintenant **entièrement dynamiques** et **configurables depuis le panel admin**, avec affichage en temps réel côté client et marchand !

