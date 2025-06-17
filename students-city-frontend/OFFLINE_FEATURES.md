# Gestion Hors Ligne - Students City

## 🎯 Fonctionnalités Implémentées

### 1. Détection de Connectivité
- **Plugin Capacitor Network** : Détection automatique de la perte/reprise de connectivité
- **Hook personnalisé** `useNetwork` : Gestion du statut réseau dans l'application
- **Contexte global** `NetworkContext` : Partage du statut réseau entre tous les composants

### 2. Bannière de Statut
- **Bannière fixe** en haut de l'application quand hors ligne
- **Animation d'apparition** fluide
- **Style distinctif** (rouge/orange) pour attirer l'attention

### 3. Cache Local Intelligent
- **Service de cache** `LocalCacheService` avec gestion d'expiration
- **Stockage automatique** des données API lors des requêtes en ligne
- **Récupération automatique** depuis le cache en mode hors ligne
- **Nettoyage automatique** des données expirées

### 4. Services Adaptés
#### Service Places (`placeService`)
- ✅ Cache des lieux avec expiration (30 min)
- ✅ Cache des types d'établissements (24h)
- ✅ Recherche locale quand hors ligne
- ✅ Fallback intelligent sur le cache en cas d'erreur réseau

#### Service Reviews (`reviewService`)
- ✅ Cache des avis par lieu (30 min)
- ✅ Invalidation intelligente du cache après modification
- ❌ Désactivation des actions de création/modification/suppression hors ligne

### 5. Interface Utilisateur Adaptée

#### Page Places
- 🚫 **Géolocalisation désactivée** en mode hors ligne
- 🚫 **Bouton d'ajout désactivé** (FAB grisé)
- ℹ️ **Indicateurs visuels** : bannières d'information sur le statut
- 📱 **Indicateur de cache** : notification quand les données viennent du cache

#### Page PlaceDetail
- 🚫 **Formulaire d'avis désactivé** en mode hors ligne
- 🚫 **Boutons d'édition/suppression** désactivés
- ℹ️ **Messages contextuels** expliquant les limitations
- 📱 **Indicateur de cache** pour les données obsolètes

### 6. Outils de Développement
- **Panel de test** `OfflineTestPanel` (visible en dev uniquement)
- **Données de test** préchargées pour simulation
- **Commandes de gestion** du cache depuis l'interface

## 🔧 Comment Tester

### 1. Mode Simulation (Navigateur)
1. Ouvrir les DevTools (F12)
2. Aller dans l'onglet **Network**
3. Sélectionner **Offline** dans la liste déroulante
4. Recharger la page pour voir la bannière hors ligne

### 2. Mode Réel (Mobile)
1. Construire l'app avec `ionic capacitor build`
2. Déployer sur un appareil
3. Désactiver WiFi/données mobiles
4. Tester la navigation dans l'app

### 3. Avec Données de Test
1. Utiliser le **Panel de test** en bas de la page Places
2. Cliquer sur "Charger données test" pour précharger le cache
3. Passer en mode offline pour tester

## 📊 Données Mises en Cache

| Type | Clé Cache | Durée | Description |
|------|-----------|-------|-------------|
| Lieux | `places_all` | 30 min | Liste complète des lieux |
| Lieu détail | `place_{id}` | 1h | Détails d'un lieu spécifique |
| Avis | `place_reviews_{id}` | 30 min | Avis d'un lieu |
| Types | `place_types` | 24h | Types d'établissements |
| Recherche | `places_search_{params}` | 15 min | Résultats de recherche |

## 🎨 Styles et UX

### Bannière Hors Ligne
```css
.offline-banner {
  --background: #ff6b6b; /* Rouge distinctif */
  position: sticky;
  top: 0;
  z-index: 1000;
  animation: slideDown 0.3s ease-out;
}
```

### Boutons Désactivés
- Changement de couleur (gris)
- Texte explicatif
- Événements désactivés

### Indicateurs de Cache
- Bannières informatives bleues
- Icônes explicites (📱, ⚠️)
- Messages courts et clairs

## 🚀 Améliorations Futures

### Fonctionnalités Avancées
- **Queue de synchronisation** : stocker les actions hors ligne pour les rejouer en ligne
- **Synchronisation différentielle** : ne mettre à jour que les données modifiées
- **Cache d'images** : télécharger et cacher les images des lieux
- **Cartes hors ligne** : intégration avec des services de cartes offline

### Optimisations
- **Compression des données** dans le cache
- **Gestion de la taille** du cache avec suppression LRU
- **Indicateur de progression** pour les synchronisations
- **Stratégies de cache** configurables par type de données

## 📱 Compatibilité

- ✅ **Web** : LocalStorage + API Network (simulation)
- ✅ **iOS** : Plugin Capacitor Network natif
- ✅ **Android** : Plugin Capacitor Network natif
- ✅ **Responsive** : Interface adaptée mobile/desktop

## 🔍 Architecture

```
src/
├── hooks/
│   └── useNetwork.ts              # Hook de détection réseau
├── contexts/
│   └── NetworkContext.tsx        # Contexte global réseau
├── services/
│   ├── localCache.ts             # Service de cache local
│   ├── places.ts                 # Service lieux (modifié)
│   └── reviews.ts                # Service avis (modifié)
├── components/
│   ├── OfflineBanner.tsx         # Bannière hors ligne
│   ├── OfflineTestPanel.tsx      # Panel de test (dev)
│   └── AppContent.tsx            # Layout principal
└── utils/
    └── offlineTestData.ts        # Données de test
```
