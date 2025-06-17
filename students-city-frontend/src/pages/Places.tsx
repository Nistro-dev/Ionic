import React, { useState, useEffect, useCallback } from 'react';
import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonSearchbar,
  IonSelect,
  IonSelectOption,
  IonButton,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonList,
  IonBadge,
  IonIcon,
  IonFab,
  IonFabButton,
  IonLoading,
  IonToast,
} from '@ionic/react';
import { add, location, star } from 'ionicons/icons';
import { Place, placeService, SearchParams } from '../services/places';
import { geolocationService, GeolocationPosition } from '../services/geolocation';
import { useNetworkContext } from '../contexts/NetworkContext';

const Places: React.FC = () => {
  const [places, setPlaces] = useState<Place[]>([]);
  const [types, setTypes] = useState<string[]>([]);
  const [searchText, setSearchText] = useState('');
  const [selectedType, setSelectedType] = useState<string>('');
  const [userPosition, setUserPosition] = useState<GeolocationPosition | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [showToast, setShowToast] = useState(false);
  const [isFromCache, setIsFromCache] = useState(false);
  
  const { isOnline } = useNetworkContext();

  const loadPlaces = useCallback(async () => {
    setIsLoading(true);
    setError('');
    setIsFromCache(false);
    
    try {
      const searchParams: SearchParams = {
        name: searchText || undefined,
        type: selectedType || undefined,
      };

      // En mode hors ligne, ne pas utiliser la géolocalisation
      if (userPosition && isOnline) {
        searchParams.lat = userPosition.lat;
        searchParams.lon = userPosition.lon;
        searchParams.radius = 50;
      }

      const placesData = await placeService.searchPlaces(searchParams);
      setPlaces(placesData);
      
      // Afficher un message si les données viennent du cache
      if (!isOnline) {
        setIsFromCache(true);
        setError('Données en cache - Certaines informations peuvent être obsolètes');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors du chargement';
      setError(errorMessage);
      
      if (!isOnline) {
        setError('Mode hors ligne - ' + errorMessage);
      }
    } finally {
      setIsLoading(false);
    }
  }, [searchText, selectedType, userPosition, isOnline]);

  const loadTypes = useCallback(async () => {
    try {
      const typesData = await placeService.getPlaceTypes();
      setTypes(typesData);
    } catch (err) {
      console.error('Erreur chargement types:', err);
    }
  }, []);

  const getUserLocation = useCallback(async () => {
    try {
      const position = await geolocationService.getCurrentPosition();
      setUserPosition(position);
    } catch (err) {
      console.warn('Géolocalisation échouée:', err);
    }
  }, []);

  useEffect(() => {
    getUserLocation();
    loadTypes();
  }, [getUserLocation, loadTypes]);

  useEffect(() => {
    loadPlaces();
  }, [loadPlaces]);

  const handleSearch = (text: string) => {
    setSearchText(text);
  };

  const handleTypeFilter = (type: string) => {
    setSelectedType(type);
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <IonIcon
        key={i}
        icon={star}
        color={i < Math.floor(rating) ? 'warning' : 'medium'}
        style={{ fontSize: '14px' }}
      />
    ));
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar className="luxury-toolbar">
          <IonTitle>Établissements</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent className="luxury-content">
        <div className="search-filters" style={{ padding: '16px', background: 'var(--ion-color-light)' }}>
          <IonSearchbar
            value={searchText}
            onIonInput={(e) => handleSearch(e.detail.value!)}
            placeholder="Rechercher un établissement..."
            className="luxury-searchbar"
            style={{ marginBottom: '12px' }}
          />
          
          <IonSelect
            value={selectedType}
            onIonChange={(e) => handleTypeFilter(e.detail.value)}
            placeholder="Filtrer par type"
            interface="popover"
            className="luxury-select"
          >
            <IonSelectOption value="">Tous les types</IonSelectOption>
            {types.map(type => (
              <IonSelectOption key={type} value={type}>{type}</IonSelectOption>
            ))}
          </IonSelect>

          {userPosition && isOnline && (
            <div style={{ 
              marginTop: '12px', 
              padding: '8px 12px', 
              background: 'var(--luxury-success-light)',
              borderRadius: '8px',
              fontSize: '0.9em',
              color: 'var(--luxury-success-dark)'
            }}>
              📍 Position détectée - Tri par distance activé
            </div>
          )}

          {!isOnline && (
            <div style={{ 
              marginTop: '12px', 
              padding: '8px 12px', 
              background: '#ffa726',
              borderRadius: '8px',
              fontSize: '0.9em',
              color: '#333'
            }}>
              ⚠️ Mode hors ligne - Géolocalisation et carte désactivées
            </div>
          )}

          {isFromCache && (
            <div style={{ 
              marginTop: '8px', 
              padding: '8px 12px', 
              background: '#e3f2fd',
              borderRadius: '8px',
              fontSize: '0.8em',
              color: '#1976d2'
            }}>
              📱 Données affichées depuis le cache local
            </div>
          )}
        </div>

        {error && (
          <div className="error-message luxury-error" style={{ margin: '16px' }}>
            {error}
          </div>
        )}

        <div style={{ padding: '0 16px' }}>
          {places.length === 0 && !isLoading && (
            <IonCard className="luxury-card">
              <IonCardContent style={{ textAlign: 'center', padding: '40px 20px' }}>
                <h3 style={{ color: 'var(--luxury-text-secondary)' }}>Aucun établissement trouvé</h3>
                <p style={{ color: 'var(--luxury-text-tertiary)' }}>
                  Essayez de modifier vos critères de recherche ou proposez un nouvel établissement.
                </p>
                <IonButton
                  routerLink="/places/add"
                  className="luxury-button"
                  style={{ marginTop: '16px' }}
                  disabled={!isOnline}
                >
                  {isOnline ? 'Proposer un établissement' : 'Hors ligne - Ajout indisponible'}
                </IonButton>
              </IonCardContent>
            </IonCard>
          )}

          <IonList style={{ background: 'transparent' }}>
            {places.map(place => (
              <IonCard key={place.id} className="luxury-card" style={{ marginBottom: '16px' }}>
                <IonCardHeader>
                  <IonCardTitle className="luxury-card-title">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                      <div>
                        <h3 style={{ margin: '0 0 8px 0', color: 'var(--luxury-text-primary)' }}>
                          {place.name}
                        </h3>
                        <IonBadge 
                          color="primary" 
                          style={{ 
                            background: 'var(--luxury-gradient)',
                            color: 'white',
                            fontWeight: '500'
                          }}
                        >
                          {place.type}
                        </IonBadge>
                      </div>
                      {place.distance && (
                        <IonBadge 
                          color="medium"
                          style={{ 
                            background: 'var(--luxury-secondary)',
                            color: 'white'
                          }}
                        >
                          {place.distance} km
                        </IonBadge>
                      )}
                    </div>
                  </IonCardTitle>
                </IonCardHeader>
                
                <IonCardContent style={{ padding: '0 16px 16px 16px' }}>
                  <p style={{ 
                    margin: '0 0 12px 0',
                    color: 'var(--luxury-text-secondary)',
                    lineHeight: '1.5'
                  }}>
                    {place.description}
                  </p>
                  
                  <p style={{ 
                    fontSize: '0.9em', 
                    color: 'var(--luxury-text-tertiary)',
                    margin: '0 0 12px 0',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}>
                    <IonIcon icon={location} style={{ fontSize: '16px' }} />
                    {place.adresse}
                  </p>
                  
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '8px', 
                    marginBottom: '16px',
                    padding: '8px 12px',
                    background: 'var(--luxury-warning-light)',
                    borderRadius: '8px'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      {renderStars(place.averageRating)}
                    </div>
                    <span style={{ 
                      fontWeight: '600',
                      color: 'var(--luxury-warning-dark)'
                    }}>
                      {place.averageRating.toFixed(1)}
                    </span>
                    <span style={{ color: 'var(--luxury-text-tertiary)' }}>
                      ({place.reviewCount} avis)
                    </span>
                  </div>
                  
                  <IonButton
                    fill="clear"
                    routerLink={`/places/${place.id}`}
                    className="luxury-link-button"
                    style={{ 
                      margin: '0',
                      padding: '0',
                      height: 'auto',
                      '--color': 'var(--luxury-primary)'
                    }}
                  >
                    Voir détails et avis →
                  </IonButton>
                </IonCardContent>
              </IonCard>
            ))}
          </IonList>
        </div>

        <IonFab vertical="bottom" horizontal="end" slot="fixed">
          <IonFabButton 
            routerLink={isOnline ? "/places/add" : undefined}
            className="luxury-fab"
            disabled={!isOnline}
            style={{ 
              '--background': isOnline ? 'var(--luxury-gradient)' : '#ccc',
              '--color': 'white',
              opacity: isOnline ? 1 : 0.6
            }}
          >
            <IonIcon icon={add} />
          </IonFabButton>
        </IonFab>

        <IonLoading
          isOpen={isLoading}
          message="Chargement des établissements..."
        />

        <IonToast
          isOpen={showToast}
          onDidDismiss={() => setShowToast(false)}
          message={error}
          duration={3000}
          color="danger"
        />
      </IonContent>
    </IonPage>
  );
};

export default Places;
