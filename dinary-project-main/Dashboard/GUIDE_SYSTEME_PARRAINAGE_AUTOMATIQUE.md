# 🎯 Système de Parrainage Automatique - Guide Complet

## 📋 Vue d'Ensemble

Le système de parrainage automatique permet de :
- ✅ Configurer les règles de récompense pour chaque type de parrainage
- ✅ Distribuer automatiquement les bonus quand les conditions sont remplies
- ✅ Récompenser à la fois le parrain ET le filleul (optionnel)
- ✅ Choisir l'action requise (transaction, recharge, vente, inscription)

---

## 🎨 Les 4 Types de Parrainage

### **1. Client → Client** 👤→👤
```
Parrain: CLIENT
Filleul: CLIENT
Action par défaut: Première transaction
Récompense parrain par défaut: 500 DA
Récompense filleul par défaut: 100 DA
```

### **2. Client → Marchand** 👤→🏪
```
Parrain: CLIENT
Filleul: MARCHAND
Action par défaut: Première vente
Récompense parrain par défaut: 1000 DA
Récompense filleul par défaut: 0 DA
```

### **3. Marchand → Client** 🏪→👤
```
Parrain: MARCHAND
Filleul: CLIENT
Action par défaut: Première transaction
Récompense parrain par défaut: 500 DA
Récompense filleul par défaut: 100 DA
```

### **4. Marchand → Marchand** 🏪→🏪
```
Parrain: MARCHAND
Filleul: MARCHAND
Action par défaut: Première vente
Récompense parrain par défaut: 1500 DA
Récompense filleul par défaut: 500 DA
```

---

## 🔄 Comment Ça Fonctionne ?

### **Étape 1 : Configuration (Admin)**
1. L'admin va sur `/admin/parrainages/config`
2. Il voit les 4 règles (ou les initialise)
3. Pour chaque règle, il peut modifier :
   - L'action requise
   - Le montant pour le parrain
   - Le montant pour le filleul
   - Activer/désactiver la règle

### **Étape 2 : Parrainage (Utilisateur)**
1. Un utilisateur A partage son code de parrainage
2. Un utilisateur B s'inscrit avec ce code
3. Le système crée le lien de parrainage (referredById)
4. **Statut** : `pending` (en attente)

### **Étape 3 : Action du Filleul (Automatique)**
Quand le filleul effectue l'action requise :

#### **Si action = FIRST_TRANSACTION** :
```typescript
// Dans le service de transaction, après création :
await adminService.checkAndRewardReferral({
  userId: filleul.id,
  actionType: 'TRANSACTION'
});
```

#### **Si action = FIRST_RECHARGE** :
```typescript
// Dans le service de recharge, après approbation :
await adminService.checkAndRewardReferral({
  userId: filleul.id,
  actionType: 'RECHARGE'
});
```

#### **Si action = FIRST_SALE** :
```typescript
// Dans le service marchand, après première vente :
await adminService.checkAndRewardReferral({
  userId: filleul.id,
  actionType: 'SALE'
});
```

### **Étape 4 : Distribution Automatique**
Le système :
1. ✅ Vérifie que le filleul a un parrain
2. ✅ Récupère la règle appropriée (selon les rôles)
3. ✅ Vérifie que l'action correspond
4. ✅ Vérifie qu'il n'a pas déjà été récompensé
5. ✅ Crée les transactions de bonus
6. ✅ Met à jour les soldes
7. ✅ **Statut** : `rewarded`

---

## 📊 Base de Données

### **Table : ReferralRule**
```sql
id: UUID
referrerType: USER | MERCHANT  -- Type du parrain
refereeType: USER | MERCHANT   -- Type du filleul
requiredAction: FIRST_TRANSACTION | FIRST_RECHARGE | FIRST_SALE | ACCOUNT_CREATED
referrerReward: Float          -- Montant pour le parrain
refereeReward: Float           -- Montant pour le filleul
isActive: Boolean              -- Règle active ou non
description: String            -- Description
createdAt: DateTime
updatedAt: DateTime

UNIQUE (referrerType, refereeType)  -- Une seule règle par combinaison
```

---

## 🛠️ API Endpoints

### **GET /admin/referral-rules**
Récupère toutes les règles configurées
```json
[
  {
    "id": "...",
    "referrerType": "USER",
    "refereeType": "USER",
    "requiredAction": "FIRST_TRANSACTION",
    "referrerReward": 500,
    "refereeReward": 100,
    "isActive": true,
    "description": "Client parraine Client"
  }
]
```

### **POST /admin/referral-rules/initialize**
Initialise les 4 règles par défaut
```json
{
  "message": "Règles par défaut initialisées avec succès",
  "count": 4
}
```

### **PATCH /admin/referral-rules/:id**
Met à jour une règle
```json
{
  "requiredAction": "FIRST_RECHARGE",
  "referrerReward": 750,
  "refereeReward": 150,
  "isActive": true
}
```

---

## 🎯 Scénario Complet

### **Exemple : Client parraine Client**

