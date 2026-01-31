# 🎯 Guide d'Utilisation - Système de Parrainage Automatique

## 🚀 Démarrage Rapide (Admin)

### **Étape 1 : Accéder à la Configuration**
```
1. Connectez-vous en tant qu'admin
2. Allez sur : http://localhost:3000/admin/parrainages
3. Cliquez sur le bouton "⚙️ Configuration" en haut à droite
```

### **Étape 2 : Initialiser les Règles**
```
1. Sur la page de configuration, cliquez sur "Initialiser les Règles par Défaut"
2. 4 règles sont créées automatiquement :
   - Client → Client
   - Client → Marchand
   - Marchand → Client
   - Marchand → Marchand
```

### **Étape 3 : Personnaliser les Règles**
Pour chaque règle, vous pouvez modifier :
- **Action Requise** : Ce que le filleul doit faire
  - Première transaction
  - Première recharge
  - Première vente
  - Création du compte

- **Récompense Parrain** : Combien le parrain gagne (en DA)
- **Récompense Filleul** : Combien le filleul gagne (en DA)
- **Actif/Inactif** : Activer ou désactiver la règle

### **Étape 4 : Sauvegarder**
Les modifications sont **enregistrées automatiquement** quand vous changez une valeur !

---

## 📊 Exemple de Configuration

### **Client parraine Client**
```
Action requise: Première transaction
Récompense parrain: 500 DA
Récompense filleul: 100 DA
Statut: Actif ✅
```

