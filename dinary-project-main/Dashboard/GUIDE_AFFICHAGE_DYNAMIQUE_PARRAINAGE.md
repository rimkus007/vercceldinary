# 💫 Affichage Dynamique des Récompenses de Parrainage

## ✅ Ce Qui a Été Créé

### **Backend - Endpoint Public**
```typescript
GET /admin/referral-rules/public/:userRole
```

**Paramètres** :
- `userRole` : `USER` ou `MERCHANT`

**Authentification** : Token JWT (utilisateur ou marchand, pas besoin d'être admin)

**Réponse** :
```json
{
  "userRole": "USER",
  "rewards": [
    {
      "id": "rule-id-1",
      "type": "USER_TO_USER",
      "targetType": "USER",
      "yourReward": 500,      // Ce que VOUS gagnez en parrainant
      "friendReward": 100,    // Ce que votre FILLEUL gagne
      "requiredAction": "FIRST_TRANSACTION",
      "description": "Client parraine Client"
    },
    {
      "id": "rule-id-2",
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

---

## 🎯 Comment Utiliser Côté Frontend

### **Exemple 1 : Afficher les Récompenses (Client)**

```typescript
'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';

export default function ReferralPage() {
  const { token, user } = useAuth();
  const [rewards, setRewards] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchRewards() {
      if (!token || !user) return;
      
      try {
        const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
        const userRole = user.role === 'MERCHANT' ? 'MERCHANT' : 'USER';
        
        const response = await fetch(
          `${baseUrl}/admin/referral-rules/public/${userRole}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        
        if (!response.ok) {
          throw new Error('Impossible de récupérer les récompenses');
        }
        
        const data = await response.json();
        setRewards(data.rewards);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }
    
    fetchRewards();
  }, [token, user]);

  if (loading) return <div>Chargement...</div>;

  return (
    <div className="space-y-6">
      <h1>Parrainez vos Amis</h1>
      
      {rewards.map((reward) => (
        <div key={reward.id} className="bg-white p-6 rounded-lg shadow">
          <h3>
            {reward.targetType === 'USER' 
              ? 'Parrainez un ami' 
              : 'Parrainez un marchand'}
          </h3>
          <p className="text-2xl font-bold text-green-600">
            Vous gagnez : {reward.yourReward} DA
          </p>
          {reward.friendReward > 0 && (
            <p className="text-lg text-blue-600">
              Votre filleul gagne : {reward.friendReward} DA
            </p>
          )}
          <p className="text-sm text-gray-600">
            Action requise : {getActionLabel(reward.requiredAction)}
          </p>
        </div>
      ))}
    </div>
  );
}

function getActionLabel(action: string) {
  switch (action) {
    case 'FIRST_TRANSACTION':
      return 'Première transaction';
    case 'FIRST_RECHARGE':
      return 'Première recharge';
    case 'FIRST_SALE':
      return 'Première vente';
    case 'ACCOUNT_CREATED':
      return 'Création du compte';
    default:
      return action;
  }
}
```

---

## 🎨 Exemple d'Interface

### **Vue Client**
```
┌─────────────────────────────────────────────┐
│  💫 Parrainez vos Amis                      │
├─────────────────────────────────────────────┤
│                                             │
│  ┌─────────────────────────────────────┐   │
│  │ 👤 Parrainez un Ami                 │   │
│  │                                     │   │
│  │ Vous gagnez : 500 DA               │   │
│  │ Votre filleul gagne : 100 DA       │   │
│  │                                     │   │
│  │ ✅ Action requise :                 │   │
│  │ Première transaction                │   │
│  │                                     │   │
│  │ [Partager mon code]                │   │
│  └─────────────────────────────────────┘   │
│                                             │
│  ┌─────────────────────────────────────┐   │
│  │ 🏪 Parrainez un Marchand            │   │
│  │                                     │   │
│  │ Vous gagnez : 1000 DA              │   │
│  │ Votre filleul gagne : 0 DA         │   │
│  │                                     │   │
│  │ ✅ Action requise :                 │   │
│  │ Première vente                      │   │
│  │                                     │   │
│  │ [Partager mon code]                │   │
│  └─────────────────────────────────────┘   │
└─────────────────────────────────────────────┘
```

---

## 🔄 Workflow Complet

### **1. Admin Configure**
```
Admin va sur /admin/parrainages/config
    ↓
Modifie "Client → Client" : 500 DA → 750 DA
    ↓
Sauvegarde automatique
```

### **2. Client Voit la Mise à Jour**
```
Client actualise sa page de parrainage
    ↓
fetch('/admin/referral-rules/public/USER')
    ↓
Reçoit : { yourReward: 750 }  // Nouveau montant
    ↓
Affichage : "Vous gagnez : 750 DA"
```

### **3. Mise à Jour Automatique**
```
Si l'admin change de 750 DA → 1000 DA
    ↓
Le client rafraîchit sa page
    ↓
Affichage : "Vous gagnez : 1000 DA"  // À jour !
```

---

## 📱 Exemple Complet d'Interface Client

Je vais créer une page complète pour vous montrer :

```typescript
// Dashboard/app/(client)/parrainage/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, Store, Copy, Check } from 'lucide-react';

interface ReferralReward {
  id: string;
  type: string;
  targetType: 'USER' | 'MERCHANT';
  yourReward: number;
  friendReward: number;
  requiredAction: string;
  description: string;
}

export default function ClientReferralPage() {
  const { token, user } = useAuth();
  const [rewards, setRewards] = useState<ReferralReward[]>([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    async function fetchRewards() {
      if (!token || !user) return;
      
      try {
        const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
        const response = await fetch(
          `${baseUrl}/admin/referral-rules/public/USER`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        
        if (response.ok) {
          const data = await response.json();
          setRewards(data.rewards);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }
    
    fetchRewards();
  }, [token, user]);

  const copyReferralCode = () => {
    if (user?.referralCode) {
      navigator.clipboard.writeText(user.referralCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const getActionLabel = (action: string) => {
    const labels: Record<string, string> = {
      FIRST_TRANSACTION: 'Première transaction',
      FIRST_RECHARGE: 'Première recharge',
      FIRST_SALE: 'Première vente',
      ACCOUNT_CREATED: 'Création du compte',
    };
    return labels[action] || action;
  };

  if (loading) {
    return <div className="p-6">Chargement...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="bg-gradient-to-r from-dinary-turquoise to-blue-500 text-white p-8 rounded-lg mb-6">
          <h1 className="text-3xl font-bold mb-2">💫 Parrainez vos Amis</h1>
          <p className="text-lg opacity-90">
            Gagnez des récompenses en invitant vos amis !
          </p>
          
          {/* Code de Parrainage */}
          <div className="mt-6 bg-white bg-opacity-20 backdrop-blur-sm p-4 rounded-lg">
            <p className="text-sm mb-2">Votre code de parrainage :</p>
            <div className="flex items-center gap-2">
              <code className="text-2xl font-bold">{user?.referralCode || 'DINARY-XXXXX'}</code>
              <Button
                onClick={copyReferralCode}
                variant="ghost"
                size="sm"
                className="text-white hover:bg-white hover:bg-opacity-20"
              >
                {copied ? <Check className="h-5 w-5" /> : <Copy className="h-5 w-5" />}
              </Button>
            </div>
          </div>
        </div>

        {/* Récompenses Disponibles */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {rewards.map((reward) => (
            <Card key={reward.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50">
                <div className="flex items-center gap-3">
                  {reward.targetType === 'USER' ? (
                    <Users className="h-8 w-8 text-blue-600" />
                  ) : (
                    <Store className="h-8 w-8 text-purple-600" />
                  )}
                  <CardTitle>
                    {reward.targetType === 'USER' 
                      ? 'Parrainez un Ami' 
                      : 'Parrainez un Marchand'}
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div>
                    <p className="text-3xl font-bold text-green-600">
                      {reward.yourReward} DA
                    </p>
                    <p className="text-sm text-gray-600">Vous gagnez</p>
                  </div>
                  
                  {reward.friendReward > 0 && (
                    <div>
                      <p className="text-xl font-semibold text-blue-600">
                        + {reward.friendReward} DA
                      </p>
                      <p className="text-sm text-gray-600">
                        pour votre filleul
                      </p>
                    </div>
                  )}
                  
                  <div className="pt-4 border-t">
                    <p className="text-sm font-medium text-gray-700 mb-1">
                      ✅ Action requise :
                    </p>
                    <p className="text-sm text-gray-600">
                      {getActionLabel(reward.requiredAction)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {rewards.length === 0 && (
          <Card>
            <CardContent className="p-12 text-center text-gray-500">
              <p>Aucune récompense de parrainage disponible pour le moment.</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
```

---

## 🎯 Avantages

### **1. Mise à Jour Instantanée** ✅
L'admin change 500 DA → 1000 DA, le client voit 1000 DA immédiatement (après rafraîchissement).

### **2. Aucun Code en Dur** ✅
Plus besoin de modifier le code frontend quand les montants changent.

### **3. Centralisé** ✅
Une seule source de vérité : la table `ReferralRule` dans la base de données.

### **4. Cohérent** ✅
Les montants affichés côté client/marchand sont exactement les mêmes que ceux configurés par l'admin.

---

## 📋 Récapitulatif

**Admin change les règles** :
```
/admin/parrainages/config
↓
Modifie "Client → Client" : 500 DA → 750 DA
↓
Base de données mise à jour
```

**Client voit la mise à jour** :
```
/parrainage
↓
fetch('/admin/referral-rules/public/USER')
↓
Affichage : "Vous gagnez : 750 DA"
```

**Marchand voit la mise à jour** :
```
/parrainage
↓
fetch('/admin/referral-rules/public/MERCHANT')
↓
Affichage : "Vous gagnez : 1500 DA" (pour Marchand → Marchand)
```

---

## 🚀 Prochaine Étape

Je peux créer une page complète de parrainage pour :
1. **Clients** : `/app/(client)/parrainage/page.tsx`
2. **Marchands** : `/app/(merchant)/parrainage/page.tsx`

Avec affichage dynamique des récompenses qui se met à jour automatiquement quand l'admin change la configuration !

**Voulez-vous que je crée ces pages maintenant ?** 🎨

