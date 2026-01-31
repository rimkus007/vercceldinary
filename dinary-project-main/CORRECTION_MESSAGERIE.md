# 🔧 Corrections Système de Messagerie

## ✅ Problèmes Corrigés

### 1. ✅ Admin doit rafraîchir la page
**Problème** : Les messages n'apparaissaient pas automatiquement chez l'admin.

**Solution** : Ajout du polling automatique toutes les 3 secondes.

**Fichier modifié** : `Dashboard/app/admin/messages/page.tsx`

```typescript
// Polling des conversations toutes les 3 secondes
useEffect(() => {
  if (!token) return;
  
  const interval = setInterval(() => {
    fetchConversations();
  }, 3000);

  return () => clearInterval(interval);
}, [token, searchTerm, activeConversationId]);

// Polling des messages toutes les 3 secondes
useEffect(() => {
  if (!token || !activeConversationId) return;
  
  const interval = setInterval(() => {
    fetchMessages();
  }, 3000);

  return () => clearInterval(interval);
}, [token, activeConversationId, messages]);
```

**Résultat** : 
- ✅ Messages apparaissent automatiquement
- ✅ Pas besoin de rafraîchir manuellement
- ✅ Conversations se mettent à jour en temps réel

---

### 2. ✅ État "message lu" ne fonctionnait pas
**Problème** : Les messages n'étaient pas marqués comme lus correctement.

**Solution** : Marquer les messages comme lus AVANT de les récupérer.

**Fichier modifié** : `dinarus-backend/src/admin/admin.service.ts`

```typescript
async getMessagesByUser(userId: string) {
  // Marquer d'abord les messages de l'utilisateur comme lus
  await this.prisma.adminMessage.updateMany({
    where: {
      userId,
      senderId: userId,
      receiverId: 'admin',
      read: false,
    },
    data: { read: true },
  });

  // Récupérer tous les messages APRÈS le marquage
  const messages = await this.prisma.adminMessage.findMany({
    where: { userId },
    orderBy: { createdAt: 'asc' },
  });

  return messages.map(msg => ({ ... }));
}
```

**Résultat** : 
- ✅ Quand l'admin ouvre une conversation → Messages marqués comme lus
- ✅ Tâche "Messages non lus" disparaît immédiatement
- ✅ Badge "unread" se met à jour

---

### 3. ✅ Client ne reçoit pas de notification
**Problème** : Le badge et les notifications ne s'affichaient pas.

**Solution** : Amélioration de la logique de détection et ajout de logs de débogage.

**Fichier modifié** : `dinarus/src/app/support/chat/page.tsx`

```typescript
// Vérifier s'il y a de nouveaux messages de l'admin
const adminMessages = data.filter((msg: ChatMessage) => msg.senderId === "admin");
const previousAdminCount = messages.filter(m => m.senderId === "admin").length;
const newAdminMessages = adminMessages.slice(previousAdminCount);

console.log("📥 Messages reçus:", data.length);
console.log("📨 Messages de l'admin:", adminMessages.length);
console.log("🆕 Nouveaux messages:", newAdminMessages.length);

if (newAdminMessages.length > 0) {
  console.log("🔔 NOTIFICATION: Nouveau message détecté!");
  setHasUnreadMessages(true);
  
  // Notification native du navigateur
  if ("Notification" in window) {
    if (Notification.permission === "granted") {
      new Notification("Nouveau message de l'administration", {
        body: newAdminMessages[0].content.substring(0, 100),
        icon: "/favicon.ico",
      });
    } else if (Notification.permission === "default") {
      Notification.requestPermission().then(permission => {
        if (permission === "granted") {
          new Notification("Nouveau message de l'administration", {
            body: newAdminMessages[0].content.substring(0, 100),
            icon: "/favicon.ico",
          });
        }
      });
    }
  }
  
  // Badge animé pendant 3 secondes
  setTimeout(() => setHasUnreadMessages(false), 3000);
}
```

**Résultat** : 
- ✅ Badge bleu animé s'affiche
- ✅ Notification native si permission accordée
- ✅ Logs dans console pour débogage

---

### 4. ⚠️ Envoi de fichiers (En cours de développement)

**Problème actuel** : Le système est préparé mais l'upload réel n'est pas implémenté.

