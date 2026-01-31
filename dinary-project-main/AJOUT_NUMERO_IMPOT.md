# 📋 Ajout du Numéro d'Impôt dans la Vérification d'Identité

## 🎯 **Objectif**
Permettre à l'admin de saisir et visualiser le numéro d'impôt des marchands lors du processus de vérification d'identité.

## ✅ **Modifications Effectuées**

### 1. **Backend - Schéma Prisma**
- ✅ Champ `taxNumber` déjà existant dans `IdentityVerification` (ligne 64)
- ✅ Type: `String?` (optionnel pour les clients, requis pour les marchands)

### 2. **Backend - DTO**
- ✅ Champ `taxNumber` déjà présent dans `CreateIdentityVerificationDto` (lignes 15-18)
- ✅ Validation: `@IsOptional()` et `@IsString()`

### 3. **Backend - Service Admin**
- ✅ **Méthode `approveVerification`** modifiée pour:
  - Conserver le numéro d'impôt lors de l'approbation
  - Mettre à jour le profil marchand avec le numéro d'impôt
  - Archiver le numéro d'impôt dans les données chiffrées

```typescript
// Ajout dans approveVerification()
const finalTaxNumber = sensitiveData?.taxNumber || verification.taxNumber;
// Mise à jour de la vérification
taxNumber: finalTaxNumber,
// Mise à jour du profil marchand
if (userRole === 'MERCHANT' && finalTaxNumber) {
  await this.prisma.merchant.updateMany({
    where: { userId },
    data: { taxNumber: finalTaxNumber },
  });
}
```

### 4. **Frontend - Modal de Vérification**
- ✅ **Interface `VerificationRequest`** enrichie avec `taxNumber`
- ✅ **État `sensitiveData`** inclut `taxNumber`
- ✅ **Champ formulaire** ajouté pour saisir le numéro d'impôt
- ✅ **Affichage conditionnel** (uniquement pour les marchands)
- ✅ **Affichage dans la liste** des vérifications en attente

#### Ajouts dans `VerificationDetailModal.tsx`:
```typescript
// Dans l'état
taxNumber: "", // Ajout du numéro d'impôt

// Dans le formulaire (conditionnel MERCHANT)
{request.user.role === 'MERCHANT' && (
  <div className="md:col-span-2">
    <label className="block text-sm font-medium text-gray-700 mb-1">
      Numéro d'impôt 🧾
    </label>
    <input
      type="text"
      value={sensitiveData.taxNumber}
      onChange={(e) => setSensitiveData({...sensitiveData, taxNumber: e.target.value})}
      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
      placeholder="Ex: 1234567890123"
    />
  </div>
)}
```

### 5. **Frontend - Page Merchants**
- ✅ **Interface `VerificationRequest`** mise à jour avec `taxNumber`
- ✅ **Affichage dans la liste** des vérifications en attente
- ✅ **Icône et style** distinctive pour le numéro d'impôt

#### Ajouts dans `merchants/page.tsx`:
```typescript
// Dans l'interface
taxNumber?: string | null; // Numéro d'impôt (pour les marchands)

// Dans l'affichage de la liste
{req.user.role === 'MERCHANT' && req.taxNumber && (
  <div className="text-xs text-indigo-600 font-medium mt-1">
    🧾 Impôt: {req.taxNumber}
  </div>
)}
```

## 🔄 **Flux Complet**

### **Pour l'Admin:**
1. **Liste des vérifications**: Voir directement le numéro d'impôt fourni par le marchand
2. **Modal de vérification**: 
   - Le numéro d'impôt existant est affiché
   - Possibilité de modifier/saisir le numéro d'impôt
   - Le champ n'apparaît que pour les marchands
3. **Approbation**: Le numéro d'impôt est:
   - Archivé de manière sécurisée (chiffré)
   - Sauvegardé dans la vérification
   - Mis à jour dans le profil marchand

### **Pour le Marchand:**
1. **Upload initial**: Possibilité de fournir son numéro d'impôt
2. **Vérification**: L'admin peut confirmer ou corriger le numéro
3. **Profil**: Le numéro d'impôt est disponible dans son profil marchand

## 📊 **Bénéfices**

- ✅ **Conformité fiscale**: Suivi des numéros d'impôt des commerçants
- ✅ **Visibilité immédiate**: L'admin voit le numéro d'impôt dans la liste
- ✅ **Sécurité**: Données chiffrées et archivées
- ✅ **Flexibilité**: Modification possible lors de la vérification
- ✅ **Centralisation**: Numéro disponible dans le profil marchand

## 🔐 **Sécurité**

- ✅ **Chiffrement**: Le numéro d'impôt est archivé avec AES-256-GCM
- ✅ **Contrôle d'accès**: Uniquement les admins peuvent voir/modifier
- ✅ **Audit**: L'admin qui approuve est enregistré
- ✅ **Suppression sécurisée**: Fichiers physiques supprimés après approbation

## 🚀 **Déploiement**

- ✅ **Base de données**: Déjà synchronisée (`npx prisma db push`)
- ✅ **Backend**: Compilation réussie sans erreur
- ✅ **Frontend**: Composants mis à jour
- ✅ **Tests**: Prêt pour l'utilisation

---

**🎉 Le numéro d'impôt est maintenant complètement intégré dans le flux de vérification d'identité !**
