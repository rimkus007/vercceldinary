# 🔐 Correction Erreur "Invalid key length"

## 🎯 **Problème**
Erreur lors de l'approbation de vérification marchand :
```
Erreur lors de la création de l'archive: Invalid key length
```

## 🔍 **Cause**
La clé `ENCRYPTION_KEY` dans le fichier `.env` n'a pas la bonne longueur.
- **Requis**: 64 caractères hexadécimaux (32 bytes)
- **Actuel**: Longueur incorrecte ou clé manquante

## ✅ **Solution Rapide**

### **Étape 1: Générer une nouvelle clé**
```bash
cd dinarus-backend
node generate-encryption-key.js
```

### **Étape 2: Copier la clé générée**
Le script affichera quelque chose comme:
```
ENCRYPTION_KEY=a1b2c3d4e5f6...64caractères...
```

### **Étape 3: Mettre à jour le fichier .env**
1. Ouvrez `dinarus-backend/.env`
2. Remplacez ou ajoutez la ligne:
   ```
   ENCRYPTION_KEY=VOTRE_NOUVELLE_CLE_ICI
   ```
3. Sauvegardez le fichier

### **Étape 4: Redémarrer le backend**
```bash
npm run start:dev
```

## 🧪 **Vérification**

### **Test de la clé**
Le backend affichera au démarrage:
- ✅ Si la clé est valide: Démarrage normal
- ❌ Si la clé est invalide: Message d'erreur détaillé

### **Test de l'approbation**
1. Connectez-vous à l'admin
2. Accédez à "Gestion des Commerçants"
3. Cliquez sur "Vérifications en attente"
4. Remplissez le formulaire de vérification
5. Cliquez sur "Confirmer et Archiver"
6. ✅ Devrait fonctionner sans erreur

## 📋 **Format de la Clé**

### **Valide** ✅
```
ENCRYPTION_KEY=a1b2c3d4e5f67890abcdef1234567890a1b2c3d4e5f67890abcdef1234567890
```
- 64 caractères hexadécimaux (0-9, a-f)
- Pas d'espaces
- Pas de guillemets

### **Invalide** ❌
```
ENCRYPTION_KEY=trop_court
ENCRYPTION_KEY="avec_guillemets"
ENCRYPTION_KEY=caractères_non_hex!@#
```

## 🔒 **Sécurité**

### **Important**
- ⚠️ Ne partagez JAMAIS votre clé de chiffrement
- ⚠️ Ne commitez JAMAIS le fichier .env dans Git
- ⚠️ Utilisez une clé différente pour production

### **Sauvegarde**
- Conservez une copie sécurisée de votre clé
- Si vous perdez la clé, les données chiffrées seront irrécupérables

## 🛠️ **Génération Manuelle**

Si le script ne fonctionne pas, utilisez Node.js directement:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Ou avec PowerShell:
```powershell
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## 📊 **Résultat Attendu**

### **Avant Correction**
- ❌ Erreur "Invalid key length"
- ❌ Impossible d'approuver les vérifications
- ❌ Archivage échoue

### **Après Correction**
- ✅ Approbation fonctionne
- ✅ Données archivées et chiffrées
- ✅ Numéro d'impôt sauvegardé
- ✅ Notifications envoyées

---

**🎉 Après avoir suivi ces étapes, votre système d'archivage fonctionnera correctement !**