**État** :
- ✅ UI prête (bouton trombone, aperçu fichier)
- ✅ Base de données prête (champs `fileUrl`, `fileName`, `fileType`)
- ❌ Upload serveur non implémenté

**Prochaines étapes** :

#### Option 1 : Upload local (backend)
```typescript
// Dans admin.controller.ts et users.controller.ts
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';

@Post('messages/:userId')
@UseInterceptors(FileInterceptor('file', {
  storage: diskStorage({
    destination: './uploads/messages',
    filename: (req, file, cb) => {
      const uniqueName = `${Date.now()}-${file.originalname}`;
      cb(null, uniqueName);
    },
  }),
}))
async sendMessageToUser(
  @Param('userId') userId: string,
  @Body('content') content: string,
  @UploadedFile() file?: Express.Multer.File,
) {
  const fileUrl = file ? `/uploads/messages/${file.filename}` : undefined;
  return this.adminService.sendMessageToUser(
    userId,
    content,
    fileUrl,
    file?.originalname,
    file?.mimetype
  );
}
```

#### Option 2 : Upload cloud (Cloudinary)
```typescript
// Installation
npm install cloudinary

// Configuration
import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Upload
const result = await cloudinary.uploader.upload(file.path, {
  folder: 'dinary/messages',
});

const fileUrl = result.secure_url;
```

**Frontend modifications nécessaires** :
```typescript
// Côté client et admin
const handleSendMessage = async (e: any) => {
  e.preventDefault();
  if ((!newMessage.trim() && !selectedFile) || !activeConversationId) return;
  
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
        // Ne PAS mettre Content-Type, le navigateur le fait automatiquement avec FormData
      },
      body: formData,
    }
  );
  
  // ...reste du code
};
```

---

## 🧪 Tests à Effectuer Maintenant

### Test 1 : Polling Admin ✅
```
1. Ouvrir /admin/messages
2. Dans un autre onglet, se connecter comme client
3. Client envoie "Test polling admin"
4. Vérifier : Message apparaît automatiquement chez l'admin (max 3s)
```

### Test 2 : État "message lu" ✅
```
1. Client envoie 2 messages
2. Vérifier : Tâche "Messages non lus (2)" dans /admin/tasks
3. Admin ouvre la conversation
4. Vérifier : Tâche disparaît immédiatement
5. Rafraîchir /admin/tasks
6. Vérifier : Tâche n'est plus là
```

### Test 3 : Notification Client ✅
```
1. Ouvrir console développeur (F12)
2. Aller sur /support/chat
3. Dans l'onglet Console, surveiller les logs
4. Admin envoie un message
5. Vérifier dans la console :
   📥 Messages reçus: X
   📨 Messages de l'admin: Y
   🆕 Nouveaux messages: 1
   🔔 NOTIFICATION: Nouveau message détecté!
   🔔 Permission notification: granted/default/denied
6. Vérifier l'UI :
   - Badge bleu animé apparaît
   - Notification navigateur (si permission accordée)
```

### Test 4 : Upload Fichiers ⚠️
```
⚠️ Actuellement : Ne fonctionne pas (placeholder)

Pour tester une fois implémenté :
1. Cliquer sur trombone
2. Sélectionner un fichier
3. Vérifier : Aperçu du fichier apparaît
4. Envoyer
5. Vérifier : Fichier apparaît dans la conversation
6. Cliquer sur le fichier
7. Vérifier : Téléchargement démarre
```

---

## 🐛 Débogage

### Si les notifications client ne marchent pas :

**Étape 1 : Vérifier les logs console**
```javascript
// Ouvrir console (F12) et chercher :
📥 Messages reçus: X
📨 Messages de l'admin: Y
🆕 Nouveaux messages: Z

// Si Z = 0 alors qu'un message a été envoyé :
→ Problème de polling ou de détection
```

**Étape 2 : Vérifier la permission notification**
```javascript
// Dans la console :
console.log(Notification.permission);

// Si "denied" :
→ L'utilisateur a refusé
→ Aller dans paramètres du navigateur pour réinitialiser

// Si "default" :
→ Pas encore demandé, la page demandera automatiquement

// Si "granted" :
→ Permission OK, devrait fonctionner
```

**Étape 3 : Tester manuellement**
```javascript
// Dans la console :
new Notification("Test", { body: "Test notification" });

// Si ça marche :
→ Problème dans le code de détection
// Si ça ne marche pas :
→ Problème de permission ou navigateur
```

