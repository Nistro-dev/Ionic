import { splashScreenService } from '../services/splashScreen';

// Fonction utilitaire pour tester le splash screen en développement
export const testSplashScreen = {
  // Afficher le splash screen manuellement
  async show() {
    try {
      await splashScreenService.initialize();
      console.log('✅ Splash screen affiché');
    } catch (error) {
      console.error('❌ Erreur lors de l\'affichage:', error);
    }
  },

  // Cacher le splash screen manuellement
  async hide() {
    try {
      await splashScreenService.hide();
      console.log('✅ Splash screen caché');
    } catch (error) {
      console.error('❌ Erreur lors de la fermeture:', error);
    }
  },

  // Forcer la fermeture
  async forceHide() {
    try {
      await splashScreenService.forceHide();
      console.log('✅ Splash screen fermé de force');
    } catch (error) {
      console.error('❌ Erreur lors de la fermeture forcée:', error);
    }
  },

  // Test complet avec timing
  async testComplete() {
    console.log('🧪 Test complet du splash screen...');
    
    console.log('1. Affichage du splash screen');
    await this.show();
    
    console.log('2. Attente de 3 secondes...');
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    console.log('3. Fermeture du splash screen');
    await this.hide();
    
    console.log('✅ Test terminé');
  }
};

// Ajouter les fonctions de test à window pour les utiliser dans la console
if (typeof window !== 'undefined') {
  (window as any).testSplash = testSplashScreen;
}
