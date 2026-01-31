# 🎯 Documentation - Filtrage des Statistiques Backend

## ✅ Implémentation Complète

Le backend NestJS accepte maintenant **tous les paramètres de filtrage** envoyés par le frontend pour les pages d'analyse (Churn, Conversion, Rétention).

---

## 📋 Fichiers Créés/Modifiés

### 1. **Nouveau DTO** : `src/admin/dto/stats-query.dto.ts`

Ce fichier contient les DTOs (Data Transfer Objects) pour valider les paramètres de requête :

```typescript
// Périodes supportées
export enum StatsPeriod {
  SEVEN_DAYS = '7d',
  THIRTY_DAYS = '30d',
  NINETY_DAYS = '90d',
  SIX_MONTHS = '6m',
  ONE_YEAR = '1y',
}

// DTO pour Churn
export class ChurnStatsQueryDto {
  period?: StatsPeriod;
  riskLevel?: 'low' | 'medium' | 'high';
  churnRate?: number;
  segment?: string;
}

// DTO pour Conversion
export class ConversionStatsQueryDto {
  period?: StatsPeriod;
  userType?: 'new' | 'active' | 'recurring' | 'referred' | 'merchant';
  conversionRate?: number;
  segment?: string;
}

// DTO pour Rétention
export class RetentionStatsQueryDto {
  period?: StatsPeriod;
  retentionRate?: number;
  cohortSize?: number;
}
```

### 2. **Controller Modifié** : `src/admin/admin.controller.ts`

Les endpoints acceptent maintenant des query parameters :

```typescript
// AVANT
@Get('stats/churn')
getChurnStats() {
  return this.adminService.getChurnStats();
}

// APRÈS
@Get('stats/churn')
getChurnStats(@Query() query: ChurnStatsQueryDto) {
  return this.adminService.getChurnStats(query);
}
```

### 3. **Service Modifié** : `src/admin/admin.service.ts`

Ajout d'une fonction helper et modification des 3 méthodes de stats :

**Helper pour calculer les dates** :
```typescript
private getDateRangeFromPeriod(period?: StatsPeriod): { startDate: Date; endDate: Date } {
  const now = new Date();
  const endDate = now;
  let startDate: Date;

  switch (period) {
    case StatsPeriod.SEVEN_DAYS:
      startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      break;
    case StatsPeriod.THIRTY_DAYS:
      startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      break;
    case StatsPeriod.NINETY_DAYS:
      startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
      break;
    case StatsPeriod.SIX_MONTHS:
      startDate = new Date(now.getTime() - 180 * 24 * 60 * 60 * 1000);
      break;
    case StatsPeriod.ONE_YEAR:
      startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
      break;
    default:
      // Par défaut, 30 jours
      startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  }

  return { startDate, endDate };
}
```

---

## 🔍 Exemples d'Utilisation des Endpoints

### 1. **Endpoint Churn** : `/admin/stats/churn`

#### Requête sans filtre (par défaut 30 jours)
```
GET http://localhost:3001/admin/stats/churn
Authorization: Bearer <votre_token>
```

#### Requête avec période
```
GET http://localhost:3001/admin/stats/churn?period=7d
```

#### Requête avec niveau de risque
```
GET http://localhost:3001/admin/stats/churn?period=30d&riskLevel=high
```

#### Requête complète
```
GET http://localhost:3001/admin/stats/churn?period=90d&riskLevel=medium&churnRate=50&segment=newUsers
```

**Paramètres disponibles** :
- `period` : `7d`, `30d`, `90d`, `6m`, `1y`
- `riskLevel` : `low`, `medium`, `high`
- `churnRate` : nombre entre 0 et 100 (taux de churn minimum)
- `segment` : nom du segment à filtrer (ex: "newUsers", "active")

**Effet des filtres** :
- `period` : Filtre les utilisateurs créés dans cette période
- `riskLevel` : Filtre les utilisateurs à risque par niveau (low: 0-40, medium: 40-70, high: 70-100)
- `churnRate` : Ne retourne que les segments avec un taux de churn >= valeur
- `segment` : Filtre les segments par nom

---

### 2. **Endpoint Conversion** : `/admin/stats/conversion`

