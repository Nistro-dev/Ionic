import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';

// Fix pour les icônes par défaut de Leaflet
const DefaultIcon = L.icon({
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

interface SimpleMapProps {
  places: any[];
}

const SimpleMap: React.FC<SimpleMapProps> = ({ places }) => {
  // Position par défaut: Paris
  const defaultCenter: [number, number] = [48.8566, 2.3522];
  
  return (
    <div style={{ height: '400px', width: '100%' }}>
      <MapContainer 
        center={defaultCenter} 
        zoom={10} 
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        
        {places.map((place) => (
          place.latitude && place.longitude && (
            <Marker 
              key={place.id} 
              position={[Number(place.latitude), Number(place.longitude)]}
            >
              <Popup>
                <div>
                  <h3>{place.name}</h3>
                  <p>{place.type}</p>
                  <p>{place.adresse}</p>
                </div>
              </Popup>
            </Marker>
          )
        ))}
      </MapContainer>
    </div>
  );
};

export default SimpleMap;
