import axios from "axios";
import { localCache } from "./localCache";

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8000/api";

const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("authToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 400) {
      const errorData = error.response.data;

      if (
        errorData?.message?.includes("déjà noté") &&
        errorData?.existingReview
      ) {
        const customError = new Error(
          "Vous ne pouvez publier qu'un seul avis par établissement. Vous pouvez modifier votre avis existant."
        ) as DuplicateReviewError;
        customError.existingReview = errorData.existingReview;
        customError.canEdit = errorData.canEdit;
        customError.type = "DUPLICATE_REVIEW";
        return Promise.reject(customError);
      }
    }

    const errorMessage =
      error.response?.data?.error ??
      error.response?.data?.message ??
      error.message ??
      "Request failed";

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
  type: "DUPLICATE_REVIEW";
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
  private isOnline: boolean = true;

  setOnlineStatus(online: boolean) {
    this.isOnline = online;
  }

  async getPlaceReviews(placeId: number): Promise<PlaceReviews> {
    const cacheKey = `place_reviews_${placeId}`;

    if (!this.isOnline) {
      const cachedReviews = localCache.get<PlaceReviews>(cacheKey);
      if (cachedReviews) {
        return cachedReviews;
      }
      throw new Error("Avis non disponibles en mode hors ligne");
    }

    try {
      const response = await api.get(`/places/${placeId}/reviews`);
      const reviews = response.data;

      localCache.set(cacheKey, reviews, 30 * 60 * 1000);

      return reviews;
    } catch (error) {
      const cachedReviews = localCache.get<PlaceReviews>(cacheKey);
      if (cachedReviews) {
        console.warn("Utilisation du cache suite à une erreur réseau");
        return cachedReviews;
      }
      throw error;
    }
  }

  async createReview(
    data: CreateReviewData
  ): Promise<{ success: boolean; message: string }> {
    if (!this.isOnline) {
      throw new Error("Impossible de créer un avis en mode hors ligne");
    }

    try {
      const response = await api.post("/reviews", data);

      localCache.remove(`place_reviews_${data.place_id}`);

      return response.data;
    } catch (error) {
      if ((error as DuplicateReviewError).type === "DUPLICATE_REVIEW") {
        throw error;
      }

      throw new Error(
        error instanceof Error
          ? error.message
          : "Erreur lors de la création de l'avis"
      );
    }
  }

  async createOrUpdateReview(
    placeId: number,
    data: Omit<CreateReviewData, "place_id">
  ): Promise<{ success: boolean; message: string; isNewReview?: boolean }> {
    if (!this.isOnline) {
      throw new Error("Impossible de modifier un avis en mode hors ligne");
    }

    const response = await api.post(`/places/${placeId}/review`, data);

    localCache.remove(`place_reviews_${placeId}`);

    return response.data;
  }

  async updateReview(
    reviewId: number,
    data: UpdateReviewData
  ): Promise<{ success: boolean; message: string }> {
    if (!this.isOnline) {
      throw new Error("Impossible de modifier un avis en mode hors ligne");
    }

    const response = await api.put(`/reviews/${reviewId}`, data);
    this.clearReviewsCache();

    return response.data;
  }

  async deleteReview(
    reviewId: number
  ): Promise<{ success: boolean; message: string }> {
    if (!this.isOnline) {
      throw new Error("Impossible de supprimer un avis en mode hors ligne");
    }

    const response = await api.delete(`/reviews/${reviewId}`);

    this.clearReviewsCache();

    return response.data;
  }

  async getUserReviews(): Promise<Review[]> {
    if (!this.isOnline) {
      throw new Error("Impossible de récupérer vos avis en mode hors ligne");
    }

    const response = await api.get("/reviews");
    return response.data;
  }

  private clearReviewsCache(): void {
    const keys = Object.keys(localStorage).filter((key) =>
      key.includes("studentsCity_cache_place_reviews_")
    );
    keys.forEach((key) => localStorage.removeItem(key));
  }
}

export const reviewService = new ReviewService();

export function isDuplicateReviewError(
  error: unknown
): error is DuplicateReviewError {
  return (
    error instanceof Error &&
    "type" in error &&
    (error as DuplicateReviewError).type === "DUPLICATE_REVIEW"
  );
}