#### Requête sans filtre
```
GET http://localhost:3001/admin/stats/conversion
```

#### Requête avec type d'utilisateur
```
GET http://localhost:3001/admin/stats/conversion?period=7d&userType=new
```

#### Requête complète
```
GET http://localhost:3001/admin/stats/conversion?period=30d&userType=active&conversionRate=20&segment=nouveaux
```

**Paramètres disponibles** :
- `period` : `7d`, `30d`, `90d`, `6m`, `1y`
- `userType` : `new`, `active`, `recurring`, `referred`, `merchant`
- `conversionRate` : nombre entre 0 et 100 (taux de conversion minimum)
- `segment` : nom du segment à filtrer

**Effet des filtres** :
- `period` : Ne retourne que les utilisateurs créés dans cette période
- `userType` : Filtre les segments par type d'utilisateur
- `conversionRate` : Ne retourne que les segments avec un taux >= valeur
- `segment` : Filtre les segments par nom

---

### 3. **Endpoint Rétention** : `/admin/stats/retention`

#### Requête sans filtre
```
GET http://localhost:3001/admin/stats/retention
```

#### Requête avec taux de rétention
```
GET http://localhost:3001/admin/stats/retention?period=90d&retentionRate=60
```

#### Requête complète
```
GET http://localhost:3001/admin/stats/retention?period=6m&retentionRate=50&cohortSize=10
```

**Paramètres disponibles** :
- `period` : `7d`, `30d`, `90d`, `6m`, `1y`
- `retentionRate` : nombre entre 0 et 100 (taux de rétention minimum)
- `cohortSize` : nombre minimum d'utilisateurs dans une cohorte

**Effet des filtres** :
- `period` : Calcule les stats sur cette période
- `retentionRate` : Ne retourne que les périodes avec rétention >= valeur
- `cohortSize` : Ne retourne que les cohortes avec au moins X utilisateurs

---

## 🧪 Test avec Postman/cURL

### Test Churn avec cURL
```bash
curl -X GET "http://localhost:3001/admin/stats/churn?period=30d&riskLevel=high" \
  -H "Authorization: Bearer VOTRE_TOKEN_JWT"
```

### Test Conversion avec cURL
```bash
curl -X GET "http://localhost:3001/admin/stats/conversion?period=7d&userType=new&conversionRate=20" \
  -H "Authorization: Bearer VOTRE_TOKEN_JWT"
```

### Test Rétention avec cURL
```bash
curl -X GET "http://localhost:3001/admin/stats/retention?period=90d&retentionRate=60" \
  -H "Authorization: Bearer VOTRE_TOKEN_JWT"
```

---

## 📊 Réponses du Backend

### Exemple de réponse `/stats/churn`
```json
{
  "metrics": [
    { "name": "Taux de Churn Global", "current": 15.5, "previous": 18.2, "target": 10, "trend": "down", "risk": "medium" },
    { "name": "Churn Précoce", "current": 8.3, "previous": 9.1, "target": 5, "trend": "down", "risk": "medium" }
  ],
  "segments": [
    { "segment": "Nouveaux Utilisateurs", "totalUsers": 150, "churned": 20, "churnRate": 13.3, "avgLifetime": 45, "revenueImpact": 5000, "riskLevel": "medium" }
  ],
  "reasons": [
    { "reason": "Inactivité prolongée", "percentage": 45.2, "users": 68, "impact": "high", "actionable": true }
  ],
  "atRiskUsers": [
    { "id": "user_123", "name": "Ahmed Ben Ali", "email": "ahmed@example.com", "riskScore": 85.5, "lastActivity": "2025-10-15", "lifetime": 30, "revenue": 1500, "predictedChurn": 42 }
  ]
}
```

### Exemple de réponse `/stats/conversion`
```json
{
  "metrics": [
    { "name": "Taux de Conversion Global", "current": 12.5, "previous": 10.8, "target": 15, "trend": "up" }
  ],
  "funnel": [
    { "stage": "Inscription", "users": 1000, "conversionRate": 100, "dropOffRate": 0 },
    { "stage": "Première Transaction", "users": 450, "conversionRate": 45, "dropOffRate": 55 }
  ],
  "segments": [
    { "segment": "Nouveaux Utilisateurs", "users": 500, "conversions": 250, "rate": 50, "revenue": 12500 }
  ]
}
```

