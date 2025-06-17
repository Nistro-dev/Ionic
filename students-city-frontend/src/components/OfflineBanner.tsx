import React from 'react';
import { IonItem, IonIcon, IonLabel } from '@ionic/react';
import { cloudOffline } from 'ionicons/icons';
import './OfflineBanner.css';

interface OfflineBannerProps {
  isOffline: boolean;
}

const OfflineBanner: React.FC<OfflineBannerProps> = ({ isOffline }) => {
  if (!isOffline) return null;

  return (
    <IonItem className="offline-banner" lines="none">
      <IonIcon icon={cloudOffline} className="offline-icon" slot="start" />
      <IonLabel>
        <span className="offline-text">Mode hors ligne - Données limitées disponibles</span>
      </IonLabel>
    </IonItem>
  );
};

export default OfflineBanner;
