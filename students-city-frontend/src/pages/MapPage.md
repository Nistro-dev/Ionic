# Carte Interactive - Students City

## Description

La page de carte interactive utilise OpenStreetMap via la librairie Leaflet pour afficher tous les établissements validés avec leurs positions géographiques.

## Fonctionnalités

### 🗺️ Carte Interactive
- **Carte OpenStreetMap** : Alternative open source à Google Maps
- **Centrage automatique** : Sur la position GPS de l'utilisateur
- **Marqueurs personnalisés** : Icônes différentes selon le type d'établissement
- **Navigation fluide** : Zoom, déplacement, contrôles intuitifs

### 📍 Marqueurs intelligents
- **Localisation utilisateur** : Marqueur spécial en bleu
- **Établissements par type** :
  - 🍽️ Restaurant
  - 🍺 Bar  
  - ☕ Café
  - 🏠 Logement
  - 🚌 Transport
  - 🎭 Culture
  - ⚽ Sport
  - 📍 Autre

### 💡 Interaction avec les marqueurs
- **Clic sur marqueur** → Popup avec informations de base
- **Fiche courte** contenant :
  - Nom de l'établissement
  - Type d'établissement
  - Adresse complète
  - Note moyenne avec étoiles
  - Nombre d'avis
  - Description (si disponible)

### 🔍 Filtres et recherche
- **Barre de recherche** : Par nom, adresse ou description
- **Filtre par type** : Sélection du type d'établissement
- **Compteur de résultats** : Nombre de lieux trouvés
- **Position en temps réel** : Bouton pour recentrer sur l'utilisateur

### 📱 Modal de détails
- **Affichage complet** : Toutes les informations de l'établissement
- **Coordonnées GPS** : Latitude et longitude
- **Interface moderne** : Design cohérent avec l'application

## Technologies utilisées

- **Leaflet** : Librairie de cartes open source
- **React-Leaflet** : Intégration React pour Leaflet
- **OpenStreetMap** : Données cartographiques libres
- **Ionic React** : Interface utilisateur
- **TypeScript** : Typage strict

## Routes

- `/map` : Page principale de la carte

## Navigation

Accessible depuis :
- Dashboard → Bouton "Carte des lieux"
- URL directe : `/map`

## Performance

- **Cache local** : Données des établissements mises en cache
- **Filtres locaux** : Recherche côté client pour fluidité
- **Chargement différé** : Marqueurs ajoutés progressivement
- **Géolocalisation optimisée** : Permissions gérées intelligemment

## Responsive Design

- **Mobile-first** : Interface adaptée aux smartphones
- **Tablette** : Optimisé pour écrans moyens
- **Desktop** : Pleine utilisation de l'espace disponible

## Accessibilité

- **Navigation clavier** : Tous les éléments accessibles
- **Lecteurs d'écran** : Descriptions ALT appropriées
- **Contrastes** : Respect des standards d'accessibilité
- **Touch-friendly** : Zones de clic adaptées au tactile