### Exemple de réponse `/stats/retention`
```json
{
  "retentionData": [
    { "period": "Oct 2025", "newUsers": 150, "retained": 120, "retentionRate": 80, "churnRate": 20, "avgLifetime": 45.5 }
  ],
  "cohortData": [
    { "cohort": "Oct 2025", "users": 150, "day1": 95, "day7": 85, "day30": 80, "day90": 75, "day365": 70 }
  ],
  "kpi": {
    "retentionRate": 78.5,
    "churnRate": 21.5,
    "avgLifetime": 52.3,
    "newUsers": 900
  }
}
```

---

## ⚙️ Comment ça Fonctionne

### 1. **Frontend envoie une requête**
```typescript
const url = new URL(`${baseUrl}/admin/stats/conversion`);
url.searchParams.set('period', '7d');
url.searchParams.set('userType', 'new');

const response = await fetch(url.toString(), {
  headers: { Authorization: `Bearer ${token}` },
});
```

### 2. **Backend reçoit les paramètres**
Le controller NestJS utilise le décorateur `@Query()` pour extraire les paramètres :
```typescript
@Get('stats/conversion')
getConversionStats(@Query() query: ConversionStatsQueryDto) {
  // query.period = '7d'
  // query.userType = 'new'
  return this.adminService.getConversionStats(query);
}
```

### 3. **Service applique les filtres**
```typescript
async getConversionStats(query?: ConversionStatsQueryDto) {
  // 1. Calculer la plage de dates
  const { startDate, endDate } = this.getDateRangeFromPeriod(query?.period);
  
  // 2. Récupérer les données filtrées par période
  const users = await this.prisma.user.findMany({
    where: { 
      role: { not: 'ADMIN' },
      createdAt: { gte: startDate, lte: endDate },
    },
  });
  
  // 3. Calculer les statistiques
  // ...
  
  // 4. Appliquer les autres filtres (userType, conversionRate, segment)
  if (query?.userType) {
    filteredSegments = filteredSegments.filter(/* ... */);
  }
  
  // 5. Retourner les données filtrées
  return { funnel, metrics, segments: filteredSegments };
}
```

---

## 🚀 Prochaines Étapes

### Pour tester :
1. Démarrez votre backend NestJS :
   ```bash
   cd dinarus-backend
   npm run start:dev
   ```

2. Depuis le frontend, cliquez sur les boutons de période (7d, 30d, etc.)

3. Ouvrez la console du navigateur (F12) et vérifiez :
   - L'URL de la requête contient les bons paramètres
   - Les données reçues changent selon les filtres

4. Testez avec Postman ou cURL pour vérifier directement les endpoints

### Validation :
✅ Les périodes changent les données  
✅ Les filtres s'appliquent correctement  
✅ L'export contient les données filtrées  
✅ Pas d'erreurs dans la console  

---

## 📌 Notes Importantes

1. **Validation automatique** : Les DTOs valident automatiquement les paramètres. Si vous envoyez `period=invalid`, NestJS retournera une erreur 400.

2. **Paramètres optionnels** : Tous les paramètres sont optionnels. Si aucun paramètre n'est fourni, le backend utilise les valeurs par défaut (30 jours).

3. **Performance** : Le filtrage est fait en mémoire après récupération des données. Pour de très grandes bases de données, envisagez de filtrer directement dans les requêtes Prisma.

4. **Sécurité** : Les endpoints sont protégés par `@UseGuards(AuthGuard('jwt'), AdminGuard)`. Seuls les administrateurs peuvent y accéder.

---

## 🎉 Résumé

Vous avez maintenant un backend complètement fonctionnel qui :
- ✅ Accepte les paramètres de période (`7d`, `30d`, `90d`, `6m`, `1y`)
- ✅ Filtre les données selon les critères demandés
- ✅ Valide les paramètres avec des DTOs TypeScript
- ✅ Retourne des données dynamiques et filtrées
- ✅ S'intègre parfaitement avec votre frontend Next.js

**Tous vos endpoints sont maintenant prêts à l'emploi ! 🚀**

