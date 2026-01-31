# 🎯 Guide : Création d'Utilisateurs depuis l'Admin

## ✅ Ce qui a été fait

### Backend
1. **3 nouveaux endpoints** dans `/admin` :
   - `GET /admin/check-email/:email` - Vérifie si un email existe
   - `POST /admin/create-user` - Crée un client
   - `POST /admin/create-merchant` - Crée un marchand

2. **Logique implémentée** :
   - ✅ Vérification d'email en temps réel
   - ✅ Hashage sécurisé des mots de passe (bcrypt)
   - ✅ Création automatique du wallet
   - ✅ Génération d'username unique
   - ✅ Pour les marchands : création du User + profil Merchant

### Frontend
- **Page mise à jour** : `/admin/control-center/user-creation`
- **Fonctionnalités** :
  - 2 sections : "Créer un Client" et "Créer un Marchand"
  - Validation en temps réel de l'email
  - Formulaires séparés pour clients et marchands
  - Messages de succès/erreur clairs

## 🚀 Comment tester

### 1. Redémarrer le backend
```bash
cd dinarus-backend
npm run start:dev
```

Attendez de voir :
```
[Nest] LOG [RoutesResolver] AdminController {/admin}:
[Nest] LOG [RouterExplorer] Mapped {/admin/check-email/:email, GET} route
[Nest] LOG [RouterExplorer] Mapped {/admin/create-user, POST} route
[Nest] LOG [RouterExplorer] Mapped {/admin/create-merchant, POST} route
```

### 2. Accéder à la page
1. Se connecter en tant qu'admin sur le Dashboard
2. Aller à : `/admin/control-center/user-creation`

### 3. Créer un client
1. Cliquer sur "Créer un Client"
2. Remplir le formulaire :
   - Prénom / Nom
   - Email (sera vérifié automatiquement)
   - Téléphone
   - Mot de passe (min. 6 caractères)
   - Adresse (optionnel)
3. Cliquer sur "Créer le Compte"
4. ✅ Message de succès : "Client créé avec succès !"

### 4. Créer un marchand
1. Cliquer sur "Créer un Marchand"
2. Remplir le formulaire :
   - Prénom / Nom
   - Email (sera vérifié automatiquement)
   - Téléphone
   - Mot de passe
   - **Nom de l'entreprise**
   - **Type d'activité**
   - Numéro de registre (optionnel)
   - Adresse (optionnel)
3. Cliquer sur "Créer le Compte"
4. ✅ Message de succès : "Marchand créé avec succès !"

## 🔍 Vérifications

### Dans la base de données
Après création, vérifiez que :
- Un `User` a été créé avec le bon `role` (USER ou MERCHANT)
- Un `Wallet` a été créé automatiquement (balance = 0)
- Pour les marchands : un profil `Merchant` a été créé

### Dans l'interface
- Le client peut se connecter sur l'app client avec ses identifiants
- Le marchand peut se connecter sur l'app marchand avec ses identifiants
- Le wallet est visible et fonctionnel

## 🎨 Features

### Vérification d'email
- ⏱️ Vérification en temps réel (au blur)
- ✅ Icône verte si l'email est disponible
- ❌ Icône rouge + message d'erreur si l'email existe déjà
- 🔄 Animation de chargement pendant la vérification

### Validation
- Tous les champs requis sont validés
- Email : format valide + unicité
- Mot de passe : minimum 6 caractères
- Confirmation de mot de passe : doit correspondre

### Options avancées
- **Statut initial** : Actif / En attente / Suspendu
- **Email de bienvenue** : À implémenter (checkbox prête)
- **Vérification email requise** : Définit `isVerified`

## 📊 Structure des données

### Client créé
```typescript
{
  id: "uuid",
  fullName: "Prénom Nom",
  email: "email@example.com",
  phoneNumber: "+213 555 123 456",
  role: "USER",
  status: "active",
  isVerified: true,
  wallet: { id: "uuid", balance: 0 }
}
```

### Marchand créé
```typescript
{
  id: "uuid",
  fullName: "Prénom Nom",
  email: "email@example.com",
  phoneNumber: "+213 555 123 456",
  role: "MERCHANT",
  status: "pending",
  isVerified: true,
  profile: {
    businessName: "Nom Commerce",
    businessType: "Type d'activité",
    isApproved: false
  },
  wallet: { id: "uuid", balance: 0 }
}
```

## ⚠️ Notes importantes

1. **Username** : Généré automatiquement à partir de l'email + timestamp
2. **Mot de passe** : Hashé avec bcrypt (10 rounds)
3. **Wallet** : Créé automatiquement pour tous les utilisateurs
4. **Profil marchand** : Créé uniquement pour les MERCHANT

## 🐛 En cas d'erreur

### "Cet email est déjà utilisé"
- L'email existe déjà dans la base de données
- Utilisez un autre email

### Erreur 401 Unauthorized
- Le token admin a expiré
- Reconnectez-vous en tant qu'admin

### Erreur backend
- Vérifiez que le backend est démarré
- Vérifiez les logs du backend pour plus de détails
- Vérifiez que la base de données est accessible

## 🎉 C'est prêt !

Vous pouvez maintenant créer des clients et des marchands directement depuis l'admin avec toutes les validations et vérifications nécessaires !

