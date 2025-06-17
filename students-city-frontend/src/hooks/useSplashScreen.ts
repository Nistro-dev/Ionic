import { useState, useEffect } from 'react';
import { splashScreenService } from '../services/splashScreen';
import { Capacitor } from '@capacitor/core';

export const useSplashScreen = () => {
  const [isVisible, setIsVisible] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const initializeSplash = async () => {
      try {
        // Sur mobile, utiliser le plugin natif
        if (Capacitor.isNativePlatform()) {
          await splashScreenService.initialize();
        }
        
        setIsInitialized(true);
        
        // Simuler le chargement de l'application
        const loadingPromise = new Promise(resolve => {
          // Simuler le temps de chargement initial
          setTimeout(resolve, 1500);
        });

        await loadingPromise;

        // Cacher le splash screen après le chargement
        if (Capacitor.isNativePlatform()) {
          await splashScreenService.hide();
        }
        
        // Pour le web, gérer via l'état React
        setIsVisible(false);
        
      } catch (error) {
        console.error('Erreur lors de l\'initialisation du splash screen:', error);
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
    forceHide
  };
};