#### **1. Configuration Admin**
```
Admin configure :
- Action requise: FIRST_TRANSACTION
- Récompense parrain: 500 DA
- Récompense filleul: 100 DA
```

#### **2. Parrainage**
```
Alice (CLIENT) partage son code: DINARY-ABC123
Bob s'inscrit avec le code
→ Bob.referredById = Alice.id
→ Statut: pending
```

#### **3. Première Transaction de Bob**
```
Bob envoie 1000 DA à Charlie
→ Le système appelle checkAndRewardReferral({
    userId: Bob.id,
    actionType: 'TRANSACTION'
  })
```

#### **4. Vérifications**
```
✅ Bob a un parrain (Alice)
✅ Règle trouvée: USER → USER
✅ Action correspond: FIRST_TRANSACTION
✅ Pas de bonus précédent pour ce parrainage
```

#### **5. Distribution Automatique**
```
Transaction 1:
- Type: bonus
- Montant: 500 DA
- De: Wallet Système
- À: Alice (parrain)

Transaction 2:
- Type: bonus
- Montant: 100 DA
- De: Wallet Système
- À: Bob (filleul)

→ Alice reçoit 500 DA
→ Bob reçoit 100 DA
→ Statut: rewarded
```

---

## 🔍 Différences avec l'Ancien Système

### **Avant** ❌
```
- Statuts toujours "completed" (codé en dur)
- Montants fixes (500 ou 1000)
- Pas de récompense pour le filleul
- Pas de choix de l'action requise
- Distribution manuelle uniquement
```

### **Maintenant** ✅
```
- Statuts dynamiques (pending, completed, rewarded)
- Montants configurables par l'admin
- Récompense optionnelle pour le filleul
- 4 actions possibles (transaction, recharge, vente, inscription)
- Distribution automatique
- Configuration complète via interface
```

---

## 📝 À Faire (Prochaines Étapes)

### **Backend** ✅
- [x] Créer le modèle ReferralRule
- [x] Créer les endpoints CRUD
- [x] Créer le système automatique de récompense
- [x] Initialisation des règles par défaut

### **Frontend** (En cours)
- [ ] Créer la page `/admin/parrainages/config`
- [ ] Formulaires de modification
- [ ] Bouton d'initialisation
- [ ] Affichage des règles actives

### **Intégration** (À faire)
- [ ] Appeler `checkAndRewardReferral()` après les transactions
- [ ] Appeler `checkAndRewardReferral()` après les recharges
- [ ] Appeler `checkAndRewardReferral()` après les ventes marchands
- [ ] Tester le système complet

---

## 🧪 Comment Tester

### **Étape 1 : Initialiser les Règles**
```bash
POST http://localhost:3001/admin/referral-rules/initialize
Authorization: Bearer [TOKEN_ADMIN]
```

### **Étape 2 : Vérifier les Règles**
```bash
GET http://localhost:3001/admin/referral-rules
Authorization: Bearer [TOKEN_ADMIN]
```

### **Étape 3 : Modifier une Règle**
```bash
PATCH http://localhost:3001/admin/referral-rules/[ID]
Authorization: Bearer [TOKEN_ADMIN]
Content-Type: application/json

{
  "referrerReward": 750,
  "refereeReward": 150
}
```

### **Étape 4 : Tester le Parrainage**
1. Créer deux utilisateurs de test
2. Le premier parraine le second
3. Le filleul effectue l'action requise
4. Vérifier que les bonus sont distribués

---

## 💡 Conseils

### **Pour les Admins**
- Commencez par initialiser les règles par défaut
- Ajustez les montants selon votre modèle économique
- Testez avec de petits montants d'abord
- Surveillez les transactions de type "bonus"

### **Pour les Développeurs**
- Appelez `checkAndRewardReferral()` après chaque action éligible
- Gérez les erreurs (wallet système manquant, etc.)
- Loggez les récompenses distribuées
- Testez tous les scénarios (CLIENT→CLIENT, CLIENT→MARCHAND, etc.)

---

## ⚠️ Points d'Attention

1. **Wallet Système** : Assurez-vous qu'un admin avec un wallet existe
2. **Double Récompense** : Le système vérifie automatiquement (un seul bonus par parrainage)
3. **Règles Inactives** : Si `isActive = false`, aucun bonus n'est distribué
4. **Action Requise** : Vérifiez que l'action est bien implémentée côté client

---

## 🎯 Résumé

**Ce que vous pouvez configurer** :
- ✅ Montant pour le parrain
- ✅ Montant pour le filleul
- ✅ Action requise (transaction, recharge, vente, inscription)
- ✅ Activer/désactiver une règle

**Ce qui est automatique** :
- ✅ Détection de l'action
- ✅ Vérification des conditions
- ✅ Distribution des bonus
- ✅ Mise à jour des soldes
- ✅ Changement de statut

**Ce qui reste manuel** :
- ❌ Configuration initiale (une seule fois)
- ❌ Ajustement des montants (quand nécessaire)

---

**📌 Prochaine étape : Créer l'interface de configuration !**

