import React from 'react';
import { IonButton, IonCard, IonCardContent, IonCardHeader, IonCardTitle } from '@ionic/react';
import { testSplashScreen } from '../utils/splashScreenTest';

const SplashTestPanel: React.FC = () => {
  // Afficher seulement en développement
  if (import.meta.env.PROD) return null;

  const handleShow = () => {
    testSplashScreen.show();
  };

  const handleHide = () => {
    testSplashScreen.hide();
  };

  const handleForceHide = () => {
    testSplashScreen.forceHide();
  };

  const handleTestComplete = () => {
    testSplashScreen.testComplete();
  };

  return (
    <IonCard style={{ margin: '16px', border: '2px dashed #e74c3c' }}>
      <IonCardHeader>
        <IonCardTitle style={{ fontSize: '1rem' }}>
          🚀 Mode Test - Splash Screen
        </IonCardTitle>
      </IonCardHeader>
      <IonCardContent>
        <div style={{ marginBottom: '12px' }}>
          <strong>Testez le comportement du splash screen :</strong>
        </div>
        
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '12px' }}>
          <IonButton 
            size="small" 
            fill="outline" 
            onClick={handleShow}
          >
            Afficher
          </IonButton>
          
          <IonButton 
            size="small" 
            fill="outline" 
            onClick={handleHide}
          >
            Cacher
          </IonButton>
          
          <IonButton 
            size="small" 
            fill="outline" 
            color="warning"
            onClick={handleForceHide}
          >
            Forcer fermeture
          </IonButton>
        </div>

        <div style={{ marginBottom: '12px' }}>
          <IonButton 
            size="small" 
            expand="block"
            onClick={handleTestComplete}
          >
            Test complet (3s)
          </IonButton>
        </div>
        
        <p style={{ fontSize: '0.8em', color: '#666', marginBottom: 0 }}>
          Le splash screen web s'affiche automatiquement au démarrage. 
          Sur mobile, il utilise le plugin natif Capacitor.
        </p>
      </IonCardContent>
    </IonCard>
  );
};

export default SplashTestPanel;
