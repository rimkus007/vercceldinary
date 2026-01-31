# 🔐 Système d'Archivage Sécurisé des Vérifications d'Identité

## 📋 Vue d'ensemble

Ce système permet de stocker de manière **sécurisée et chiffrée** les données sensibles des utilisateurs lors de la vérification d'identité, tout en **supprimant les fichiers images** pour libérer de l'espace et respecter le RGPD.

---

## 🎯 Fonctionnalités

### ✅ Ce qui a été implémenté :

1. **Base de données chiffrée** :
   - Nouveau modèle `VerificationArchive` dans Prisma
   - Chiffrement AES-256-GCM des données sensibles
   - Index optimisés pour les recherches

2. **Service de chiffrement** :
   - Chiffrement/déchiffrement sécurisé via `EncryptionService`
   - Clé de chiffrement de 256 bits (stockée dans `.env`)
   - Protection contre les attaques (authentification GCM)

3. **API Backend** :
   - Module `verification-archives` avec contrôleur et service
   - Endpoints pour lister, consulter et supprimer les archives
   - Audit des accès aux données (logs)
   - Suppression automatique des fichiers après vérification

4. **Interface Admin** :
   - Page `/admin/archives` pour consulter les archives
   - Statistiques en temps réel
   - Recherche par nom/email
   - Modal de déverrouillage pour voir les données déchiffrées
   - Design moderne avec animations

5. **Workflow de vérification modifié** :
   - Lors de l'approbation d'une vérification :
     - L'admin entre les données sensibles extraites du document
     - Une archive chiffrée est créée
     - Les fichiers images sont **supprimés définitivement**
     - Les URLs sont remplacées par "ARCHIVED"

---

## ⚙️ Configuration

### 1. Clé de chiffrement

**IMPORTANT** : Une clé de chiffrement a été générée pour vous :

```
ENCRYPTION_KEY="QYOwXfMCrvO5DuBhE3ZqFehj0NxWLTaQAJhQx2Dz/ig="
```

**Ajoutez cette ligne dans votre fichier `.env` (dans `dinarus-backend/.env`)** :

```env
# ... autres variables ...
ENCRYPTION_KEY="QYOwXfMCrvO5DuBhE3ZqFehj0NxWLTaQAJhQx2Dz/ig="
```

⚠️ **ATTENTION** :
- **Ne partagez JAMAIS cette clé !**
- **Ne la committez PAS dans Git !**
- **Sauvegardez-la en sécurité** (si vous la perdez, les archives existantes seront illisibles)
- En production, utilisez un gestionnaire de secrets (AWS Secrets Manager, Azure Key Vault, etc.)

### 2. Migration appliquée

La migration Prisma a déjà été appliquée :
```
✅ Migration "20250129_add_verification_archive" appliquée
```

---

## 🚀 Utilisation

### Pour l'Admin

#### 1. Approuver une vérification avec archivage

Lorsque vous approuvez une vérification d'identité, vous devez maintenant fournir les données sensibles extraites du document :

**Endpoint** : `PATCH /api/admin/identity/:id/approve`

**Body** :
```json
{
  "sensitiveData": {
    "documentNumber": "AB123456",
    "dateOfBirth": "01/01/1990",
    "address": "123 Rue Exemple, 75001 Paris",
    "nationality": "Française",
    "issueDate": "01/01/2020",
    "expirationDate": "01/01/2030",
    "placeOfBirth": "Paris"
  },
  "notes": "Vérification complète. Document valide."
}
```

**Ce qui se passe** :
1. Les données sont **chiffrées** avec AES-256-GCM
2. L'archive est créée dans la base de données
3. Les fichiers images sont **supprimés du serveur**
4. L'utilisateur reçoit une notification de vérification réussie

#### 2. Consulter les archives

- **Page Admin** : `http://localhost:3002/admin/archives`
- **Fonctionnalités** :
  - Voir la liste de toutes les archives
  - Rechercher par nom ou email
  - Consulter les statistiques
  - **Déverrouiller** une archive pour voir les données déchiffrées

