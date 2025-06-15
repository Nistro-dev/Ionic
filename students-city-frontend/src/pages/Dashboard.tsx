import React from 'react';
import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonButton,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
} from '@ionic/react';
import { useAuth } from '../hooks/useAuth';

const Dashboard: React.FC = () => {
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Dashboard</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen>
        <div style={{ padding: '20px' }}>
          <IonCard className="luxury-card">
            <IonCardHeader>
              <IonCardTitle className="luxury-title" style={{ fontSize: '1.5rem' }}>
                Bienvenue, {user?.pseudo ?? user?.email} !
              </IonCardTitle>
            </IonCardHeader>
            <IonCardContent>
              <p className="luxury-subtitle">
                Vous êtes connecté à Students City
              </p>
              <p style={{ marginBottom: '1rem', color: 'var(--luxury-text-secondary)' }}>
                Email: {user?.email}
              </p>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <IonButton
                  expand="block"
                  routerLink="/profile"
                  style={{ 
                    '--background': 'var(--luxury-gradient)',
                    '--color': 'white'
                  }}
                >
                  Mon Profil
                </IonButton>
                
                <IonButton
                  expand="block"
                  fill="outline"
                  onClick={handleLogout}
                  style={{ 
                    '--border-color': 'var(--luxury-gold)',
                    '--color': 'var(--luxury-gold)'
                  }}
                >
                  Se déconnecter
                </IonButton>
              </div>
            </IonCardContent>
          </IonCard>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default Dashboard;
