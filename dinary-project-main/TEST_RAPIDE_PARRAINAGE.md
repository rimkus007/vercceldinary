# 🚀 Test Rapide - Problème 500 DA au lieu de 2000 DA

## ⚡ Étape 1 : Vérifier la base de données

```bash
cd dinarus-backend
npx ts-node test-referral-rules.ts
```

**Ce que vous devriez voir :**
```
🎯 Vérification de la règle USER → USER:
   ✅ Règle trouvée!
   Récompense Parrain: 2000 DA
   Active: Oui
   ✅ La règle est bien configurée à 2000 DA
```

**Si vous voyez "500 DA" au lieu de "2000 DA" :**
- ❌ La règle n'a pas été sauvegardée correctement
- Solution : Retourner dans `/admin/parrainages/config` et modifier à nouveau

**Si vous voyez "Règle USER → USER non trouvée" :**
- ❌ La règle n'existe pas ou n'est pas active
- Solution : Initialiser les règles ou activer la règle

## ⚡ Étape 2 : Vérifier les logs du navigateur

1. Ouvrir http://localhost:3000/inviter
2. Appuyer sur **F12**
3. Aller dans **Console**
4. Actualiser la page (**F5** ou **Ctrl+R**)

**Ce que vous devriez voir :**
```
📊 Données reçues du backend: {userRole: 'USER', rewards: Array(2)}
📊 Rewards: (2) [{…}, {…}]
🎯 Récompenses calculées: {userToUserReward: 2000, userToMerchantReward: 1000, ...}
```

**Cliquer sur le triangle** devant `Rewards: (2)` pour développer et vérifier :
```javascript
[
  {
    id: "...",
    targetType: "USER",
    yourReward: 2000,  // <-- Doit être 2000 !
    ...
  },
  {
    id: "...",
    targetType: "MERCHANT",
    yourReward: 1000,
    ...
  }
]
```

**Si `yourReward: 500` au lieu de `2000` :**
- ❌ Le backend renvoie les anciennes données
- Solutions possibles :
  1. La modification n'a pas été sauvegardée
  2. Le cache du navigateur garde les anciennes données
  3. Vous regardez une autre règle

## ⚡ Étape 3 : Tester l'endpoint directement

Dans la **Console** du navigateur (F12) :

```javascript
const token = localStorage.getItem('access_token_user');
fetch('http://localhost:3001/admin/referral-rules/public/USER', {
  headers: { Authorization: `Bearer ${token}` }
})
.then(r => r.json())
.then(data => {
  console.log('🎯 Données brutes du backend:', data);
  const userRule = data.rewards.find(r => r.targetType === 'USER');
  console.log('💰 Récompense USER → USER:', userRule?.yourReward, 'DA');
});
```

**Résultat attendu :**
```
🎯 Données brutes du backend: {userRole: 'USER', rewards: Array(2)}
💰 Récompense USER → USER: 2000 DA
```

**Si vous voyez 500 DA :**
- La base de données contient toujours 500 DA
- Retourner à l'Étape 1

## ⚡ Étape 4 : Solution rapide

Si après toutes ces vérifications, la base de données montre bien 2000 DA mais le frontend affiche 500 DA :

1. **Vider le cache du navigateur**
   - Ctrl + Shift + Delete
   - Cocher "Images et fichiers en cache"
   - Vider

2. **Fermer et rouvrir le navigateur**

3. **Se reconnecter**
   - Se déconnecter de l'application
   - Se reconnecter
   - Retourner sur `/inviter`

4. **Hard refresh**
   - Ctrl + Shift + R (Windows/Linux)
   - Cmd + Shift + R (Mac)

## 📸 Envoyez-moi ces captures

Si ça ne fonctionne toujours pas, envoyez-moi :

1. **Capture d'écran du terminal** après avoir exécuté `npx ts-node test-referral-rules.ts`
2. **Capture d'écran de la console navigateur** (F12 → Console) sur la page `/inviter`
3. **Capture d'écran de Prisma Studio** (http://localhost:5555) montrant la table ReferralRule

## 🔍 Checklist rapide

- [ ] Backend démarré (`npm run start:dev` dans dinarus-backend)
- [ ] Script de test exécuté : `npx ts-node test-referral-rules.ts`
- [ ] Résultat : "2000 DA" dans le script de test
- [ ] Page `/inviter` actualisée (F5)
- [ ] Console ouverte (F12)
- [ ] Logs affichant "yourReward: 2000"
- [ ] Page affiche toujours "500 DA" malgré tout

Si tous ces points sont cochés ✅ et que ça affiche toujours 500 DA, il y a un problème plus profond que nous devrons investiguer ensemble.

