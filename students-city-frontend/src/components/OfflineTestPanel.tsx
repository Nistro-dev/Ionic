import React from 'react';
import { IonButton, IonCard, IonCardContent, IonCardHeader, IonCardTitle } from '@ionic/react';
import { useNetworkContext } from '../contexts/NetworkContext';
import { preloadOfflineData, clearOfflineData } from '../utils/offlineTestData';

const OfflineTestPanel: React.FC = () => {
  const { isOnline, connectionType } = useNetworkContext();

  const handlePreloadData = () => {
    preloadOfflineData();
  };

  const handleClearData = () => {
    clearOfflineData();
  };

  // Afficher seulement en développement
  if (import.meta.env.PROD) return null;

  return (
    <IonCard style={{ margin: '16px', border: '2px dashed #ccc' }}>
      <IonCardHeader>
        <IonCardTitle style={{ fontSize: '1rem' }}>
          🔧 Mode Test - Gestion Hors Ligne
        </IonCardTitle>
      </IonCardHeader>
      <IonCardContent>
        <div style={{ marginBottom: '12px' }}>
          <strong>Statut réseau:</strong> {isOnline ? '🟢 En ligne' : '🔴 Hors ligne'} 
          {isOnline && ` (${connectionType})`}
        </div>
        
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <IonButton 
            size="small" 
            fill="outline" 
            onClick={handlePreloadData}
          >
            Charger données test
          </IonButton>
          
          <IonButton 
            size="small" 
            fill="outline" 
            color="danger" 
            onClick={handleClearData}
          >
            Vider cache
          </IonButton>
        </div>
        
        <p style={{ fontSize: '0.8em', color: '#666', marginTop: '12px', marginBottom: 0 }}>
          Utilisez les outils de développement du navigateur pour simuler le mode hors ligne 
          (Network → Offline) et tester la fonctionnalité.
        </p>
      </IonCardContent>
    </IonCard>
  );
};

export default OfflineTestPanel;