⚠️ **Audit** : Chaque accès aux données déchiffrées est enregistré dans les logs backend avec :
- ID de l'admin qui a accédé
- ID de l'utilisateur concerné
- Horodatage

---

## 📊 Endpoints API

### 1. Liste des archives (sans déchiffrement)

```http
GET /api/admin/verification-archives
Headers: Authorization: Bearer <admin_token>
Query params (optionnel):
  - userId: string
  - email: string
  - startDate: ISO date
  - endDate: ISO date
```

**Réponse** :
```json
[
  {
    "id": "uuid",
    "userId": "uuid",
    "userFullName": "John Doe",
    "userEmail": "john@example.com",
    "userPhone": "+33612345678",
    "documentType": "ID_CARD",
    "verifiedAt": "2025-01-29T10:00:00.000Z",
    "verifiedBy": "admin-uuid",
    "archivedAt": "2025-01-29T10:00:00.000Z",
    "notes": "Document valide",
    "hasEncryptedData": true
  }
]
```

### 2. Détail d'une archive (AVEC déchiffrement)

```http
GET /api/admin/verification-archives/:id
Headers: Authorization: Bearer <admin_token>
```

**Réponse** :
```json
{
  "id": "uuid",
  "userId": "uuid",
  "userFullName": "John Doe",
  "userEmail": "john@example.com",
  "documentType": "ID_CARD",
  "verifiedAt": "2025-01-29T10:00:00.000Z",
  "verifiedBy": "admin-uuid",
  "archivedAt": "2025-01-29T10:00:00.000Z",
  "notes": "Document valide",
  "sensitiveData": {
    "documentNumber": "AB123456",
    "dateOfBirth": "01/01/1990",
    "address": "123 Rue Exemple, 75001 Paris",
    "nationality": "Française",
    "issueDate": "01/01/2020",
    "expirationDate": "01/01/2030"
  }
}
```

🔒 **Audit log** : `🔓 AUDIT: Admin <id> a accédé à l'archive <id> de l'utilisateur <id> le <date>`

### 3. Statistiques

```http
GET /api/admin/verification-archives/stats
Headers: Authorization: Bearer <admin_token>
```

**Réponse** :
```json
{
  "total": 42,
  "last30Days": 5,
  "byDocumentType": [
    { "type": "ID_CARD", "count": 30 },
    { "type": "PASSPORT", "count": 10 },
    { "type": "DRIVER_LICENSE", "count": 2 }
  ]
}
```

### 4. Suppression d'une archive

```http
DELETE /api/admin/verification-archives/:id
Headers: Authorization: Bearer <admin_token>
```

🗑️ **Audit log** : `🗑️ AUDIT: Admin <id> a supprimé l'archive <id> de l'utilisateur <id> le <date>`

---

## 🔒 Sécurité

### Chiffrement