**Ce qui se passe** :
1. Alice (client) partage son code : `DINARY-ABC123`
2. Bob s'inscrit avec ce code
3. **Bob fait sa première transaction** (envoie 1000 DA à quelqu'un)
4. 🎉 **Automatique** :
   - Alice reçoit **500 DA** sur son wallet
   - Bob reçoit **100 DA** sur son wallet
   - Statut passe à "Récompensé"

---

## 🎨 Interface de Configuration

### **Vue d'ensemble**
```
┌────────────────────────────────────────────────────┐
│  ⚙️ Configuration des Parrainages                  │
│  [🔄 Actualiser]  [⚙️ Initialiser les Règles]      │
├────────────────────────────────────────────────────┤
│                                                     │
│  ┌─────────────────┐  ┌─────────────────┐         │
│  │ 👤 → 👤         │  │ 👤 → 🏪         │         │
│  │ Client→Client   │  │ Client→Marchand │         │
│  │                 │  │                 │         │
│  │ Action: [▼]     │  │ Action: [▼]     │         │
│  │ Parrain: 500 DA │  │ Parrain: 1000DA │         │
│  │ Filleul: 100 DA │  │ Filleul: 0 DA   │         │
│  │ [Actif ✅]      │  │ [Actif ✅]      │         │
│  └─────────────────┘  └─────────────────┘         │
│                                                     │
│  ┌─────────────────┐  ┌─────────────────┐         │
│  │ 🏪 → 👤         │  │ 🏪 → 🏪         │         │
│  │ Marchand→Client │  │ Marchand→March. │         │
│  └─────────────────┘  └─────────────────┘         │
└────────────────────────────────────────────────────┘
```

### **Options de Chaque Carte**
```
┌─────────────────────────────────┐
│ 👤 → 👤 Client → Client  [Actif]│
├─────────────────────────────────┤
│ Action Requise:                 │
│ [Première transaction    ▼]     │
│                                  │
│ Récompense pour le Parrain:     │
│ [500] DA                         │
│                                  │
│ Récompense pour le Filleul:     │
│ [100] DA                         │
│                                  │
│ 📄 Résumé:                       │
│ Quand un client parrainé        │
│ effectue sa première            │
│ transaction, le parrain reçoit  │
│ 500 DA et le filleul reçoit     │
│ 100 DA.                          │
└─────────────────────────────────┘
```

---

## 🔄 Workflow Complet

### **1. Configuration (Une fois)**
```
Admin initialise les règles
    ↓
Admin personnalise les montants
    ↓
Admin active/désactive selon besoins
```

### **2. Parrainage (Utilisateur)**
```
Parrain partage son code
    ↓
Filleul s'inscrit avec le code
    ↓
Statut: En attente ⏳
```

### **3. Action du Filleul**
```
Filleul effectue l'action requise
(Transaction, Recharge, Vente, ou Inscription)
    ↓
Système vérifie automatiquement
    ↓
Conditions remplies? ✅
```

### **4. Distribution Automatique**
```
Système crée les transactions de bonus
    ↓
Parrain reçoit sa récompense 💰
    ↓
Filleul reçoit sa récompense (si configuré) 💰
    ↓
Statut: Récompensé 🎉
```

---

## 📋 Cas d'Usage Recommandés

### **Encourager les Transactions**
```
Action: Première transaction
Parrain: 500 DA
Filleul: 100 DA
```
**Objectif** : Inciter les nouveaux utilisateurs à utiliser l'app

### **Encourager les Recharges**
```
Action: Première recharge
Parrain: 300 DA
Filleul: 50 DA
```
**Objectif** : Inciter les utilisateurs à mettre de l'argent

### **Recruter des Marchands**
```
Action: Première vente
Parrain (Client): 1000 DA
Filleul (Marchand): 500 DA
```
**Objectif** : Développer le réseau de marchands

### **Croissance Rapide**
```
Action: Création du compte
Parrain: 200 DA
Filleul: 50 DA
```
**Objectif** : Maximiser les inscriptions

---

## ⚠️ Points d'Attention

### **1. Solde du Wallet Système**
Le système distribue les bonus depuis le wallet d'un admin. Assurez-vous qu'il a assez de fonds !

### **2. Une Seule Récompense par Parrainage**
Chaque parrainage ne peut être récompensé qu'une seule fois. Même si le filleul fait plusieurs transactions, le parrain ne gagne qu'une fois.

### **3. Règles Actives/Inactives**
Si vous désactivez une règle, aucun nouveau bonus ne sera distribué pour cette combinaison (mais les règles existantes restent).

### **4. Modification des Règles**
Les modifications s'appliquent aux **nouveaux parrainages uniquement**. Les parrainages en cours gardent les anciennes conditions.

---

## 🎯 Stratégies de Configuration

### **Stratégie "Généreux"** 💸
```
Client → Client: 500 DA + 200 DA
Client → Marchand: 1500 DA + 500 DA
Marchand → Client: 700 DA + 200 DA
Marchand → Marchand: 2000 DA + 1000 DA
```
**Avantage** : Croissance rapide, forte motivation
**Inconvénient** : Coût élevé

### **Stratégie "Équilibré"** ⚖️
```
Client → Client: 300 DA + 100 DA
Client → Marchand: 800 DA + 200 DA
Marchand → Client: 400 DA + 100 DA
Marchand → Marchand: 1200 DA + 400 DA
```
**Avantage** : Bon équilibre coût/motivation
**Inconvénient** : Croissance modérée

### **Stratégie "Conservateur"** 💰
```
Client → Client: 200 DA + 50 DA
Client → Marchand: 500 DA + 0 DA
Marchand → Client: 250 DA + 50 DA
Marchand → Marchand: 800 DA + 200 DA
```
**Avantage** : Faible coût
**Inconvénient** : Motivation limitée

---

## 📊 Suivi des Performances

### **Page Parrainages Principale**
```
Allez sur /admin/parrainages pour voir :
- Total des parrainages
- En attente vs Récompensés
- Top parrains
- Historique complet
```

### **Indicateurs à Surveiller**
- **Taux de conversion** : % de parrainages qui deviennent récompensés
- **Coût moyen par parrainage** : Combien vous dépensez en moyenne
- **ROI** : Valeur apportée par les filleuls vs coût des bonus

---

## 🚀 Prochaines Étapes

Après avoir configuré le système :

1. ✅ Initialisez les règles
2. ✅ Personnalisez les montants
3. ✅ Testez avec un parrainage de test
4. ✅ Communiquez les nouvelles conditions aux utilisateurs
5. ✅ Surveillez les performances
6. ✅ Ajustez si nécessaire

---

## 💡 Astuces

### **Tester sans Risque**
Créez deux comptes de test et faites un parrainage pour vérifier que tout fonctionne avant de lancer officiellement.

### **Communiquer Clairement**
Expliquez aux utilisateurs :
- Comment partager leur code
- Combien ils peuvent gagner
- Quelles actions sont requises

### **Optimiser les Montants**
Commencez conservateur, puis augmentez progressivement si la croissance n'est pas assez rapide.

### **Utiliser les Actions Graduelles**
- **Inscription** : Bonus immédiat mais petit
- **Transaction** : Bonus moyen, prouve l'engagement
- **Recharge** : Bonus plus élevé, montre la confiance

---

**🎉 Votre système de parrainage automatique est maintenant prêt ! Bonne croissance !**

