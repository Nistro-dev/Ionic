import axios from "axios";
import { Capacitor } from "@capacitor/core";

// Configuration de l'URL API selon l'environnement
const getApiUrl = () => {
  // Pour l'émulateur iOS, utiliser localhost car il accède au localhost de la machine hôte
  // Pour un vrai device, il faudrait l'IP locale ou ngrok
  if (Capacitor.isNativePlatform()) {
    // Vérifier si on est dans un émulateur ou un vrai device
    // Pour l'instant, on utilise localhost pour l'émulateur
    return "http://localhost:8000/api";
  }
  // Sinon utiliser la variable d'environnement ou localhost
  return import.meta.env.VITE_API_URL ?? "http://localhost:8000/api";
};

const API_URL = getApiUrl();

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

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  pseudo: string;
  email: string;
  password: string;
}

export interface User {
  email: string;
  roles: string[];
  pseudo?: string;
  id?: number;
  photo?: string;
}

export interface AuthResponse {
  token: string;
  user: User;
  redirect?: string;
}

export interface RegisterResponse {
  message: string;
}

export const authService = {
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const response = await api.post("/login", credentials);
    return response.data;
  },

  register: async (data: RegisterData): Promise<RegisterResponse> => {
    const response = await api.post("/register", data);
    return response.data;
  },

  logout: () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("user");
  },

  getCurrentUser: (): User | null => {
    const userStr = localStorage.getItem("user");
    return userStr ? JSON.parse(userStr) : null;
  },

  isAuthenticated: (): boolean => {
    return !!localStorage.getItem("authToken");
  },
};

export default api;