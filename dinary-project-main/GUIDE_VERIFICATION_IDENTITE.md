# 🛡️ Guide de Vérification d'Identité - Saisie Manuelle

## 📋 Vue d'ensemble

Ce système permet à l'admin de vérifier et d'archiver de manière sécurisée les documents d'identité des utilisateurs et marchands. Les données sont saisies manuellement par l'admin après vérification visuelle des documents.

---

## 🔐 Sécurité des données

### Chiffrement

Toutes les données sensibles extraites des documents d'identité sont :
- ✅ **Chiffrées** avec AES-256-GCM avant stockage
- ✅ **Stockées** dans une table dédiée `VerificationArchive`
- ✅ **Accessibles** uniquement par l'admin avec déverrouillage
- ✅ **Supprimées** : les images originales sont effacées après approbation

### Données archivées

Les informations suivantes sont extraites et archivées :

| Champ | Description | Obligatoire |
|-------|-------------|-------------|
| **Numéro de document** | Numéro unique du document | ✅ Oui |
| **Date de naissance** | Date de naissance de l'utilisateur | Non |
| **Nom complet** | Nom et prénom | Non |
| **Adresse** | Adresse complète | Non |
| **Nationalité** | Nationalité | Non |
| **Date d'émission** | Date de délivrance du document | Non |
| **Date d'expiration** | Date d'expiration du document | Non |
| **Lieu de naissance** | Ville/pays de naissance | Non |
| **Notes** | Notes additionnelles de l'admin | Non |

---

## 🚀 Processus de vérification

### Pour l'admin :

1. **Accéder aux vérifications en attente**
   - Navigation : `/admin/identity`
   - Onglets : "Utilisateurs" ou "Marchands"

2. **Ouvrir une demande de vérification**
   - Cliquer sur une ligne dans le tableau
   - Le modal s'ouvre avec les détails

3. **Examiner les documents**
   - **Recto** : Cliquer sur "Voir l'image Recto"
   - **Verso** : Cliquer sur "Voir l'image Verso" (si disponible)
   - **Selfie** : Cliquer sur "Voir le selfie"
   - Les images s'ouvrent en plein écran (cliquer pour fermer)

4. **Vérifications à effectuer**
   - ✅ Nom et prénom correspondent
   - ✅ Photo sur le document ressemble au selfie
   - ✅ Document non expiré
   - ✅ Document lisible et authentique
   - ✅ Pas de signes de falsification

5. **Approuver la vérification**
   - Cliquer sur **"Approuver"**
   - Un formulaire s'ouvre

6. **Remplir le formulaire d'archivage**
   - **Numéro de document*** (obligatoire) : Saisir le numéro tel qu'il apparaît
   - **Date de naissance** : Format JJ/MM/AAAA
   - **Nom complet** : Prénom et nom
   - **Adresse** : Adresse complète
   - **Nationalité** : Ex: Française, Algérienne, etc.
   - **Date d'émission** : Format JJ/MM/AAAA
   - **Date d'expiration** : Format JJ/MM/AAAA
   - **Lieu de naissance** : Ville ou pays
   - **Notes** (optionnel) : Observations particulières

7. **Valider**
   - Cliquer sur **"Confirmer et Archiver"**
   - Les données sont chiffrées et stockées
   - Les images originales sont supprimées
   - L'utilisateur est notifié de l'approbation

### En cas de rejet :

1. Cliquer sur **"Rejeter"**
2. Saisir une raison claire pour le rejet
3. L'utilisateur recevra une notification avec la raison
4. Il pourra soumettre de nouveaux documents

---

## 📊 Statuts des vérifications

| Statut | Description | Action possible |
|--------|-------------|-----------------|
| **PENDING** | En attente de vérification | Approuver ou Rejeter |
| **APPROVED** | Approuvée et archivée | Aucune (données dans les archives) |
| **REJECTED** | Rejetée | Aucune (utilisateur doit re-soumettre) |

---

## 🔍 Consulter les archives

### Accès aux archives

1. **Navigation** : `/admin/archives`
2. **Liste** : Toutes les vérifications approuvées
3. **Recherche** : Par nom ou email d'utilisateur
4. **Statistiques** : Nombre total, utilisateurs archivés, documents archivés

### Déverrouiller une archive

1. Cliquer sur **"Déverrouiller"** sur une archive
2. Un modal s'ouvre avec les données déchiffrées
3. Les données sont visibles uniquement pendant que le modal est ouvert
4. Fermer le modal = données re-chiffrées

---

## ⚠️ Bonnes pratiques

### Pour l'admin :

✅ **À FAIRE** :
- Vérifier soigneusement chaque document
- Comparer le selfie avec la photo du document
- Vérifier les dates d'expiration
- Saisir les données avec précision
- Ajouter des notes si nécessaire (ex: "Document expiré mais renouvelé")

