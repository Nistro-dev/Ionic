import React, { useEffect, useState, useCallback } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { MapPlace, MapCenter } from "../types/map";
import { Place } from "../services/places";
import { GeolocationPosition } from "../services/geolocation";
import "./InteractiveMap.css";

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

const userIcon = new L.Icon({
  iconUrl: "https://cdn-icons-png.flaticon.com/512/1077/1077114.png",
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32],
});

const getPlaceIcon = (type: string) => {
  const iconMap: { [key: string]: string } = {
    restaurant: "https://cdn-icons-png.flaticon.com/512/1046/1046755.png",
    bar: "https://cdn-icons-png.flaticon.com/512/920/920569.png",
    cafe: "https://cdn-icons-png.flaticon.com/512/2276/2276931.png",
    café: "https://cdn-icons-png.flaticon.com/512/2276/2276931.png",
    boulangerie: "https://cdn-icons-png.flaticon.com/512/2276/2276931.png",
    logement: "https://cdn-icons-png.flaticon.com/512/1946/1946488.png",
    transport: "https://cdn-icons-png.flaticon.com/512/3003/3003035.png",
    culture: "https://cdn-icons-png.flaticon.com/512/2913/2913465.png",
    sport: "https://cdn-icons-png.flaticon.com/512/857/857681.png",
    autre: "https://cdn-icons-png.flaticon.com/512/854/854878.png",
  };

  return new L.Icon({
    iconUrl: iconMap[type.toLowerCase()] || iconMap["autre"],
    iconSize: [28, 28],
    iconAnchor: [14, 28],
    popupAnchor: [0, -28],
  });
};

interface PlaceMarkerProps {
  place: MapPlace;
  onPlaceSelect: (place: MapPlace) => void;
}

const PlaceMarker: React.FC<PlaceMarkerProps> = ({ place, onPlaceSelect }) => {
  const handleMarkerClick = () => {
    onPlaceSelect(place);
  };

  const renderStars = (rating: number) => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

    return (
      <div className="rating-stars">
        {"★".repeat(fullStars)}
        {hasHalfStar && "☆"}
        {"☆".repeat(emptyStars)}
      </div>
    );
  };

  return (
    <Marker
      position={[place.latitude, place.longitude]}
      icon={getPlaceIcon(place.type)}
      eventHandlers={{
        click: handleMarkerClick,
      }}
    >
      <Popup>
        <div className="place-popup">
          <h3 className="place-name">{place.name}</h3>
          <p className="place-type">{place.type}</p>
          <p className="place-address">{place.address}</p>
          <div className="place-rating">
            {renderStars(place.averageRating)}
            <span className="rating-value">
              {place.averageRating.toFixed(1)} ({place.reviewCount} avis)
            </span>
          </div>
          {place.description && (
            <p className="place-description">{place.description}</p>
          )}
        </div>
      </Popup>
    </Marker>
  );
};

interface MapUpdaterProps {
  center: MapCenter;
  zoom: number;
}

const MapUpdater: React.FC<MapUpdaterProps> = ({ center, zoom }) => {
  const map = useMap();

  useEffect(() => {
    map.setView([center.lat, center.lng], zoom);
  }, [map, center, zoom]);

  return null;
};

interface InteractiveMapProps {
  places: Place[];
  userPosition?: GeolocationPosition;
  onPlaceSelect?: (place: MapPlace) => void;
  className?: string;
}

const InteractiveMap: React.FC<InteractiveMapProps> = ({
  places,
  userPosition,
  onPlaceSelect,
  className = "",
}) => {
  const [mapCenter, setMapCenter] = useState<MapCenter>({
    lat: 43.6047, // Toulouse par défaut
    lng: 1.4442,
  });
  const [zoom, setZoom] = useState(13);
  const [mapPlaces, setMapPlaces] = useState<MapPlace[]>([]);

  useEffect(() => {
    const validPlaces = places
      .filter((place) => place.latitude != null && place.longitude != null)
      .map((place) => ({
        id: place.id,
        name: place.name,
        type: place.type,
        address: place.adresse,
        latitude: Number(place.latitude!),
        longitude: Number(place.longitude!),
        averageRating: place.averageRating,
        reviewCount: place.reviewCount,
        description: place.description,
      }));

    setMapPlaces(validPlaces);

    if (validPlaces.length > 0 && !userPosition) {
      const firstPlace = validPlaces[0];
      setMapCenter({
        lat: firstPlace.latitude,
        lng: firstPlace.longitude,
      });
      setZoom(12);
    }
  }, [places]);

  useEffect(() => {
    if (userPosition) {
      setMapCenter({
        lat: userPosition.lat,
        lng: userPosition.lon,
      });
      setZoom(15);
    }
  }, [userPosition]);

  const handlePlaceSelect = useCallback(
    (place: MapPlace) => {
      if (onPlaceSelect) {
        onPlaceSelect(place);
      }
    },
    [onPlaceSelect]
  );

  return (
    <div className={`interactive-map ${className}`}>
      <MapContainer
        center={[mapCenter.lat, mapCenter.lng]}
        zoom={zoom}
        style={{ height: "100%", width: "100%" }}
        className="leaflet-container"
      >
        <MapUpdater center={mapCenter} zoom={zoom} />

        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {userPosition && (
          <Marker
            position={[userPosition.lat, userPosition.lon]}
            icon={userIcon}
          >
            <Popup>
              <div className="user-popup">
                <h3>Votre position</h3>
                <p>Vous êtes ici</p>
              </div>
            </Popup>
          </Marker>
        )}

        {mapPlaces.map((place) => (
          <PlaceMarker
            key={place.id}
            place={place}
            onPlaceSelect={handlePlaceSelect}
          />
        ))}
      </MapContainer>
    </div>
  );
};

export default InteractiveMap;