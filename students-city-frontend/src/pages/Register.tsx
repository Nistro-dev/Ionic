import React, { useState } from 'react';
import {
  IonContent,
  IonPage,
  IonButton,
  IonInput,
  IonItem,
  IonLabel,
  IonToast,
} from '@ionic/react';
import { useHistory } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const Register: React.FC = () => {
  const [pseudo, setPseudo] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [showToast, setShowToast] = useState(false);

  const { register } = useAuth();
  const history = useHistory();

  const handleSubmit = async () => {
    setError('');
    
    if (!pseudo || !email || !password || !confirmPassword) {
      setError('Veuillez remplir tous les champs');
      return;
    }

    if (password !== confirmPassword) {
      setError('Les mots de passe ne correspondent pas');
      return;
    }

    if (password.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caractères');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await register(pseudo, email, password);
      setShowToast(true);
      // Redirection vers login avec un message de confirmation
      setTimeout(() => {
        history.push('/login', { 
          registrationSuccess: true, 
          message: response.message ?? 'Inscription réussie ! Votre compte est en attente de validation par un administrateur.'
        });
      }, 2000);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Une erreur est survenue lors de l\'inscription';
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
            <h1 className="luxury-title">Inscription</h1>
            <p className="luxury-subtitle">
              Rejoignez la communauté Students City
            </p>

            <div className="luxury-form">
              {error && <div className="luxury-error">{error}</div>}

              <IonItem className="luxury-input-item">
                <IonLabel position="stacked">Pseudo</IonLabel>
                <IonInput
                  type="text"
                  placeholder="Votre pseudo"
                  value={pseudo}
                  onIonInput={(e) => setPseudo(e.detail.value!)}
                  className="luxury-input"
                  required
                />
              </IonItem>

              <IonItem className="luxury-input-item">
                <IonLabel position="stacked">Email</IonLabel>
                <IonInput
                  type="email"
                  placeholder="votre@email.com"
                  value={email}
                  onIonInput={(e) => setEmail(e.detail.value!)}
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
                  className="luxury-input"
                  required
                />
              </IonItem>

              <IonItem className="luxury-input-item">
                <IonLabel position="stacked">Confirmer le mot de passe</IonLabel>
                <IonInput
                  type="password"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onIonInput={(e) => setConfirmPassword(e.detail.value!)}
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
                {isSubmitting ? 'Inscription...' : 'S\'inscrire'}
              </IonButton>

              <div className="divider">
                <span>ou</span>
              </div>

              <IonButton
                expand="block"
                fill="clear"
                routerLink="/login"
                className="luxury-link-button"
              >
                Déjà un compte ? Se connecter
              </IonButton>
            </div>
          </div>
        </div>

        <IonToast
          isOpen={showToast}
          onDidDismiss={() => setShowToast(false)}
          message="Inscription réussie ! Redirection vers la page de connexion..."
          duration={2000}
          color="success"
        />
      </IonContent>
    </IonPage>
  );
};

export default Register;
