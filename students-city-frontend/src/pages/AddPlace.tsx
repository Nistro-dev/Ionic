import React, { useState } from 'react';
import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonButton,
  IonInput,
  IonItem,
  IonLabel,
  IonTextarea,
  IonSelect,
  IonSelectOption,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonToast,
  IonLoading,
  IonBackButton,
  IonButtons,
} from '@ionic/react';
import { useHistory } from 'react-router-dom';
import { placeService, CreatePlaceData } from '../services/places';
import { geolocationService } from '../services/geolocation';

const PLACE_TYPES = [
  'Restaurant',
  'Café',
  'Bar',
  'Hôtel',
  'Magasin',
  'Supermarché',
  'Pharmacie',
  'Banque',
  'École',
  'Université',
  'Bibliothèque',
  'Parc',
  'Salle de sport',
  'Cinéma',
  'Théâtre',
  'Musée',
  'Autre'
];

const AddPlace: React.FC = () => {
  const [formData, setFormData] = useState<CreatePlaceData>({
    name: '',
    type: '',
    adresse: '',
    description: '',
    latitude: undefined,
    longitude: undefined
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [error, setError] = useState('');
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastColor, setToastColor] = useState<'success' | 'danger'>('success');

  const history = useHistory();

  const handleInputChange = (field: keyof CreatePlaceData, value: string | number | undefined) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const getCurrentLocation = async () => {
    setIsGettingLocation(true);
    try {
      const position = await geolocationService.getCurrentPosition();
      setFormData(prev => ({
        ...prev,
        latitude: position.lat,
        longitude: position.lon
      }));
      setToastMessage('Position obtenue avec succès !');
      setToastColor('success');
      setShowToast(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur de géolocalisation');
    } finally {
      setIsGettingLocation(false);
    }
  };

  const geocodeAddress = async () => {
    if (!formData.adresse.trim()) {
      setError('Veuillez entrer une adresse');
      return;
    }

    setIsGettingLocation(true);
    try {
      const position = await geolocationService.geocodeAddress(formData.adresse);
      if (position) {
        setFormData(prev => ({
          ...prev,
          latitude: position.lat,
          longitude: position.lon
        }));
        setToastMessage('Coordonnées trouvées pour cette adresse !');
        setToastColor('success');
        setShowToast(true);
      } else {
        setError('Impossible de trouver les coordonnées de cette adresse');
      }
    } catch (err) {
      console.error('Geocoding error:', err);
      setError('Erreur lors de la recherche d\'adresse');
    } finally {
      setIsGettingLocation(false);
    }
  };

  const validateForm = (): boolean => {
    if (!formData.name.trim()) {
      setError('Le nom est requis');
      return false;
    }
    if (!formData.type) {
      setError('Le type est requis');
      return false;
    }
    if (!formData.adresse.trim()) {
      setError('L\'adresse est requise');
      return false;
    }
    if (!formData.description.trim()) {
      setError('La description est requise');
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    setError('');
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await placeService.createPlace(formData);
      
      if (response.success) {
        setToastMessage(response.message);
        setToastColor('success');
        setShowToast(true);
        
        setTimeout(() => {
          history.push('/places');
        }, 2000);
      } else {
        setError('Erreur lors de la création de l\'établissement');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la création');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar className="luxury-toolbar">
          <IonButtons slot="start">
            <IonBackButton defaultHref="/places" />
          </IonButtons>
          <IonTitle>Ajouter un établissement</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent className="luxury-content">
        <div style={{ padding: '16px' }}>
          <IonCard className="luxury-card">
            <IonCardHeader>
              <IonCardTitle className="luxury-title">
                Proposer un nouvel établissement
              </IonCardTitle>
            </IonCardHeader>

            <IonCardContent>
              {error && (
                <div className="error-message luxury-error" style={{ marginBottom: '16px' }}>
                  {error}
                </div>
              )}

              <IonItem className="luxury-item">
                <IonLabel position="stacked" className="luxury-label">Nom de l'établissement *</IonLabel>
                <IonInput
                  value={formData.name}
                  onIonInput={(e) => handleInputChange('name', e.detail.value!)}
                  placeholder="Ex: Restaurant Le Gourmet"
                  className="luxury-input"
                  required
                />
              </IonItem>

              <IonItem className="luxury-item">
                <IonLabel position="stacked" className="luxury-label">Type d'établissement *</IonLabel>
                <IonSelect
                  value={formData.type}
                  onIonChange={(e) => handleInputChange('type', e.detail.value)}
                  placeholder="Sélectionner un type"
                  interface="popover"
                  className="luxury-select"
                >
                  {PLACE_TYPES.map(type => (
                    <IonSelectOption key={type} value={type}>{type}</IonSelectOption>
                  ))}
                </IonSelect>
              </IonItem>

              <IonItem className="luxury-item">
                <IonLabel position="stacked" className="luxury-label">Adresse *</IonLabel>
                <IonInput
                  value={formData.adresse}
                  onIonInput={(e) => handleInputChange('adresse', e.detail.value!)}
                  placeholder="Ex: 123 Rue de la Paix, 75001 Paris"
                  className="luxury-input"
                  required
                />
              </IonItem>

              <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
                <IonButton
                  fill="outline"
                  size="small"
                  onClick={getCurrentLocation}
                  disabled={isGettingLocation}
                  className="luxury-button-outline"
                >
                  Position actuelle
                </IonButton>
                <IonButton
                  fill="outline"
                  size="small"
                  onClick={geocodeAddress}
                  disabled={isGettingLocation || !formData.adresse}
                  className="luxury-button-outline"
                >
                  Géocoder adresse
                </IonButton>
              </div>

              {formData.latitude && formData.longitude && (
                <div style={{ 
                  padding: '8px', 
                  background: 'var(--ion-color-success-tint)',
                  borderRadius: '4px',
                  marginBottom: '16px',
                  fontSize: '0.9em'
                }}>
                  📍 Coordonnées: {formData.latitude.toFixed(6)}, {formData.longitude.toFixed(6)}
                </div>
              )}

              <IonItem className="luxury-item">
                <IonLabel position="stacked" className="luxury-label">Description *</IonLabel>
                <IonTextarea
                  value={formData.description}
                  onIonInput={(e) => handleInputChange('description', e.detail.value!)}
                  placeholder="Décrivez brièvement cet établissement..."
                  rows={4}
                  className="luxury-textarea"
                  required
                />
              </IonItem>

              <div style={{ marginTop: '24px', display: 'flex', gap: '12px' }}>
                <IonButton
                  expand="block"
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="luxury-button"
                  style={{ flex: 1 }}
                >
                  {isSubmitting ? 'Création...' : 'Proposer l\'établissement'}
                </IonButton>
                
                <IonButton
                  expand="block"
                  fill="outline"
                  routerLink="/places"
                  className="luxury-button-outline"
                  style={{ flex: 1 }}
                >
                  Annuler
                </IonButton>
              </div>

              <div style={{ 
                marginTop: '16px', 
                padding: '12px',
                background: 'var(--ion-color-warning-tint)',
                borderRadius: '4px',
                fontSize: '0.9em'
              }}>
                ℹ️ Votre proposition sera examinée par un administrateur avant d'être publiée.
              </div>
            </IonCardContent>
          </IonCard>
        </div>

        <IonLoading
          isOpen={isGettingLocation}
          message="Obtention de la position..."
        />

        <IonToast
          isOpen={showToast}
          onDidDismiss={() => setShowToast(false)}
          message={toastMessage}
          duration={3000}
          color={toastColor}
        />
      </IonContent>
    </IonPage>
  );
};

export default AddPlace;
