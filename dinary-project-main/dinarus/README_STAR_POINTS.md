# Système de Points Étoilés et Missions débloquables

Cette fonctionnalité permet d'utiliser les points étoilés ("star points") gagnés par les utilisateurs pour débloquer des missions exclusives dans l'application.

## Fonctionnement

1. **Acquisition des Points Étoilés**
   - Les utilisateurs gagnent des points étoilés en suggérant des commerçants qui rejoignent ensuite la plateforme (500 points par commerçant)
   - D'autres actions peuvent également octroyer des points étoilés (à implémenter)

2. **Utilisation des Points**
   - Les points étoilés permettent de débloquer des missions premium
   - Chaque mission premium a un seuil minimum de points requis

3. **Avantages des Missions Premium**
   - Récompenses exclusives (consultations gratuites, invitations à des événements...)
   - Gains de points XP plus importants
   - Accès à des offres limitées

## Implémentation

- Ajout de types spécifiques pour différencier les missions standards et les missions à points étoilés
- Interface visuelle améliorée pour identifier les missions débloquables avec des points
- Compteur de points étoilés dans l'interface utilisateur
- Informations sur les points étoilés dans le système de suggestion de commerçants

## Prochaines étapes

1. Implémenter la persistance des points étoilés dans le backend
2. Ajouter davantage de missions débloquables par paliers de points
3. Créer un historique détaillé des points gagnés
4. Développer un système de partage de points entre amis
