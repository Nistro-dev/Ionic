import { useState, useEffect } from "react";
import { Network } from "@capacitor/network";

export interface NetworkStatus {
  connected: boolean;
  connectionType: string;
}

export const useNetwork = () => {
  const [networkStatus, setNetworkStatus] = useState<NetworkStatus>({
    connected: true,
    connectionType: "unknown",
  });
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    let listenerHandle: any = null;

    const updateNetworkStatus = (status: any) => {
      setNetworkStatus({
        connected: status.connected,
        connectionType: status.connectionType,
      });
    };

    const getInitialStatus = async () => {
      try {
        const status = await Network.getStatus();
        updateNetworkStatus(status);
        setIsInitialized(true);
      } catch (error) {
        console.error(
          "Erreur lors de la récupération du statut réseau:",
          error
        );
        setNetworkStatus({ connected: true, connectionType: "wifi" });
        setIsInitialized(true);
      }
    };

    const setupListener = async () => {
      try {
        listenerHandle = await Network.addListener(
          "networkStatusChange",
          updateNetworkStatus
        );
      } catch (error) {
        console.error("Erreur lors de l'ajout du listener réseau:", error);
      }
    };

    getInitialStatus();
    setupListener();

    return () => {
      if (listenerHandle) {
        listenerHandle.remove();
      }
    };
  }, []);

  return {
    ...networkStatus,
    isInitialized,
  };
};