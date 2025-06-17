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
    if (
      error.response?.status === 401 &&
      !error.config?.url?.includes("/login") &&
      !error.config?.url?.includes("/register")
    ) {
      console.warn("Token expiré ou invalide, déconnexion automatique");
      localStorage.removeItem("authToken");
      localStorage.removeItem("user");

      if (window.location.pathname !== "/login") {
        window.location.href = "/login";
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

export interface Place {
  id: number;
  name: string;
  type: string;
  adresse: string;
  description: string;
  latitude?: number;
  longitude?: number;
  averageRating: number;
  reviewCount: number;
  distance?: number;
  statut?: string;
  createAt?: string;
}

export interface CreatePlaceData {
  name: string;
  type: string;
  adresse: string;
  description: string;
  latitude?: number;
  longitude?: number;
}

export interface SearchParams {
  name?: string;
  type?: string;
  lat?: number;
  lon?: number;
  radius?: number;
}

class PlaceService {
  private isOnline: boolean = true;

  setOnlineStatus(online: boolean) {
    this.isOnline = online;
  }

  async getPlaces(): Promise<Place[]> {
    const cacheKey = "places_all";

    if (!this.isOnline) {
      const cachedPlaces = localCache.get<Place[]>(cacheKey);
      if (cachedPlaces) {
        return cachedPlaces;
      }
      throw new Error("Aucune donnée disponible en mode hors ligne");
    }

    try {
      const response = await api.get("/places");
      const places = response.data;

      localCache.set(cacheKey, places, 30 * 60 * 1000);

      return places;
    } catch (error) {
      const cachedPlaces = localCache.get<Place[]>(cacheKey);
      if (cachedPlaces) {
        console.warn("Utilisation du cache suite à une erreur réseau");
        return cachedPlaces;
      }
      throw error;
    }
  }

  async searchPlaces(params: SearchParams): Promise<Place[]> {
    const cacheKey = `places_search_${JSON.stringify(params)}`;

    if (!this.isOnline) {
      const cachedResults = localCache.get<Place[]>(cacheKey);
      if (cachedResults) {
        return cachedResults;
      }
      const allPlaces = localCache.get<Place[]>("places_all") || [];
      return this.filterPlacesLocally(allPlaces, params);
    }

    try {
      const searchParams = new URLSearchParams();

      if (params.name) searchParams.append("name", params.name);
      if (params.type) searchParams.append("type", params.type);
      if (params.lat) searchParams.append("lat", params.lat.toString());
      if (params.lon) searchParams.append("lon", params.lon.toString());

      const response = await api.get(
        `/places/search?${searchParams.toString()}`
      );
      const results = response.data;

      localCache.set(cacheKey, results, 15 * 60 * 1000);

      return results;
    } catch (error) {
      const cachedResults = localCache.get<Place[]>(cacheKey);
      if (cachedResults) {
        console.warn("Utilisation du cache suite à une erreur réseau");
        return cachedResults;
      }
      throw error;
    }
  }

  async getPlace(id: number): Promise<Place> {
    const cacheKey = `place_${id}`;

    if (!this.isOnline) {
      const cachedPlace = localCache.get<Place>(cacheKey);
      if (cachedPlace) {
        return cachedPlace;
      }
      throw new Error("Détails du lieu non disponibles en mode hors ligne");
    }

    try {
      const response = await api.get(`/places/${id}`);
      const place = response.data;

      localCache.set(cacheKey, place, 60 * 60 * 1000);

      return place;
    } catch (error) {
      const cachedPlace = localCache.get<Place>(cacheKey);
      if (cachedPlace) {
        console.warn("Utilisation du cache suite à une erreur réseau");
        return cachedPlace;
      }
      throw error;
    }
  }

  async createPlace(
    data: CreatePlaceData
  ): Promise<{ success: boolean; message: string; place?: Place }> {
    if (!this.isOnline) {
      throw new Error("Impossible de créer un lieu en mode hors ligne");
    }

    const response = await api.post("/places", data);
    return response.data;
  }

  async getPlaceTypes(): Promise<string[]> {
    const cacheKey = "place_types";

    if (!this.isOnline) {
      const cachedTypes = localCache.get<string[]>(cacheKey);
      if (cachedTypes) {
        return cachedTypes;
      }
      return ["Restaurant", "Bar", "Café", "Activité", "Autre"];
    }

    try {
      const response = await api.get("/places/types");
      const types = response.data;

      localCache.set(cacheKey, types, 24 * 60 * 60 * 1000);

      return types;
    } catch (error) {
      const cachedTypes = localCache.get<string[]>(cacheKey);
      if (cachedTypes) {
        return cachedTypes;
      }
      throw error;
    }
  }

  async getUserPlaces(): Promise<Place[]> {
    if (!this.isOnline) {
      throw new Error("Impossible de récupérer vos lieux en mode hors ligne");
    }

    const response = await api.get("/user/places");
    return response.data;
  }

  private filterPlacesLocally(places: Place[], params: SearchParams): Place[] {
    return places.filter((place) => {
      if (
        params.name &&
        !place.name.toLowerCase().includes(params.name.toLowerCase())
      ) {
        return false;
      }
      if (params.type && place.type !== params.type) {
        return false;
      }
      return true;
    });
  }
}

export const placeService = new PlaceService();