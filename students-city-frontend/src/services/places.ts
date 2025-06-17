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

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && 
        !error.config?.url?.includes('/login') && 
        !error.config?.url?.includes('/register')) {
      console.warn('Token expiré ou invalide, déconnexion automatique');
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    
    const errorMessage = error.response?.data?.error ?? 
                        error.response?.data?.message ?? 
                        error.message ?? 
                        'Request failed';
    
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
  async getPlaces(): Promise<Place[]> {
    const response = await api.get('/places');
    return response.data;
  }

  async searchPlaces(params: SearchParams): Promise<Place[]> {
    const searchParams = new URLSearchParams();
    
    if (params.name) searchParams.append('name', params.name);
    if (params.type) searchParams.append('type', params.type);
    if (params.lat) searchParams.append('lat', params.lat.toString());
    if (params.lon) searchParams.append('lon', params.lon.toString());

    const response = await api.get(`/places/search?${searchParams.toString()}`);
    return response.data;
  }

  async getPlace(id: number): Promise<Place> {
    const response = await api.get(`/places/${id}`);
    return response.data;
  }

  async createPlace(data: CreatePlaceData): Promise<{ success: boolean; message: string; place?: Place }> {
    const response = await api.post('/places', data);
    return response.data;
  }

  async getPlaceTypes(): Promise<string[]> {
    const response = await api.get('/places/types');
    return response.data;
  }

  async getUserPlaces(): Promise<Place[]> {
    const response = await api.get('/user/places');
    return response.data;
  }
}

export const placeService = new PlaceService();
