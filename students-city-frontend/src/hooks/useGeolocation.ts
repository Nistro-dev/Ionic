import { useState, useEffect } from "react";
import {
  geolocationService,
  GeolocationPosition,
} from "../services/geolocation";

export const useGeolocation = (autoRequest: boolean = false) => {
  const [position, setPosition] = useState<GeolocationPosition | undefined>();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);

  const requestPosition = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const currentPosition = await geolocationService.getCurrentPosition();
      setPosition(currentPosition);
      setHasPermission(true);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Erreur de géolocalisation";
      setError(errorMessage);
      setHasPermission(false);
    } finally {
      setIsLoading(false);
    }
  };

  const clearPosition = () => {
    setPosition(undefined);
    setError(null);
  };

  const checkPermission = async () => {
    if ("permissions" in navigator) {
      try {
        const permission = await navigator.permissions.query({
          name: "geolocation",
        });
        setHasPermission(permission.state === "granted");

        permission.addEventListener("change", () => {
          setHasPermission(permission.state === "granted");
          if (permission.state === "denied") {
            clearPosition();
          }
        });
      } catch (err) {
        console.warn(
          "Impossible de vérifier les permissions de géolocalisation:",
          err
        );
        setHasPermission(null);
      }
    }
  };

  useEffect(() => {
    checkPermission();

    if (autoRequest) {
      requestPosition();
    }
  }, [autoRequest]);

  return {
    position,
    error,
    isLoading,
    hasPermission,
    requestPosition,
    clearPosition,
  };
};
