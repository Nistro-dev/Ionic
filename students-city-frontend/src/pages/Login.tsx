import React, { useState, useEffect } from 'react';
import {
  IonContent,
  IonPage,
  IonButton,
  IonInput,
  IonItem,
  IonLabel,
  IonToast,
  IonAlert,
} from '@ionic/react';
import { useHistory, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

interface LocationState {
  from?: { pathname: string };
  registrationSuccess?: boolean;
  message?: string;
}

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [showToast, setShowToast] = useState(false);
  const [showRegistrationAlert, setShowRegistrationAlert] = useState(false);
  const [registrationMessage, setRegistrationMessage] = useState('');

  const { login, isAuthenticated } = useAuth();
  const history = useHistory();
  const location = useLocation<LocationState>();

  // Rediriger si déjà connecté
  useEffect(() => {
    if (isAuthenticated) {
      const from = location.state?.from?.pathname ?? '/dashboard';
      history.replace(from);
    }
  }, [isAuthenticated, history, location.state]);

  useEffect(() => {
    if (location.state?.registrationSuccess && location.state?.message) {
      setRegistrationMessage(location.state.message);
      setShowRegistrationAlert(true);
      // Nettoyer l'état pour éviter de ré-afficher le message
      history.replace('/login');
    }
  }, [location.state, history]);

  const handleSubmit = async () => {
    setError('');
    
    if (!email || !password) {
      setError('Veuillez remplir tous les champs');
      return;
    }

    setIsSubmitting(true);
    try {
      await login(email, password);
      setShowToast(true);
      // La redirection sera gérée par l'useEffect ci-dessus
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Email ou mot de passe incorrect';
      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <IonPage>
      <IonContent>
        <div className="auth-container">
          <div className="auth-card luxury-card">
            <h1 className="luxury-title">Connexion</h1>
            <p className="luxury-subtitle">
              Accédez à votre compte Students City
            </p>

            <div className="luxury-form">
              {error && <div className="luxury-error">{error}</div>}

              <IonItem className="luxury-input-item">
                <IonLabel position="stacked">Email</IonLabel>
                <IonInput
                  type="email"
                  placeholder="votre@email.com"
                  value={email}
                  onIonInput={(e) => setEmail(e.detail.value!)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                  className="luxury-input"
                  required
                />
              </IonItem>

              <IonItem className="luxury-input-item">
                <IonLabel position="stacked">Mot de passe</IonLabel>
                <IonInput
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onIonInput={(e) => setPassword(e.detail.value!)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                  className="luxury-input"
                  required
                />
              </IonItem>

              <IonButton
                expand="block"
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="luxury-button"
              >
                {isSubmitting ? 'Connexion...' : 'Se connecter'}
              </IonButton>

              <div className="divider">
                <span>ou</span>
              </div>

              <IonButton
                expand="block"
                fill="clear"
                routerLink="/register"
                className="luxury-link-button"
              >
                Créer un compte
              </IonButton>
            </div>
          </div>
        </div>

        <IonToast
          isOpen={showToast}
          onDidDismiss={() => setShowToast(false)}
          message="Connexion réussie !"
          duration={2000}
          color="success"
        />

        <IonAlert
          isOpen={showRegistrationAlert}
          onDidDismiss={() => setShowRegistrationAlert(false)}
          header="Inscription réussie"
          message={registrationMessage}
          buttons={['OK']}
        />
      </IonContent>
    </IonPage>
  );
};

export default Login;
