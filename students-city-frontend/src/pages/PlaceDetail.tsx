import React, { useState, useEffect, useCallback } from 'react';
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
  IonList,
  IonItem,
  IonLabel,
  IonBadge,
  IonIcon,
  IonTextarea,
  IonRange,
  IonLoading,
  IonToast,
  IonBackButton,
  IonButtons,
  IonAlert,
} from '@ionic/react';
import { star, location, time, person, create, trash, cloudOffline } from 'ionicons/icons';
import { useParams } from 'react-router-dom';
import { Place, placeService } from '../services/places';
import { Review, PlaceReviews, reviewService, CreateReviewData, UpdateReviewData } from '../services/reviews';
import { useAuth } from '../hooks/useAuth';
import { useNetworkContext } from '../contexts/NetworkContext';

const PlaceDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { isOnline } = useNetworkContext();
  const [place, setPlace] = useState<Place | null>(null);
  const [reviews, setReviews] = useState<PlaceReviews | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastColor, setToastColor] = useState<'success' | 'danger'>('success');
  const [isFromCache, setIsFromCache] = useState(false);
  
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewText, setReviewText] = useState('');
  const [reviewRating, setReviewRating] = useState(5);
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  
  const [editingReview, setEditingReview] = useState<Review | null>(null);
  const [showDeleteAlert, setShowDeleteAlert] = useState(false);
  const [reviewToDelete, setReviewToDelete] = useState<Review | null>(null);

  const { user } = useAuth();

  const loadPlace = useCallback(async () => {
    if (!id) return;
    
    try {
      const placeData = await placeService.getPlace(parseInt(id));
      setPlace(placeData);
      
      if (!isOnline) {
        setIsFromCache(true);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors du chargement';
      setError(!isOnline ? `Mode hors ligne - ${errorMessage}` : errorMessage);
    }
  }, [id, isOnline]);

  const loadReviews = useCallback(async () => {
    if (!id) return;
    
    try {
      const reviewsData = await reviewService.getPlaceReviews(parseInt(id));
      setReviews(reviewsData);
    } catch (err) {
      console.error('Erreur chargement avis:', err);
      if (!isOnline) {
        setError('Avis non disponibles en mode hors ligne');
      }
    }
  }, [id, isOnline]);

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      await Promise.all([loadPlace(), loadReviews()]);
      setIsLoading(false);
    };
    
    loadData();
  }, [loadPlace, loadReviews]);

  const renderStars = (rating: number, size = 'default') => {
    const starSize = size === 'large' ? '20px' : '16px';
    return Array.from({ length: 5 }, (_, i) => (
      <IonIcon
        key={i}
        icon={star}
        color={i < Math.floor(rating) ? 'warning' : 'medium'}
        style={{ fontSize: starSize }}
      />
    ));
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const handleSubmitReview = async () => {
    if (!isOnline) {
      setError('Impossible de publier un avis en mode hors ligne');
      setShowToast(true);
      return;
    }
    
    if (!place || !reviewText.trim()) {
      setError('Veuillez remplir tous les champs');
      return;
    }

    setIsSubmittingReview(true);
    try {
      const reviewData: CreateReviewData = {
        place_id: place.id,
        commentaire: reviewText.trim(),
        rating: reviewRating
      };

      const response = await reviewService.createReview(reviewData);
      
      if (response.success) {
        setToastMessage(response.message);
        setToastColor('success');
        setShowToast(true);
        setShowReviewForm(false);
        setReviewText('');
        setReviewRating(5);
        await loadReviews();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de l\'ajout de l\'avis');
    } finally {
      setIsSubmittingReview(false);
    }
  };

  const handleEditReview = async () => {
    if (!isOnline) {
      setError('Impossible de modifier un avis en mode hors ligne');
      setShowToast(true);
      return;
    }
    
    if (!editingReview || !reviewText.trim()) {
      setError('Veuillez remplir tous les champs');
      return;
    }

    setIsSubmittingReview(true);
    try {
      const updateData: UpdateReviewData = {
        commentaire: reviewText.trim(),
        rating: reviewRating
      };

      const response = await reviewService.updateReview(editingReview.id, updateData);
      
      if (response.success) {
        setToastMessage(response.message);
        setToastColor('success');
        setShowToast(true);
        setEditingReview(null);
        setReviewText('');
        setReviewRating(5);
        await loadReviews();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la modification');
    } finally {
      setIsSubmittingReview(false);
    }
  };

  const confirmDeleteReview = (review: Review) => {
    setReviewToDelete(review);
    setShowDeleteAlert(true);
  };

  const handleDeleteReview = async () => {
    if (!isOnline) {
      setError('Impossible de supprimer un avis en mode hors ligne');
      setShowToast(true);
      setShowDeleteAlert(false);
      setReviewToDelete(null);
      return;
    }
    
    if (!reviewToDelete) return;

    try {
      const response = await reviewService.deleteReview(reviewToDelete.id);
      
      if (response.success) {
        setToastMessage(response.message);
        setToastColor('success');
        setShowToast(true);
        await loadReviews();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la suppression');
    } finally {
      setShowDeleteAlert(false);
      setReviewToDelete(null);
    }
  };

  const startEditReview = (review: Review) => {
    setEditingReview(review);
    setReviewText(review.commentaire);
    setReviewRating(review.rating);
    setShowReviewForm(true);
  };

  const cancelReviewForm = () => {
    setShowReviewForm(false);
    setEditingReview(null);
    setReviewText('');
    setReviewRating(5);
    setError('');
  };

  if (!place && !isLoading) {
    return (
      <IonPage>
        <IonHeader>
          <IonToolbar className="luxury-toolbar">
            <IonButtons slot="start">
              <IonBackButton defaultHref="/places" />
            </IonButtons>
            <IonTitle>Établissement introuvable</IonTitle>
          </IonToolbar>
        </IonHeader>
        <IonContent>
          <div style={{ padding: '20px', textAlign: 'center' }}>
            <p>Cet établissement n'existe pas ou n'est pas encore validé.</p>
            <IonButton routerLink="/places" className="luxury-button">
              Retour aux établissements
            </IonButton>
          </div>
        </IonContent>
      </IonPage>
    );
  }

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar className="luxury-toolbar">
          <IonButtons slot="start">
            <IonBackButton defaultHref="/places" />
          </IonButtons>
          <IonTitle>{place?.name || 'Chargement...'}</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent className="luxury-content">
        {error && (
          <div className="error-message luxury-error" style={{ margin: '16px' }}>
            {error}
          </div>
        )}

        {!isOnline && (
          <IonCard style={{ margin: '16px', background: '#ffa726' }}>
            <IonCardContent>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <IonIcon icon={cloudOffline} style={{ color: '#333' }} />
                <span style={{ color: '#333', fontWeight: 'bold' }}>
                  Mode hors ligne
                </span>
              </div>
              <p style={{ color: '#333', margin: '8px 0 0 0', fontSize: '0.9em' }}>
                Les actions de création, modification et suppression d'avis sont désactivées.
              </p>
            </IonCardContent>
          </IonCard>
        )}

        {isFromCache && (
          <IonCard style={{ margin: '16px', background: '#e3f2fd' }}>
            <IonCardContent>
              <p style={{ color: '#1976d2', margin: 0, fontSize: '0.9em' }}>
                📱 Ces informations proviennent du cache local et peuvent être obsolètes.
              </p>
            </IonCardContent>
          </IonCard>
        )}

        {place && (
          <>
            <IonCard className="luxury-card" style={{ margin: '16px' }}>
              <IonCardHeader>
                <IonCardTitle className="luxury-title">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                    <div>
                      <h2>{place.name}</h2>
                      <IonBadge color="primary">{place.type}</IonBadge>
                    </div>
                  </div>
                </IonCardTitle>
              </IonCardHeader>

              <IonCardContent>
                <p>{place.description}</p>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: '12px 0' }}>
                  <IonIcon icon={location} color="medium" />
                  <span style={{ color: 'var(--ion-color-medium)' }}>{place.adresse}</span>
                </div>

                {reviews && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      {renderStars(reviews.averageRating, 'large')}
                    </div>
                    <span style={{ fontSize: '18px', fontWeight: 'bold' }}>
                      {reviews.averageRating.toFixed(1)}
                    </span>
                    <span style={{ color: 'var(--ion-color-medium)' }}>
                      ({reviews.reviewCount} avis)
                    </span>
                  </div>
                )}
              </IonCardContent>
            </IonCard>

            <IonCard className="luxury-card" style={{ margin: '16px' }}>
              <IonCardHeader>
                <IonCardTitle className="luxury-title">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span>Avis ({reviews?.reviewCount || 0})</span>
                    {!showReviewForm && (
                      <IonButton
                        size="small"
                        onClick={() => setShowReviewForm(true)}
                        className="luxury-button"
                        disabled={!isOnline}
                      >
                        {isOnline ? 'Ajouter un avis' : 'Hors ligne - Avis indisponible'}
                      </IonButton>
                    )}
                  </div>
                </IonCardTitle>
              </IonCardHeader>

              <IonCardContent>
                {showReviewForm && (
                  <div style={{ marginBottom: '24px', padding: '16px', background: 'var(--ion-color-light)', borderRadius: '8px' }}>
                    <h4>{editingReview ? 'Modifier votre avis' : 'Votre avis'}</h4>
                    
                    <div style={{ margin: '16px 0' }}>
                      <IonLabel>Note: {reviewRating}/5</IonLabel>
                      <IonRange
                        min={1}
                        max={5}
                        step={1}
                        value={reviewRating}
                        onIonChange={(e) => setReviewRating(e.detail.value as number)}
                        pin={true}
                        color="warning"
                      />
                      <div style={{ display: 'flex', justifyContent: 'center', margin: '8px 0' }}>
                        {renderStars(reviewRating, 'large')}
                      </div>
                    </div>

                    <IonTextarea
                      value={reviewText}
                      onIonInput={(e) => setReviewText(e.detail.value!)}
                      placeholder="Partagez votre expérience..."
                      rows={4}
                      className="luxury-textarea"
                      style={{ border: '1px solid var(--ion-color-medium)', borderRadius: '4px' }}
                    />

                    <div style={{ display: 'flex', gap: '8px', marginTop: '16px' }}>
                      <IonButton
                        size="small"
                        onClick={editingReview ? handleEditReview : handleSubmitReview}
                        disabled={isSubmittingReview || !reviewText.trim()}
                        className="luxury-button"
                      >
                        {isSubmittingReview ? 'Envoi...' : editingReview ? 'Modifier' : 'Publier'}
                      </IonButton>
                      <IonButton
                        size="small"
                        fill="outline"
                        onClick={cancelReviewForm}
                        className="luxury-button-outline"
                      >
                        Annuler
                      </IonButton>
                    </div>
                  </div>
                )}

                {reviews && reviews.reviews.length > 0 ? (
                  <IonList>
                    {reviews.reviews.map(review => (
                      <IonItem key={review.id} lines="full">
                        <IonLabel>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '8px' }}>
                            <div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <IonIcon icon={person} color="medium" />
                                <strong>{review.user.pseudo}</strong>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                  {renderStars(review.rating)}
                                </div>
                              </div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '4px' }}>
                                <IonIcon icon={time} color="medium" style={{ fontSize: '12px' }} />
                                <span style={{ fontSize: '0.8em', color: 'var(--ion-color-medium)' }}>
                                  {formatDate(review.createAt)}
                                </span>
                              </div>
                            </div>
                            {review.canEdit && (
                              <div style={{ display: 'flex', gap: '4px' }}>
                                <IonButton
                                  fill="clear"
                                  size="small"
                                  onClick={() => startEditReview(review)}
                                >
                                  <IonIcon icon={create} />
                                </IonButton>
                                <IonButton
                                  fill="clear"
                                  size="small"
                                  color="danger"
                                  onClick={() => confirmDeleteReview(review)}
                                >
                                  <IonIcon icon={trash} />
                                </IonButton>
                              </div>
                            )}
                          </div>
                          <p style={{ margin: '8px 0 0 0' }}>{review.commentaire}</p>
                        </IonLabel>
                      </IonItem>
                    ))}
                  </IonList>
                ) : (
                  <div style={{ textAlign: 'center', padding: '20px', color: 'var(--ion-color-medium)' }}>
                    Aucun avis pour le moment. Soyez le premier à laisser un avis !
                  </div>
                )}
              </IonCardContent>
            </IonCard>
          </>
        )}

        <IonLoading
          isOpen={isLoading}
          message="Chargement..."
        />

        <IonToast
          isOpen={showToast}
          onDidDismiss={() => setShowToast(false)}
          message={toastMessage}
          duration={3000}
          color={toastColor}
        />

        <IonAlert
          isOpen={showDeleteAlert}
          onDidDismiss={() => setShowDeleteAlert(false)}
          header="Supprimer l'avis"
          message="Êtes-vous sûr de vouloir supprimer cet avis ? Cette action est irréversible."
          buttons={[
            {
              text: 'Annuler',
              role: 'cancel'
            },
            {
              text: 'Supprimer',
              role: 'destructive',
              handler: handleDeleteReview
            }
          ]}
        />
      </IonContent>
    </IonPage>
  );
};

export default PlaceDetail;
