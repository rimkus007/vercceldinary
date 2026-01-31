# 🎫 Système de Tickets - Démarrage Rapide

## ⚡ Pour démarrer

### 1️⃣ Appliquer la migration (Backend)

Ouvrir un terminal dans `dinarus-backend` et exécuter :

```bash
apply-ticket-migration.bat
```

### 2️⃣ Redémarrer le backend

```bash
npm run start:dev
```

### 3️⃣ C'est tout ! ✅

Le système de tickets est maintenant fonctionnel :

- **Client** : `http://localhost:3000/support` → Onglet "Mes tickets"
- **Marchand** : `http://localhost:3002/support` → Onglet "🎫 Tickets"
- **Admin** : API disponible sur `/admin/tickets`

## 📋 Ce qui a été implémenté

✅ Backend complet avec API
✅ Page support client (création + liste tickets)
✅ Page support marchand (création + liste tickets)
✅ Liaison tickets ↔ messagerie
✅ Statuts, priorités et catégories
✅ Affichage dynamique

## 📖 Documentation complète

Voir `IMPLEMENTATION_TICKETS_COMPLETE.md` pour tous les détails.

