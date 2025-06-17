import React, { createContext, useContext, useEffect, useMemo, ReactNode } from 'react';
import { useNetwork } from '../hooks/useNetwork';
import { placeService } from '../services/places';
import { reviewService } from '../services/reviews';
import { localCache } from '../services/localCache';

interface NetworkContextType {
  isOnline: boolean;
  connectionType: string;
  isInitialized: boolean;
}

const NetworkContext = createContext<NetworkContextType | undefined>(undefined);

interface NetworkProviderProps {
  children: ReactNode;
}

export const NetworkProvider: React.FC<NetworkProviderProps> = ({ children }) => {
  const { connected, connectionType, isInitialized } = useNetwork();

  useEffect(() => {
    // Mettre à jour le statut de connectivité dans les services
    placeService.setOnlineStatus(connected);
    reviewService.setOnlineStatus(connected);

    // Nettoyer le cache expiré périodiquement
    if (connected) {
      localCache.cleanExpired();
    }
  }, [connected]);

  const value = useMemo<NetworkContextType>(() => ({
    isOnline: connected,
    connectionType,
    isInitialized
  }), [connected, connectionType, isInitialized]);

  return (
    <NetworkContext.Provider value={value}>
      {children}
    </NetworkContext.Provider>
  );
};

export const useNetworkContext = (): NetworkContextType => {
  const context = useContext(NetworkContext);
  if (context === undefined) {
    throw new Error('useNetworkContext must be used within a NetworkProvider');
  }
  return context;
};
