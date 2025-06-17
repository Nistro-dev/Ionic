// Script pour précharger des données dans le cache local pour les tests hors ligne
import { localCache } from '../services/localCache';

const samplePlaces = [
  {
    id: 1,
    name: "Restaurant Le Bonheur",
    type: "Restaurant",
    adresse: "123 Rue de la Paix, 75001 Paris",
    description: "Un restaurant chaleureux avec une cuisine traditionnelle française.",
    latitude: 48.8566,
    longitude: 2.3522,
    averageRating: 4.2,
    reviewCount: 15,
    statut: "valide"
  },
  {
    id: 2,
    name: "Café des Arts",
    type: "Café",
    adresse: "456 Boulevard Saint-Germain, 75006 Paris",
    description: "Un café artistique avec une ambiance bohème.",
    latitude: 48.8534,
    longitude: 2.3364,
    averageRating: 3.8,
    reviewCount: 8,
    statut: "valide"
  },
  {
    id: 3,
    name: "Bar La Lune",
    type: "Bar",
    adresse: "789 Rue de Rivoli, 75004 Paris",
    description: "Un bar moderne avec une vue sur la Seine.",
    latitude: 48.8578,
    longitude: 2.3514,
    averageRating: 4.5,
    reviewCount: 22,
    statut: "valide"
  }
];

const sampleReviews = {
  reviews: [
    {
      id: 1,
      user: { id: 1, pseudo: "Alice123" },
      commentaire: "Excellent restaurant ! La cuisine est délicieuse et le service impeccable.",
      rating: 5,
      createAt: "2024-01-15T18:30:00Z",
      canEdit: false
    },
    {
      id: 2,
      user: { id: 2, pseudo: "Bob456" },
      commentaire: "Très bon accueil, plats savoureux. Je recommande vivement !",
      rating: 4,
      createAt: "2024-01-10T19:45:00Z",
      canEdit: true
    }
  ],
  averageRating: 4.5,
  reviewCount: 2
};

const sampleTypes = ["Restaurant", "Café", "Bar", "Activité", "Autre"];

export const preloadOfflineData = () => {
  // Sauvegarder les données de test dans le cache
  localCache.set('places_all', samplePlaces, 24 * 60 * 60 * 1000); // 24h
  localCache.set('place_1', samplePlaces[0], 60 * 60 * 1000); // 1h
  localCache.set('place_2', samplePlaces[1], 60 * 60 * 1000); // 1h
  localCache.set('place_3', samplePlaces[2], 60 * 60 * 1000); // 1h
  localCache.set('place_reviews_1', sampleReviews, 30 * 60 * 1000); // 30min
  localCache.set('place_types', sampleTypes, 24 * 60 * 60 * 1000); // 24h
  
  console.log('✅ Données de test chargées dans le cache pour simulation hors ligne');
};

export const clearOfflineData = () => {
  localCache.clear();
  console.log('🗑️ Cache vidé');
};
