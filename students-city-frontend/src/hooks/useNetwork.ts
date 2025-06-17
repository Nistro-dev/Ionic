import { useState, useEffect } from 'react';
import { Network } from '@capacitor/network';

export interface NetworkStatus {
  connected: boolean;
  connectionType: string;
}

export const useNetwork = () => {
  const [networkStatus, setNetworkStatus] = useState<NetworkStatus>({
    connected: true,
    connectionType: 'unknown'
  });
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    let listenerHandle: any = null;

    // Fonction pour mettre à jour le statut réseau
    const updateNetworkStatus = (status: any) => {
      setNetworkStatus({
        connected: status.connected,
        connectionType: status.connectionType
      });
    };

    // Obtenir le statut initial
    const getInitialStatus = async () => {
      try {
        const status = await Network.getStatus();
        updateNetworkStatus(status);
        setIsInitialized(true);
      } catch (error) {
        console.error('Erreur lors de la récupération du statut réseau:', error);
        // En cas d'erreur, on assume qu'on est connecté (fallback web)
        setNetworkStatus({ connected: true, connectionType: 'wifi' });
        setIsInitialized(true);
      }
    };

    // Écouter les changements de connectivité
    const setupListener = async () => {
      try {
        listenerHandle = await Network.addListener('networkStatusChange', updateNetworkStatus);
      } catch (error) {
        console.error('Erreur lors de l\'ajout du listener réseau:', error);
      }
    };

    getInitialStatus();
    setupListener();

    // Nettoyage
    return () => {
      if (listenerHandle) {
        listenerHandle.remove();
      }
    };
  }, []);

  return {
    ...networkStatus,
    isInitialized
  };
};
