import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Intercepteur de réponse pour gérer les erreurs spécifiques aux avis
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 400) {
      const errorData = error.response.data;
      
      // Cas spécial : utilisateur a déjà noté cet établissement
      if (errorData?.message?.includes('déjà noté') && errorData?.existingReview) {
        const customError = new Error('Vous ne pouvez publier qu\'un seul avis par établissement. Vous pouvez modifier votre avis existant.') as DuplicateReviewError;
        customError.existingReview = errorData.existingReview;
        customError.canEdit = errorData.canEdit;
        customError.type = 'DUPLICATE_REVIEW';
        return Promise.reject(customError);
      }
    }
    
    // Autres erreurs
    const errorMessage = error.response?.data?.error ?? 
                        error.response?.data?.message ?? 
                        error.message ?? 
                        'Request failed';
    
    return Promise.reject(new Error(errorMessage));
  }
);

export interface Review {
  id: number;
  user: {
    id: number;
    pseudo: string;
  };
  commentaire: string;
  rating: number;
  createAt: string;
  canEdit?: boolean;
}

export interface DuplicateReviewError extends Error {
  existingReview: Review;
  canEdit: boolean;
  type: 'DUPLICATE_REVIEW';
}

export interface PlaceReviews {
  reviews: Review[];
  averageRating: number;
  reviewCount: number;
}

export interface CreateReviewData {
  place_id: number;
  commentaire: string;
  rating: number;
}

export interface UpdateReviewData {
  commentaire?: string;
  rating?: number;
}

class ReviewService {
  async getPlaceReviews(placeId: number): Promise<PlaceReviews> {
    const response = await api.get(`/places/${placeId}/reviews`);
    return response.data;
  }

  async createReview(data: CreateReviewData): Promise<{ success: boolean; message: string }> {
    try {
      const response = await api.post('/reviews', data);
      return response.data;
    } catch (error) {
      // Si c'est une erreur de duplication, on la relance telle quelle
      // pour que le composant puisse la gérer spécifiquement
      if ((error as DuplicateReviewError).type === 'DUPLICATE_REVIEW') {
        throw error;
      }
      
      // Autres erreurs
      throw new Error(error instanceof Error ? error.message : 'Erreur lors de la création de l\'avis');
    }
  }

  async createOrUpdateReview(placeId: number, data: Omit<CreateReviewData, 'place_id'>): Promise<{ success: boolean; message: string; isNewReview?: boolean }> {
    const response = await api.post(`/places/${placeId}/review`, data);
    return response.data;
  }

  async updateReview(reviewId: number, data: UpdateReviewData): Promise<{ success: boolean; message: string }> {
    const response = await api.put(`/reviews/${reviewId}`, data);
    return response.data;
  }

  async deleteReview(reviewId: number): Promise<{ success: boolean; message: string }> {
    const response = await api.delete(`/reviews/${reviewId}`);
    return response.data;
  }

  async getUserReviews(): Promise<Review[]> {
    const response = await api.get('/reviews');
    return response.data;
  }
}

export const reviewService = new ReviewService();

// Fonction utilitaire pour vérifier si une erreur est de type duplication d'avis
export function isDuplicateReviewError(error: unknown): error is DuplicateReviewError {
  return error instanceof Error && 'type' in error && (error as DuplicateReviewError).type === 'DUPLICATE_REVIEW';
}
