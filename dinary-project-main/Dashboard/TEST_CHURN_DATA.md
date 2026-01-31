# Test des données de Churn

## Comment vérifier que les données sont dynamiques

### 1. Ouvrir la console du navigateur
- Allez sur `/admin/advanced-stats/churn`
- Appuyez sur F12
- Regardez l'onglet "Console"
- Vous devriez voir : `📊 Données de churn reçues du backend:`

### 2. Vérifier ce que le backend retourne

Le backend devrait retourner un objet avec ces propriétés :

```json
{
  "metrics": [
    {
      "name": "Taux de Churn Global",
      "current": 15.5,
      "previous": 12.3,
      "target": 10,
      "trend": "up",
      "risk": "medium"
    },
    // ... autres métriques
  ],
  "segments": [
    {
      "segment": "Nouveaux Utilisateurs",
      "totalUsers": 150,
      "churned": 23,
      "churnRate": 15.3,
      "avgLifetime": 45.2,
      "revenueImpact": 1250.50,
      "riskLevel": "medium"
    },
    // ... autres segments
  ],
  "reasons": [
    {
      "reason": "Inactivité",
      "percentage": 45.5,
      "users": 68,
      "impact": 0,
      "actionable": true
    },
    // ... autres raisons
  ],
  "atRiskUsers": [
    {
      "id": "user-123",
      "name": "John Doe",
      "email": "john@example.com",
      "riskScore": 85.5,
      "lastActivity": "2025-01-15",
      "lifetime": 120,
      "revenue": 450.25,
      "predictedChurn": 15
    },
    // ... autres utilisateurs
  ]
}
```

### 3. Tester directement l'API

Vous pouvez aussi tester l'endpoint directement :

```bash
# Récupérer votre token d'authentification depuis le localStorage
# puis faire :
curl http://localhost:3001/admin/stats/churn \
  -H "Authorization: Bearer VOTRE_TOKEN"
```

### 4. Vérifier les données dans la base

Connectez-vous à votre base de données et vérifiez :

```sql
-- Nombre d'utilisateurs
SELECT COUNT(*) FROM "User" WHERE role != 'ADMIN';

-- Utilisateurs avec leur dernière activité
SELECT 
  u.id, 
  u."fullName",
  MAX(t."createdAt") as last_activity
FROM "User" u
LEFT JOIN "Wallet" w ON w."userId" = u.id
LEFT JOIN "Transaction" t ON (t."senderId" = w.id OR t."receiverId" = w.id)
WHERE u.role != 'ADMIN'
GROUP BY u.id, u."fullName";

-- Utilisateurs inactifs depuis plus de 30 jours
SELECT COUNT(*) 
FROM "User" u
WHERE u.role != 'ADMIN'
  AND u."lastSeen" < NOW() - INTERVAL '30 days';
```

### 5. Si les données semblent vides

Si le backend retourne des tableaux vides ou des valeurs à 0, c'est normal si :
- Vous n'avez pas assez d'utilisateurs dans votre base
- Vos utilisateurs n'ont pas de transactions
- Tous vos utilisateurs sont récents et actifs

**Pour générer des données de test**, vous pouvez créer un script seed qui :
1. Crée plusieurs utilisateurs avec des dates variées
2. Crée des transactions pour certains
3. Simule des périodes d'inactivité

## Indicateurs de données réelles vs statiques

### ✅ Données dynamiques (bonnes)
- Les badges en haut montrent des nombres > 0
- Les valeurs changent quand vous ajoutez des utilisateurs
- Les recommandations s'adaptent aux données
- Le console.log montre des données variées

### ❌ Données statiques (problème)
- Tous les tableaux sont vides : `[]`
- Toutes les valeurs sont à 0
- Les recommandations montrent "Situation stable"
- Le backend ne calcule pas les métriques

## Que faire si les données ne s'affichent pas

1. **Vérifier que le backend est lancé** : `http://localhost:3001`
2. **Vérifier le fichier `.env.local`** : Il doit contenir `NEXT_PUBLIC_API_URL=http://localhost:3001`
3. **Redémarrer le frontend** : `npm run dev`
4. **Vérifier l'authentification** : Vous devez être connecté en tant qu'admin
5. **Regarder la console backend** : Y a-t-il des erreurs ?

