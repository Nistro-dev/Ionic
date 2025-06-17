import { SplashScreen } from "@capacitor/splash-screen";

class SplashScreenService {
  private readonly MIN_DISPLAY_TIME = 3000;
  private startTime: number = Date.now();

  async initialize(): Promise<void> {
    try {
      this.startTime = Date.now();

      await SplashScreen.show({
        showDuration: this.MIN_DISPLAY_TIME,
        autoHide: false,
      });
    } catch (error) {
      console.warn("Erreur lors de l'initialisation du splash screen:", error);
    }
  }

  async hide(): Promise<void> {
    try {
      const elapsedTime = Date.now() - this.startTime;
      const remainingTime = Math.max(0, this.MIN_DISPLAY_TIME - elapsedTime);

      if (remainingTime > 0) {
        await new Promise((resolve) => setTimeout(resolve, remainingTime));
      }

      await SplashScreen.hide();
    } catch (error) {
      console.warn("Erreur lors de la fermeture du splash screen:", error);
    }
  }

  async forceHide(): Promise<void> {
    try {
      await SplashScreen.hide();
    } catch (error) {
      console.warn(
        "Erreur lors de la fermeture forcée du splash screen:",
        error
      );
    }
  }
}

export const splashScreenService = new SplashScreenService();