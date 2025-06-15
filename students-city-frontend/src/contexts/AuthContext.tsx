import React, { createContext, useEffect, useState, useMemo } from 'react';
import { User, authService, RegisterResponse } from '../services/auth';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (pseudo: string, email: string, password: string) => Promise<RegisterResponse>;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      try {
        const token = localStorage.getItem('authToken');
        const savedUser = authService.getCurrentUser();
        
        if (token && savedUser) {
          // Vérifier que le token est encore valide
          try {
            // On pourrait ajouter un appel API pour vérifier le token
            setUser(savedUser);
          } catch {
            // Token invalide, nettoyer
            authService.logout();
            setUser(null);
          }
        }
      } catch (error) {
        console.error('Erreur lors de l\'initialisation de l\'auth:', error);
        authService.logout();
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      const response = await authService.login({ email, password });
      localStorage.setItem('authToken', response.token);
      localStorage.setItem('user', JSON.stringify(response.user));
      setUser(response.user);
    } finally {
      setLoading(false);
    }
  };

  const register = async (pseudo: string, email: string, password: string) => {
    setLoading(true);
    try {
      const response = await authService.register({ pseudo, email, password });
      // Ne plus essayer de se connecter automatiquement après l'inscription
      // car le compte est en attente de validation
      return response;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    authService.logout();
    setUser(null);
  };

  const value = useMemo(() => ({
    user,
    isAuthenticated: !!user,
    login,
    register,
    logout,
    loading,
  }), [user, loading]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;
