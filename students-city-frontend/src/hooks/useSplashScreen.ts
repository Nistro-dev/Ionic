import { useState, useEffect } from "react";
import { splashScreenService } from "../services/splashScreen";
import { Capacitor } from "@capacitor/core";

export const useSplashScreen = () => {
  const [isVisible, setIsVisible] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const initializeSplash = async () => {
      try {
        if (Capacitor.isNativePlatform()) {
          await splashScreenService.initialize();
        }

        setIsInitialized(true);

        const loadingPromise = new Promise((resolve) => {
          setTimeout(resolve, 1500);
        });

        await loadingPromise;

        if (Capacitor.isNativePlatform()) {
          await splashScreenService.hide();
        }

        setIsVisible(false);
      } catch (error) {
        console.error(
          "Erreur lors de l'initialisation du splash screen:",
          error
        );
        setIsVisible(false);
        setIsInitialized(true);
      }
    };

    initializeSplash();
  }, []);

  const hideSplash = () => {
    setIsVisible(false);
  };

  const forceHide = async () => {
    if (Capacitor.isNativePlatform()) {
      await splashScreenService.forceHide();
    }
    setIsVisible(false);
  };

  return {
    isVisible,
    isInitialized,
    hideSplash,
    forceHide,
  };
};