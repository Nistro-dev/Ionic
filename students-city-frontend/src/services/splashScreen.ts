import { SplashScreen } from '@capacitor/splash-screen';

class SplashScreenService {
  private readonly MIN_DISPLAY_TIME = 3000; // 3 secondes minimum
  private startTime: number = Date.now();

  /**
   * Initialise le splash screen
   */
  async initialize(): Promise<void> {
    try {
      this.startTime = Date.now();
      
      // Afficher le splash screen
      await SplashScreen.show({
        showDuration: this.MIN_DISPLAY_TIME,
        autoHide: false
      });
    } catch (error) {
      console.warn('Erreur lors de l\'initialisation du splash screen:', error);
    }
  }

  /**
   * Cache le splash screen en respectant la durée minimum d'affichage
   */
  async hide(): Promise<void> {
    try {
      const elapsedTime = Date.now() - this.startTime;
      const remainingTime = Math.max(0, this.MIN_DISPLAY_TIME - elapsedTime);

      if (remainingTime > 0) {
        // Attendre le temps restant pour respecter la durée minimum
        await new Promise(resolve => setTimeout(resolve, remainingTime));
      }

      // Cacher le splash screen
      await SplashScreen.hide();
    } catch (error) {
      console.warn('Erreur lors de la fermeture du splash screen:', error);
    }
  }

  /**
   * Cache immédiatement le splash screen (pour les cas d'urgence)
   */
  async forceHide(): Promise<void> {
    try {
      await SplashScreen.hide();
    } catch (error) {
      console.warn('Erreur lors de la fermeture forcée du splash screen:', error);
    }
  }
}

export const splashScreenService = new SplashScreenService();
