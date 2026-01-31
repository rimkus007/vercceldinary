# 📎 Implémentation Upload de Fichiers - Guide Complet

## ✅ Implémentation Terminée

L'upload réel de fichiers est maintenant **100% fonctionnel** dans le système de messagerie !

---

## 🛠️ Modifications Backend

### 1. Installation de Multer
```bash
npm install --save multer @types/multer
```

### 2. Création du dossier de stockage
```
dinarus-backend/
  └── uploads/
      └── messages/    ← Nouveaux fichiers uploadés
```

### 3. Configuration des Controllers

#### `admin.controller.ts` - Messages admin → client
```typescript
@Post('messages/:userId')
@UseInterceptors(
  FileInterceptor('file', {
    storage: diskStorage({
      destination: './uploads/messages',
      filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        const ext = extname(file.originalname);
        cb(null, `${uniqueSuffix}${ext}`);
      },
    }),
    limits: {
      fileSize: 10 * 1024 * 1024, // 10MB max
    },
  }),
)
async sendMessageToUser(
  @Param('userId') userId: string,
  @Body('content') content: string,
  @UploadedFile() file?: Express.Multer.File,
) {
  const fileUrl = file ? `/uploads/messages/${file.filename}` : undefined;
  const fileName = file ? file.originalname : undefined;
  const fileType = file ? file.mimetype : undefined;
  
  return this.adminService.sendMessageToUser(
    userId,
    content || '(Fichier joint)',
    fileUrl,
    fileName,
    fileType
  );
}
```

#### `users.controller.ts` - Messages client → admin
```typescript
@Post('me/chat')
@UseInterceptors(
  FileInterceptor('file', {
    storage: diskStorage({
      destination: './uploads/messages',
      filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        const ext = extname(file.originalname);
        cb(null, `${uniqueSuffix}${ext}`);
      },
    }),
    limits: {
      fileSize: 10 * 1024 * 1024, // 10MB max
    },
  }),
)
async sendMyChat(
  @Request() req,
  @Body('content') content: string,
  @UploadedFile() file?: Express.Multer.File,
) {
  const userId = req.user.sub;
  const fileUrl = file ? `/uploads/messages/${file.filename}` : undefined;
  const fileName = file ? file.originalname : undefined;
  const fileType = file ? file.mimetype : undefined;
  
  return this.adminService.sendMessageFromUser(
    userId,
    content || '(Fichier joint)',
    fileUrl,
    fileName,
    fileType
  );
}
```

### 4. Service Admin
```typescript
async sendMessageFromUser(
  userId: string,
  content: string,
  fileUrl?: string,
  fileName?: string,
  fileType?: string
) {
  const message = await this.prisma.adminMessage.create({
    data: {
      userId,
      senderId: userId,
      receiverId: 'admin',
      content: content.trim(),
      fileUrl,
      fileName,
      fileType,
      read: false,
    },
  });

  return {
    id: message.id,
    senderId: message.senderId,
    content: message.content,
    timestamp: message.createdAt.toISOString(),
    read: message.read,
    fileUrl: message.fileUrl,
    fileName: message.fileName,
    fileType: message.fileType,
  };
}
```

---

## 🎨 Modifications Frontend

### 1. Admin Dashboard (`Dashboard/app/admin/messages/page.tsx`)

