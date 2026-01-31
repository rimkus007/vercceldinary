# 🐛 Debug - Règles de Parrainage

## 🔍 Étapes de débogage

### 1. Ouvrir la console du navigateur

1. Aller sur la page client `/inviter` (http://localhost:3000/inviter)
2. Appuyer sur **F12** pour ouvrir les DevTools
3. Aller dans l'onglet **Console**
4. Actualiser la page (**F5**)

### 2. Vérifier les logs

Vous devriez voir ces logs dans la console :

```
📊 Données reçues du backend: { userRole: 'USER', rewards: [...] }
📊 Rewards: [...]
🎯 Récompenses calculées: { userToUserReward: 2000, userToMerchantReward: 1000, ... }
```

### 3. Vérifier les données reçues

**Si vous voyez `rewards: []` (tableau vide) :**
- ❌ Le backend ne renvoie pas les règles
- Solution : Vérifier que les règles existent dans la base de données

**Si vous voyez des données mais `userToUserReward: 500` :**
- ❌ Le backend renvoie des règles mais avec `yourReward: 500`
- Solution : Vérifier que la règle a bien été modifiée dans l'admin

**Si vous voyez une erreur :**
- ❌ Le backend ne répond pas ou il y a un problème d'authentification
- Solution : Vérifier le token et que le backend est démarré

## 🧪 Tests manuels

### Test 1 : Vérifier le token

Dans la console du navigateur :
```javascript
localStorage.getItem('access_token_user')
```

✅ Doit retourner un token (longue chaîne de caractères)
❌ Si `null`, vous n'êtes pas connecté

### Test 2 : Tester l'endpoint directement

Dans la console du navigateur :
```javascript
const token = localStorage.getItem('access_token_user');
fetch('http://localhost:3001/admin/referral-rules/public/USER', {
  headers: { Authorization: `Bearer ${token}` }
})
.then(r => r.json())
.then(data => console.log('Règles:', data));
```

✅ Doit afficher les règles avec `yourReward: 2000`
❌ Si erreur, vérifier le backend

### Test 3 : Vérifier la base de données

1. Ouvrir Prisma Studio : http://localhost:5555
2. Aller dans la table **ReferralRule**
3. Trouver la règle avec :
   - `referrerType: USER`
   - `refereeType: USER`
4. Vérifier :
   - ✅ `referrerReward` doit être `2000`
   - ✅ `isActive` doit être `true`

## 🔧 Solutions courantes

### Problème : rewards est un tableau vide

**Cause** : Pas de règles dans la base de données

**Solution** :
1. Aller sur `/admin/parrainages/config`
2. Cliquer sur "Initialiser les Règles" si aucune règle n'existe
3. Modifier les règles pour mettre 2000 DA

### Problème : yourReward est toujours 500

**Cause** : La règle n'a pas été modifiée correctement dans l'admin

**Solution** :
1. Vérifier dans Prisma Studio que `referrerReward = 2000`
2. Si non, modifier à nouveau dans `/admin/parrainages/config`
3. Vérifier que le bouton "Valider la modification" a bien été cliqué

### Problème : Erreur 401 Unauthorized

**Cause** : Token invalide ou expiré

**Solution** :
1. Se déconnecter et se reconnecter
2. Vérifier que le token existe dans localStorage

### Problème : Erreur "Cannot read property 'yourReward' of undefined"

**Cause** : Le hook cherche une règle qui n'existe pas

**Solution** :
1. Vérifier qu'il existe bien une règle avec `referrerType: USER` et `refereeType: USER`
2. Vérifier que cette règle est active (`isActive: true`)

## 📊 Format attendu des données

Le backend doit renvoyer :
```json
{
  "userRole": "USER",
  "rewards": [
    {
      "id": "...",
      "type": "USER_TO_USER",
      "targetType": "USER",
      "yourReward": 2000,
      "friendReward": 100,
      "requiredAction": "FIRST_TRANSACTION",
      "description": "Client parraine Client"
    },
    {
      "id": "...",
      "type": "USER_TO_MERCHANT",
      "targetType": "MERCHANT",
      "yourReward": 1000,
      "friendReward": 0,
      "requiredAction": "FIRST_SALE",
      "description": "Client parraine Marchand"
    }
  ]
}
```

## 🎯 Checklist complète

- [ ] Backend démarré (http://localhost:3001)
- [ ] Règles initialisées dans la base de données
- [ ] Règle USER → USER modifiée à 2000 DA dans l'admin
- [ ] Règle USER → USER est active (`isActive: true`)
- [ ] Token client valide dans localStorage
- [ ] Page client actualisée après modification
- [ ] Console ouverte pour voir les logs
- [ ] Données reçues correctement du backend
- [ ] `yourReward: 2000` dans les données

## 🚀 Commandes rapides

```bash
# Vérifier que le backend est démarré
curl http://localhost:3001/admin/referral-rules/public/USER \
  -H "Authorization: Bearer VOTRE_TOKEN"

# Ouvrir Prisma Studio
cd dinarus-backend
npx prisma studio --port 5555
```

## 💡 Si rien ne fonctionne

1. **Redémarrer le backend** :
   ```bash
   cd dinarus-backend
   npm run start:dev
   ```

2. **Vider le cache du navigateur** :
   - Ctrl + Shift + Delete
   - Cocher "Cookies et données de site"
   - Vider

3. **Réinitialiser les règles** :
   - Supprimer toutes les règles dans Prisma Studio
   - Aller sur `/admin/parrainages/config`
   - Cliquer sur "Initialiser les Règles"
   - Modifier à nouveau

4. **Vérifier les logs backend** :
   - Regarder la console du backend pour des erreurs
   - Vérifier que l'endpoint `/admin/referral-rules/public/USER` répond

Si après tout cela ça ne fonctionne toujours pas, envoyez-moi les logs de la console !