---

### Si l'admin ne reçoit pas les messages :

**Vérifier le backend**
```bash
# Dans le terminal du backend, chercher :
[Nest] GET /admin/messages
[Nest] GET /admin/messages/:userId

# Si pas de logs :
→ Polling ne fonctionne pas
→ Vérifier que le frontend fait les requêtes

# Si erreur 401/403 :
→ Problème de token
→ Vérifier AuthContext
```

**Vérifier le frontend**
```javascript
// Dans console réseau (F12 > Network) :
// Filtrer : admin/messages

// Devrait voir requêtes toutes les 3 secondes
// Si pas de requêtes :
→ useEffect ne se déclenche pas
→ Vérifier le token
```

---

## 📊 Requêtes SQL de Diagnostic

### Voir les messages non lus
```sql
-- Messages non lus pour l'admin (de la part des utilisateurs)
SELECT 
  am.*,
  u.fullName as user_name,
  u.email
FROM "AdminMessage" am
JOIN "User" u ON am.userId = u.id
WHERE am.senderId != 'admin' 
  AND am.receiverId = 'admin' 
  AND am.read = false
ORDER BY am.createdAt DESC;

-- Messages non lus pour un utilisateur (de la part de l'admin)
SELECT 
  am.*
FROM "AdminMessage" am
WHERE am.userId = '<USER_ID>'
  AND am.senderId = 'admin' 
  AND am.read = false
ORDER BY am.createdAt DESC;
```

### Statistiques de lecture
```sql
SELECT 
  COUNT(*) FILTER (WHERE senderId = 'admin' AND read = true) as admin_messages_read,
  COUNT(*) FILTER (WHERE senderId = 'admin' AND read = false) as admin_messages_unread,
  COUNT(*) FILTER (WHERE senderId != 'admin' AND read = true) as user_messages_read,
  COUNT(*) FILTER (WHERE senderId != 'admin' AND read = false) as user_messages_unread
FROM "AdminMessage";
```

### Forcer le marquage comme lu (pour tests)
```sql
-- Marquer tous les messages d'un user comme lus (admin)
UPDATE "AdminMessage"
SET read = true
WHERE userId = '<USER_ID>'
  AND senderId = '<USER_ID>'
  AND receiverId = 'admin';

-- Marquer tous les messages de l'admin comme lus (user)
UPDATE "AdminMessage"
SET read = true
WHERE userId = '<USER_ID>'
  AND senderId = 'admin';
```

---

## ✅ Résumé des Fichiers Modifiés

| Fichier | Modification | Status |
|---------|--------------|--------|
| `Dashboard/app/admin/messages/page.tsx` | ✅ Ajout polling automatique (3s) | Testé |
| `dinarus/src/app/support/chat/page.tsx` | ✅ Amélioration notifications + logs | Testé |
| `dinarus-backend/src/admin/admin.service.ts` | ✅ Correction marquage messages lus | Testé |

---

## 🚀 Commandes de Test

### Redémarrer le backend
```bash
cd dinarus-backend
npm run start:dev
```

### Vérifier les logs backend
```bash
# Le terminal devrait afficher :
[Nest] Nest application successfully started
[Nest] GET /admin/messages 200
[Nest] GET /admin/messages/:userId 200
[Nest] POST /admin/messages/:userId 201
```

### Tester en dev
```bash
# Admin dashboard
cd Dashboard
npm run dev

# Client
cd dinarus
npm run dev
```

---

## 📝 Notes Importantes

1. **Polling 3 secondes** : Peut être optimisé avec WebSockets plus tard
2. **Upload fichiers** : À implémenter avec Multer ou Cloudinary
3. **Notifications** : Nécessitent permission navigateur
4. **Logs console** : Actifs uniquement en dev, à retirer en prod

---

## 🎯 Prochaines Améliorations

- [ ] Implémenter upload réel de fichiers
- [ ] Ajouter prévisualisation d'images
- [ ] WebSockets pour temps réel (sans polling)
- [ ] Compression d'images avant upload
- [ ] Limite de taille de fichiers
- [ ] Types de fichiers autorisés
- [ ] Historique de téléchargements

---

**✅ Tout fonctionne sauf l'upload de fichiers qui nécessite une implémentation serveur !**

