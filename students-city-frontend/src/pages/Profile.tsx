import React, { useState, useEffect, useCallback } from "react";
import {
  IonContent,
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButton,
  IonInput,
  IonItem,
  IonLabel,
  IonToast,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonLoading,
} from "@ionic/react";
import { useAuth } from "../hooks/useAuth";
import { useNavigation } from "../hooks/useNavigation";
import { profileService } from "../services/profile";

const Profile: React.FC = () => {
  const [pseudo, setPseudo] = useState("");
  const [email, setEmail] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  const { user, logout } = useAuth();
  const { navigateTo } = useNavigation();

  const loadProfile = useCallback(async () => {
    if (!user) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError("");
    try {
      const profile = await profileService.getProfile();
      setPseudo(profile.pseudo ?? "");
      setEmail(profile.email ?? "");
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : "Erreur lors du chargement du profil";
      console.error("Erreur chargement profil:", err);

      if (
        errorMessage.includes("401") ||
        errorMessage.includes("Unauthorized")
      ) {
        logout();
        navigateTo("/login");
        return;
      }

      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [user, logout, navigateTo]);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  const handleSubmit = async () => {
    setError("");

    if (!pseudo.trim() || !email.trim()) {
      setError("Veuillez remplir tous les champs");
      return;
    }

    if (!email.includes("@")) {
      setError("Veuillez entrer une adresse email valide");
      return;
    }

    setIsSubmitting(true);
    try {
      await profileService.updateProfile({
        pseudo: pseudo.trim(),
        email: email.trim(),
      });
      setToastMessage("Profil mis à jour avec succès !");
      setShowToast(true);
      setIsEditing(false);
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : "Erreur lors de la mise à jour";
      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigateTo("/login");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && isEditing) {
      handleSubmit();
    }
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar className="luxury-toolbar">
          <IonTitle>Mon Profil</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent className="luxury-content">
        <div className="profile-container">
          <IonCard className="luxury-card">
            <IonCardHeader>
              <IonCardTitle className="luxury-title">
                Informations personnelles
              </IonCardTitle>
            </IonCardHeader>

            <IonCardContent>
              {error && (
                <div className="error-message luxury-error">{error}</div>
              )}

              <IonItem className="luxury-item">
                <IonLabel position="stacked" className="luxury-label">
                  Pseudo
                </IonLabel>
                <IonInput
                  value={pseudo}
                  onIonInput={(e) => setPseudo(e.detail.value!)}
                  onKeyDown={handleKeyDown}
                  readonly={!isEditing}
                  className="luxury-input"
                  placeholder="Votre pseudo"
                />
              </IonItem>

              <IonItem className="luxury-item">
                <IonLabel position="stacked" className="luxury-label">
                  Email
                </IonLabel>
                <IonInput
                  value={email}
                  onIonInput={(e) => setEmail(e.detail.value!)}
                  onKeyDown={handleKeyDown}
                  readonly={!isEditing}
                  className="luxury-input"
                  placeholder="Votre email"
                  type="email"
                />
              </IonItem>

              <div className="profile-actions">
                {!isEditing ? (
                  <IonButton
                    expand="block"
                    onClick={() => setIsEditing(true)}
                    className="luxury-button"
                  >
                    Modifier
                  </IonButton>
                ) : (
                  <div className="edit-actions">
                    <IonButton
                      expand="block"
                      onClick={handleSubmit}
                      disabled={isSubmitting}
                      className="luxury-button"
                    >
                      {isSubmitting ? "Enregistrement..." : "Enregistrer"}
                    </IonButton>

                    <IonButton
                      expand="block"
                      fill="outline"
                      onClick={() => {
                        setIsEditing(false);
                        loadProfile();
                        setError("");
                      }}
                      className="luxury-button-outline"
                    >
                      Annuler
                    </IonButton>
                  </div>
                )}

                <div className="divider">
                  <span>Actions</span>
                </div>

                <IonButton
                  expand="block"
                  fill="clear"
                  onClick={handleLogout}
                  className="luxury-link-button logout-button"
                >
                  Se déconnecter
                </IonButton>
              </div>
            </IonCardContent>
          </IonCard>
        </div>

        <IonLoading isOpen={isLoading} message="Chargement du profil..." />

        <IonToast
          isOpen={showToast}
          onDidDismiss={() => setShowToast(false)}
          message={toastMessage}
          duration={2000}
          color="success"
        />
      </IonContent>
    </IonPage>
  );
};

export default Profile;