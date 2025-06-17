import React, { useState, useEffect } from "react";
import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonSearchbar,
  IonSelect,
  IonSelectOption,
  IonItem,
  IonLabel,
  IonButton,
  IonIcon,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonModal,
  IonButtons,
  IonToast,
  IonSpinner,
  IonRefresher,
  IonRefresherContent,
} from "@ionic/react";
import {
  locationOutline,
  filterOutline,
  closeOutline,
  starOutline,
  star,
} from "ionicons/icons";
import InteractiveMap from "../components/InteractiveMap";
import { Place, placeService } from "../services/places";
import {
  geolocationService,
  GeolocationPosition,
} from "../services/geolocation";
import { MapPlace } from "../types/map";
import "./MapPage.css";

const MapPage: React.FC = () => {
  const [places, setPlaces] = useState<Place[]>([]);
  const [filteredPlaces, setFilteredPlaces] = useState<Place[]>([]);
  const [userPosition, setUserPosition] = useState<
    GeolocationPosition | undefined
  >();
  const [selectedPlace, setSelectedPlace] = useState<MapPlace | null>(null);
  const [searchText, setSearchText] = useState("");
  const [selectedType, setSelectedType] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [isLocationLoading, setIsLocationLoading] = useState(false);

  const placeTypes = [
    { value: "", label: "Tous les types" },
    { value: "Restaurant", label: "Restaurant" },
    { value: "Bar", label: "Bar" },
    { value: "Café", label: "Café" },
    { value: "Boulangerie", label: "Boulangerie" },
    { value: "Logement", label: "Logement" },
    { value: "Transport", label: "Transport" },
    { value: "Culture", label: "Culture" },
    { value: "Sport", label: "Sport" },
    { value: "Autre", label: "Autre" },
  ];

  const loadPlaces = async () => {
    try {
      setIsLoading(true);
      const data = await placeService.getPlaces();
      setPlaces(data);
      setFilteredPlaces(data);
    } catch (error) {
      console.error("Erreur lors du chargement des lieux:", error);
      setToastMessage("Erreur lors du chargement des lieux");
      setShowToast(true);
    } finally {
      setIsLoading(false);
    }
  };

  const getCurrentLocation = async () => {
    try {
      setIsLocationLoading(true);
      const position = await geolocationService.getCurrentPosition();
      setUserPosition(position);
      setToastMessage("Position trouvée !");
      setShowToast(true);
    } catch (error) {
      console.error("Erreur de géolocalisation:", error);
      setToastMessage("Impossible d'obtenir votre position");
      setShowToast(true);
    } finally {
      setIsLocationLoading(false);
    }
  };

  const filterPlaces = () => {
    let filtered = places;

    if (searchText.trim()) {
      const searchLower = searchText.toLowerCase();
      filtered = filtered.filter(
        (place) =>
          place.name.toLowerCase().includes(searchLower) ||
          place.adresse.toLowerCase().includes(searchLower) ||
          place.description.toLowerCase().includes(searchLower)
      );
    }

    if (selectedType) {
      filtered = filtered.filter((place) => place.type === selectedType);
    }

    setFilteredPlaces(filtered);
  };

  const handlePlaceSelect = (place: MapPlace) => {
    setSelectedPlace(place);
    setIsModalOpen(true);
  };

  const renderStars = (rating: number) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <IonIcon
          key={i}
          icon={i <= rating ? star : starOutline}
          style={{ color: "#ffd700" }}
        />
      );
    }
    return stars;
  };

  const handleRefresh = async (event: CustomEvent) => {
    await loadPlaces();
    event.detail.complete();
  };

  useEffect(() => {
    loadPlaces();
    getCurrentLocation();
  }, []);

  useEffect(() => {
    filterPlaces();
  }, [searchText, selectedType, places]);

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Carte des lieux</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent>
        <IonRefresher slot="fixed" onIonRefresh={handleRefresh}>
          <IonRefresherContent />
        </IonRefresher>

        <div className="map-filters">
          <IonSearchbar
            value={searchText}
            onIonInput={(e) => setSearchText(e.detail.value!)}
            placeholder="Rechercher un lieu..."
            showClearButton="focus"
          />

          <div className="filter-row">
            <IonItem className="type-filter">
              <IonIcon icon={filterOutline} slot="start" />
              <IonLabel>Type</IonLabel>
              <IonSelect
                value={selectedType}
                onIonChange={(e) => setSelectedType(e.detail.value)}
                placeholder="Tous"
              >
                {placeTypes.map((type) => (
                  <IonSelectOption key={type.value} value={type.value}>
                    {type.label}
                  </IonSelectOption>
                ))}
              </IonSelect>
            </IonItem>

            <IonButton
              fill="outline"
              size="small"
              onClick={getCurrentLocation}
              disabled={isLocationLoading}
              className="location-button"
            >
              {isLocationLoading ? (
                <IonSpinner name="dots" />
              ) : (
                <IonIcon icon={locationOutline} />
              )}
            </IonButton>
          </div>
        </div>

        <div className="map-info">
          <p>
            {filteredPlaces.length} lieu{filteredPlaces.length > 1 ? "x" : ""}{" "}
            trouvé{filteredPlaces.length > 1 ? "s" : ""}
            {userPosition && " • Position activée"}
          </p>
          {filteredPlaces.length > 0 && (
            <details
              style={{ fontSize: "0.8rem", color: "#666", marginTop: "8px" }}
            >
              <summary>Debug: Premiers lieux</summary>
              <ul
                style={{
                  fontSize: "0.7rem",
                  maxHeight: "100px",
                  overflow: "auto",
                }}
              >
                {filteredPlaces.slice(0, 3).map((place) => (
                  <li key={place.id}>
                    {place.name} - {place.type} - Lat: {place.latitude}, Lng:{" "}
                    {place.longitude}
                  </li>
                ))}
              </ul>
            </details>
          )}
        </div>

        <div className="map-container">
          {isLoading ? (
            <div className="loading-container">
              <IonSpinner name="crescent" />
              <p>Chargement des lieux...</p>
            </div>
          ) : (
            <InteractiveMap
              places={filteredPlaces}
              userPosition={userPosition}
              onPlaceSelect={handlePlaceSelect}
              className="full-map"
            />
          )}
        </div>

        <IonModal
          isOpen={isModalOpen}
          onDidDismiss={() => setIsModalOpen(false)}
        >
          <IonHeader>
            <IonToolbar>
              <IonTitle>Détails du lieu</IonTitle>
              <IonButtons slot="end">
                <IonButton onClick={() => setIsModalOpen(false)}>
                  <IonIcon icon={closeOutline} />
                </IonButton>
              </IonButtons>
            </IonToolbar>
          </IonHeader>

          <IonContent>
            {selectedPlace && (
              <IonCard>
                <IonCardHeader>
                  <IonCardTitle>{selectedPlace.name}</IonCardTitle>
                </IonCardHeader>

                <IonCardContent>
                  <div className="place-details">
                    <div className="place-type-badge">{selectedPlace.type}</div>

                    <div className="place-rating">
                      <div className="stars">
                        {renderStars(Math.round(selectedPlace.averageRating))}
                      </div>
                      <span className="rating-text">
                        {selectedPlace.averageRating.toFixed(1)} (
                        {selectedPlace.reviewCount} avis)
                      </span>
                    </div>

                    <div className="place-address">
                      <IonIcon icon={locationOutline} />
                      <span>{selectedPlace.address}</span>
                    </div>

                    {selectedPlace.description && (
                      <div className="place-description">
                        <p>{selectedPlace.description}</p>
                      </div>
                    )}

                    <div className="place-coordinates">
                      <small>
                        Coordonnées: {selectedPlace.latitude.toFixed(6)},{" "}
                        {selectedPlace.longitude.toFixed(6)}
                      </small>
                    </div>
                  </div>
                </IonCardContent>
              </IonCard>
            )}
          </IonContent>
        </IonModal>

        <IonToast
          isOpen={showToast}
          onDidDismiss={() => setShowToast(false)}
          message={toastMessage}
          duration={3000}
          position="bottom"
        />
      </IonContent>
    </IonPage>
  );
};

export default MapPage;