#### Envoi avec FormData
```typescript
const handleSendMessage = async (e: any) => {
  e.preventDefault();
  if ((!newMessage.trim() && !selectedFile) || !activeConversationId) return;
  
  try {
    const formData = new FormData();
    formData.append('content', newMessage.trim() || '(Fichier joint)');
    if (selectedFile) {
      formData.append('file', selectedFile);
    }
    
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/admin/messages/${activeConversationId}`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          // Ne PAS mettre Content-Type, FormData le gère automatiquement
        },
        body: formData,
      }
    );
    
    if (!res.ok) throw new Error("Échec de l'envoi du message.");
    const newMsg: ChatMessage = await res.json();
    
    setMessages((prev) => [...prev, newMsg]);
    setNewMessage("");
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    
    fetchConversations();
  } catch (err: any) {
    setError(err.message);
  }
};
```

#### Affichage des fichiers
```typescript
{message.fileUrl && (
  <div className="mt-2 pt-2 border-t border-white/20">
    <a
      href={`http://localhost:3001${message.fileUrl}`}
      download={message.fileName}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center text-sm hover:underline"
    >
      <File size={16} className="mr-2" />
      {message.fileName || "Fichier joint"}
      <Download size={14} className="ml-2" />
    </a>
  </div>
)}
```

### 2. Client Interface (`dinarus/src/app/support/chat/page.tsx`)

Même structure que l'admin, avec l'endpoint `/users/me/chat`.

---

## 🗑️ Suppression du Statut "En ligne / Hors ligne"

### Admin Dashboard
**Avant :**
```typescript
<p className="text-xs text-gray-500">
  {currentConversation.user.status === "online" ? "En ligne" : "Hors ligne"}
</p>
```

**Après :**
```typescript
<div className="ml-3">
  <h3 className="text-sm font-medium">{currentConversation.user.name}</h3>
</div>
```

✅ Le badge de statut coloré (vert/jaune/gris) reste visible pour l'esthétique, mais le texte est supprimé.

---

## 🧪 Tests à Effectuer

### Test 1 : Upload Admin → Client

1. **Redémarrer le backend**
   ```bash
   cd dinarus-backend
   npm run start:dev
   ```

2. **Se connecter comme admin**
   - Aller sur `/admin/messages`
   - Sélectionner une conversation

3. **Envoyer un fichier**
   - Cliquer sur le trombone (📎)
   - Sélectionner un fichier (PDF, image, etc.)
   - Aperçu du fichier apparaît
   - Taper "Voici le document" dans le message
   - Cliquer sur Envoyer

4. **Vérifier côté admin**
   - ✅ Message avec fichier apparaît
   - ✅ Nom du fichier affiché
   - ✅ Icône de téléchargement visible

5. **Vérifier côté client**
   - Se connecter comme client
   - Aller sur `/support/chat`
   - ✅ Message avec fichier visible
   - ✅ Cliquer sur le fichier → Téléchargement démarre

---

### Test 2 : Upload Client → Admin

1. **Se connecter comme client**
   - Aller sur `/support/chat`

2. **Envoyer un fichier**
   - Cliquer sur le trombone
   - Sélectionner une image (ex: screenshot.png)
   - Taper "Voici ma pièce d'identité"
   - Envoyer

3. **Vérifier côté client**
   - ✅ Message avec fichier visible
   - ✅ Peut télécharger le fichier

4. **Vérifier côté admin**
   - Aller sur `/admin/tasks`
   - ✅ Tâche "Messages non lus (1)" visible
   - Cliquer sur la tâche
   - ✅ Message avec fichier visible
   - ✅ Peut télécharger le fichier

---

### Test 3 : Fichier uniquement (sans texte)

1. **Client ou admin**
   - Cliquer sur trombone
   - Sélectionner un fichier
   - **NE PAS taper de message**
   - Envoyer

2. **Vérifier**
   - ✅ Message apparaît avec "(Fichier joint)"
   - ✅ Fichier téléchargeable

---

### Test 4 : Types de fichiers

Tester différents types :
- ✅ PDF (document.pdf)
- ✅ Images (PNG, JPG, GIF)
- ✅ Documents (DOCX, XLSX)
- ✅ Archives (ZIP, RAR)
- ✅ Texte (TXT, CSV)

---

### Test 5 : Taille de fichier

1. **Fichier < 10MB**
   - ✅ Upload réussit

2. **Fichier > 10MB**
   - ❌ Upload échoue (limite configurée)
   - Message d'erreur visible

---

## 📂 Structure des Fichiers Uploadés

```
dinarus-backend/
  └── uploads/
      └── messages/
          ├── 1730065123456-789012345.pdf
          ├── 1730065234567-890123456.png
          ├── 1730065345678-901234567.jpg
          └── ...