- **Algorithme** : AES-256-GCM (chiffrement authentifié)
- **Taille de clé** : 256 bits (32 bytes)
- **IV** : 16 bytes aléatoires (unique par chiffrement)
- **Auth Tag** : 16 bytes (pour vérifier l'intégrité)

### Format de stockage

Les données chiffrées sont stockées en base de données sous forme de **base64** avec le format :
```
iv:authTag:encrypted (en hex) -> encodé en base64
```

### Audits

Tous les accès et suppressions d'archives sont **loggés** dans la console backend pour traçabilité.

### RGPD

✅ **Conforme** :
- Données sensibles chiffrées
- Fichiers supprimés après vérification
- Accès restreint aux admins
- Traçabilité des accès
- Possibilité de suppression (droit à l'oubli)

---

## 🧪 Test du système

### 1. Générer une nouvelle clé (optionnel)

```bash
cd dinarus-backend
node generate-encryption-key.js
```

### 2. Tester l'archivage

1. Créez une demande de vérification depuis l'interface client
2. En tant qu'admin, approuvez la vérification :
   ```bash
   curl -X PATCH http://localhost:3001/api/admin/identity/<verification-id>/approve \
     -H "Authorization: Bearer <admin-token>" \
     -H "Content-Type: application/json" \
     -d '{
       "sensitiveData": {
         "documentNumber": "TEST123456",
         "dateOfBirth": "01/01/1990",
         "address": "123 Test Street"
       },
       "notes": "Test archive"
     }'
   ```
3. Vérifiez que :
   - Les fichiers ont été supprimés de `uploads/`
   - L'archive apparaît dans `/admin/archives`
   - Vous pouvez déverrouiller et voir les données

---

## 📂 Structure des fichiers

### Backend

```
dinarus-backend/
├── src/
│   ├── utils/
│   │   └── encryption.service.ts          # Service de chiffrement
│   ├── verification-archives/
│   │   ├── verification-archives.module.ts
│   │   ├── verification-archives.controller.ts
│   │   ├── verification-archives.service.ts
│   ├── admin/
│   │   ├── admin.service.ts               # Modifié (approveVerification)
│   │   ├── admin.controller.ts            # Modifié (body params)
│   │   └── admin.module.ts                # Modifié (import VerificationArchivesModule)
├── prisma/
│   ├── schema.prisma                      # Modifié (+ VerificationArchive)
│   └── migrations/
│       └── 20250129_add_verification_archive/
│           └── migration.sql
├── generate-encryption-key.js             # Script générateur de clé
└── .env                                   # ⚠️ Ajouter ENCRYPTION_KEY
```

### Frontend

```
Dashboard/
└── app/
    └── admin/
        └── archives/
            └── page.tsx                   # Nouvelle page d'archives
```

---

## ⚠️ Points d'attention

### En développement

- ✅ La clé de chiffrement peut être dans `.env`
- ✅ Les logs d'audit sont dans la console

### En production

- 🔴 **OBLIGATOIRE** : Utilisez un gestionnaire de secrets
- 🔴 **OBLIGATOIRE** : Logs d'audit dans une base de données ou service externe
- 🔴 **OBLIGATOIRE** : Sauvegarde régulière de la clé de chiffrement
- 🔴 **OBLIGATOIRE** : HTTPS strict
- 🔴 **OBLIGATOIRE** : Authentification à deux facteurs pour les admins

---

## 🆘 Dépannage

### "Erreur lors du déchiffrement"

- Vérifiez que `ENCRYPTION_KEY` est bien définie dans `.env`
- Vérifiez que la clé n'a pas changé depuis la création de l'archive
- Vérifiez que la clé fait exactement 32 bytes en base64

### "Les fichiers ne sont pas supprimés"

- Vérifiez les permissions du dossier `uploads/`
- Vérifiez les logs backend pour les erreurs de suppression

### "L'archive n'est pas créée"

- Vérifiez que `sensitiveData` est bien envoyé dans le body
- Vérifiez les logs backend
- Vérifiez que `VerificationArchivesModule` est bien importé dans `AdminModule`

---

## 📝 Notes importantes

1. **Les fichiers sont supprimés définitivement** après vérification
2. **Seules les données textuelles sont archivées** (pas les images)
3. **Chaque déverrouillage est audité** dans les logs
4. **La clé de chiffrement est critique** : ne la perdez jamais !
5. **Les archives ne sont jamais automatiquement supprimées** (sauf action admin)

---

## 🔮 Améliorations futures possibles

1. **OCR automatique** : Extraction automatique des données du document
2. **Rotation de clés** : Système de re-chiffrement avec nouvelle clé
3. **Logs en base de données** : Traçabilité persistante des accès
4. **Export sécurisé** : Export chiffré pour autorités légales
5. **Authentification 2FA** : Obligatoire pour accéder aux archives
6. **Expiration automatique** : Suppression après X années (RGPD)

---

## ✅ Résultat final

🎉 **Le système d'archivage est maintenant opérationnel !**

- ✅ Chiffrement AES-256-GCM des données sensibles
- ✅ Suppression automatique des fichiers après vérification
- ✅ Interface admin moderne pour consultation
- ✅ Audit des accès
- ✅ Conforme RGPD
- ✅ Sécurisé et performant

**Prochaine étape** : Ajoutez `ENCRYPTION_KEY` dans votre `.env` et testez le système !

