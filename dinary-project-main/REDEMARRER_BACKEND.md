# 🚀 URGENT : Redémarrer le Backend

## ❌ Problème actuel

L'endpoint `/admin/referral-rules/public/USER` retourne **404 Not Found**.

**Raison** : Le backend n'a pas recompilé après l'ajout de l'endpoint public.

## ✅ Solution : Redémarrer le backend

### Option 1 : Redémarrage propre (RECOMMANDÉ)

```bash
# 1. Arrêter le backend (Ctrl+C dans le terminal où il tourne)

# 2. Nettoyer le cache
cd dinarus-backend
Remove-Item -Path "dist" -Recurse -Force -ErrorAction SilentlyContinue
Remove-Item -Path "node_modules\.cache" -Recurse -Force -ErrorAction SilentlyContinue

# 3. Redémarrer
npm run start:dev
```

### Option 2 : Redémarrage rapide

```bash
# Dans le terminal du backend, faire Ctrl+C puis :
npm run start:dev
```

## 🔍 Vérifier que ça marche

### Test 1 : Dans le terminal backend

Après le redémarrage, vous devriez voir dans les logs :

```
[Nest] LOG [RoutesResolver] AdminController {/admin}:
[Nest] LOG [RouterExplorer] Mapped {/admin/referral-rules/public/:userRole, GET} route
```

### Test 2 : Test manuel avec curl

```bash
# Remplacez YOUR_TOKEN par votre vrai token
curl -H "Authorization: Bearer YOUR_TOKEN" http://localhost:3001/admin/referral-rules/public/USER
```

**Réponse attendue** :
```json
{
  "userRole": "USER",
  "rewards": [
    {
      "id": "...",
      "type": "USER_TO_USER",
      "targetType": "USER",
      "yourReward": 2000,
      ...
    },
    ...
  ]
}
```

### Test 3 : Dans la console du navigateur

1. Actualiser la page `/inviter` (F5)
2. Ouvrir la console (F12)
3. Vous devriez voir :

```
📨 Réponse reçue - Status: 200 OK  ✅ (plus de 404!)
📊 Nombre de rewards: 2  ✅ (plus de 0!)
🎯 Récompenses calculées: {userToUserReward: 2000, ...}  ✅ (plus de 500!)
```

## 💡 Pourquoi ce problème ?

NestJS compile le code TypeScript en JavaScript dans le dossier `dist/`.

Quand vous modifiez le code :
1. **En mode `start:dev`** : Le backend devrait recompiler automatiquement
2. **Si le hot-reload ne fonctionne pas** : Il faut redémarrer manuellement

Dans notre cas, l'endpoint `referral-rules/public/:userRole` a été ajouté mais le backend ne l'a pas détecté.

## 🎯 Après le redémarrage

Une fois le backend redémarré :
1. ✅ L'endpoint `/admin/referral-rules/public/USER` devrait répondre 200 OK
2. ✅ Le frontend devrait recevoir les règles avec `yourReward: 2000`
3. ✅ La page `/inviter` devrait afficher "2000 DA" au lieu de "500 DA"

## 🆘 Si ça ne fonctionne toujours pas

1. **Vérifier que le backend est bien démarré** :
   ```
   GET http://localhost:3001 devrait répondre (pas 404)
   ```

2. **Vérifier les routes disponibles** :
   Regarder les logs du backend au démarrage, chercher "referral-rules"

3. **Vérifier le fichier compilé** :
   ```bash
   # Vérifier que l'endpoint existe dans le fichier compilé
   cat dist/admin/admin.controller.js | Select-String "referral-rules"
   ```

4. **En dernier recours - Recompilation complète** :
   ```bash
   cd dinarus-backend
   Remove-Item -Path "dist" -Recurse -Force
   Remove-Item -Path "node_modules" -Recurse -Force
   npm install
   npm run build
   npm run start:dev
   ```

**ACTION REQUISE** : Redémarrez le backend maintenant ! 🚀