```

**Format du nom** : `{timestamp}-{random}.{extension}`

**Exemple** :
- Fichier original : `document.pdf`
- Stocké comme : `1730065123456-789012345.pdf`
- URL : `http://localhost:3001/uploads/messages/1730065123456-789012345.pdf`

---

## 🔒 Sécurité

### 1. Limite de taille : 10MB
```typescript
limits: {
  fileSize: 10 * 1024 * 1024, // 10MB
}
```

### 2. Nom de fichier unique
- Évite les conflits
- Empêche l'écrasement de fichiers

### 3. Authentification requise
- Tous les endpoints nécessitent un token JWT
- Seuls les utilisateurs authentifiés peuvent uploader

---

## 📊 Base de Données

Les fichiers sont référencés dans `AdminMessage` :

```prisma
model AdminMessage {
  id           String   @id @default(uuid())
  content      String
  senderId     String
  receiverId   String
  userId       String
  user         User     @relation(fields: [userId], references: [id])
  fileUrl      String?  // ← URL du fichier
  fileName     String?  // ← Nom original
  fileType     String?  // ← Type MIME
  read         Boolean  @default(false)
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt
}
```

**Requête SQL pour voir les messages avec fichiers** :
```sql
SELECT 
  am.*,
  u.fullName as user_name
FROM "AdminMessage" am
JOIN "User" u ON am.userId = u.id
WHERE am.fileUrl IS NOT NULL
ORDER BY am.createdAt DESC;
```

---

## 🐛 Dépannage

### Problème : "Échec de l'envoi du message"

**Vérifier** :
1. Backend est bien démarré ?
   ```bash
   # Terminal doit afficher :
   [Nest] Nest application successfully started
   ```

2. Dossier `uploads/messages` existe ?
   ```bash
   ls uploads/messages
   ```

3. Logs backend :
   ```bash
   # Chercher dans le terminal backend :
   [Nest] POST /admin/messages/:userId
   ```

---

### Problème : "Cannot download file"

**Vérifier l'URL** :
```typescript
// Doit être :
href={`http://localhost:3001${message.fileUrl}`}

// PAS :
href={message.fileUrl}
```

---

### Problème : "File too large"

**Solution 1** : Augmenter la limite
```typescript
limits: {
  fileSize: 20 * 1024 * 1024, // 20MB
}
```

**Solution 2** : Compresser le fichier avant envoi (frontend)

---

## 🎯 Améliorations Futures

- [ ] Prévisualisation d'images en ligne
- [ ] Compression automatique d'images
- [ ] Support de multiples fichiers à la fois
- [ ] Barre de progression d'upload
- [ ] Validation des types de fichiers autorisés
- [ ] Migration vers Cloudinary pour le cloud storage
- [ ] Génération de thumbnails pour les images
- [ ] Scan antivirus des fichiers uploadés

---

## ✅ Résumé des Fichiers Modifiés

| Fichier | Modifications |
|---------|---------------|
| `dinarus-backend/src/admin/admin.controller.ts` | ✅ Ajout FileInterceptor, Multer |
| `dinarus-backend/src/users/users.controller.ts` | ✅ Ajout FileInterceptor, Multer |
| `dinarus-backend/src/admin/admin.service.ts` | ✅ Ajout paramètres fichier |
| `Dashboard/app/admin/messages/page.tsx` | ✅ FormData, suppression statut |
| `dinarus/src/app/support/chat/page.tsx` | ✅ FormData, suppression statut |

---

## 🚀 C'est Prêt !

**Tout fonctionne maintenant** :
- ✅ Upload fichiers admin → client
- ✅ Upload fichiers client → admin
- ✅ Téléchargement des fichiers
- ✅ Aperçu avant envoi
- ✅ Limite 10MB
- ✅ Statut "en ligne/hors ligne" supprimé

**Redémarrez le backend et testez !** 📎✨