❌ **À NE PAS FAIRE** :
- Approuver sans vérifier le selfie
- Négliger les dates d'expiration
- Laisser des champs vides sans raison
- Partager les données des archives
- Prendre des captures d'écran des documents

### Pour la sécurité :

- 🔒 Ne partagez jamais votre accès admin
- 🔒 Déconnectez-vous après chaque session
- 🔒 N'accédez aux archives que si nécessaire (litiges, contrôles)
- 🔒 Ne notez jamais les données sensibles en dehors du système

---

## 🛠️ Dépannage

### Problème : "Images non chargées"

**Cause** : Fichiers supprimés ou chemin incorrect

**Solution** :
- Vérifier que les images existent dans `dinarus-backend/uploads/`
- Demander à l'utilisateur de re-soumettre

### Problème : "Erreur lors de l'archivage"

**Cause** : `ENCRYPTION_KEY` non configuré

**Solution** :
```bash
# Vérifier la clé dans .env
cat dinarus-backend/.env | grep ENCRYPTION_KEY

# Si manquante, générer une nouvelle clé (32 bytes en hex = 64 caractères)
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Ajouter dans .env
echo "ENCRYPTION_KEY=votre_cle_generee" >> .env

# Redémarrer le backend
npm run start:dev
```

### Problème : "Impossible de déverrouiller une archive"

**Cause** : Clé de chiffrement différente ou corrompue

**Solution** :
- Vérifier que la `ENCRYPTION_KEY` est la même que lors de l'archivage
- Si la clé a été changée, les anciennes archives ne pourront plus être déchiffrées

---

## 📈 Statistiques

Les statistiques suivantes sont disponibles sur la page `/admin/archives` :

- **Total archives** : Nombre total d'archives créées
- **Utilisateurs archivés** : Nombre d'utilisateurs uniques archivés
- **Documents archivés** : Nombre total de documents (même utilisateur peut avoir plusieurs archives)

---

## 🔄 Workflow complet

```
┌─────────────────────────────────────────────────────┐
│ 1. Utilisateur soumet ses documents d'identité      │
└────────────────────┬────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────┐
│ 2. Admin reçoit une notification                    │
└────────────────────┬────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────┐
│ 3. Admin examine les images (recto, verso, selfie)  │
└────────────────────┬────────────────────────────────┘
                     │
         ┌───────────┴───────────┐
         │                       │
         ▼                       ▼
    ✅ VALIDE               ❌ INVALIDE
         │                       │
         ▼                       ▼
┌─────────────────────┐  ┌──────────────────────────┐
│ 4a. Admin clique    │  │ 4b. Admin clique         │
│     "Approuver"     │  │     "Rejeter"            │
└─────────┬───────────┘  └──────────┬───────────────┘
          │                         │
          ▼                         ▼
┌─────────────────────┐  ┌──────────────────────────┐
│ 5a. Formulaire      │  │ 5b. Saisir raison        │
│     s'affiche       │  │                          │
└─────────┬───────────┘  └──────────┬───────────────┘
          │                         │
          ▼                         ▼
┌─────────────────────┐  ┌──────────────────────────┐
│ 6a. Saisir données  │  │ 6b. Utilisateur notifié  │
│     manuellement    │  │     du rejet             │
└─────────┬───────────┘  └──────────────────────────┘
          │
          ▼
┌─────────────────────┐
│ 7a. Cliquer         │
│     "Confirmer et   │
│     Archiver"       │
└─────────┬───────────┘
          │
          ▼
┌─────────────────────────────────────────────────────┐
│ 8a. Données chiffrées avec AES-256-GCM              │
└────────────────────┬────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────┐
│ 9a. Archive créée dans VerificationArchive          │
└────────────────────┬────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────┐
│ 10a. Images originales supprimées du serveur        │
└────────────────────┬────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────┐
│ 11a. Utilisateur notifié de l'approbation           │
│      (isVerified = true)                            │
└─────────────────────────────────────────────────────┘
```

---

## 📞 Support

En cas de problème technique :

1. Vérifiez les logs du backend
2. Vérifiez que `ENCRYPTION_KEY` est configuré dans `.env`
3. Vérifiez que les images existent dans le dossier `uploads/`
4. Consultez ce guide pour les bonnes pratiques

---

## ✅ Checklist de sécurité

Avant de vérifier une identité :

- [ ] Les images sont nettes et lisibles
- [ ] Le document est valide (non expiré)
- [ ] La photo du document correspond au selfie
- [ ] Aucun signe de falsification
- [ ] Les informations sont cohérentes
- [ ] L'utilisateur a fourni toutes les images requises

Après approbation :

- [ ] Toutes les données obligatoires sont saisies
- [ ] Les données sont exactes
- [ ] Les notes expliquent toute exception
- [ ] L'archive a été créée avec succès
- [ ] Les images originales ont été supprimées

---

**Dernière mise à jour** : 29 Janvier 2025  
**Version** : 2.0.0 (Saisie manuelle simplifiée)  
**Auteur** : Système Dinary

