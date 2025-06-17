# Resources pour Splash Screen

Ce dossier contient les ressources nécessaires pour générer les écrans de démarrage sur toutes les plateformes.

## Fichiers nécessaires

### Logo source (PNG 1024x1024)
- `icon.png` - Icône principale de l'application (1024x1024 px)
- `splash.png` - Image de fond pour le splash screen (2732x2732 px recommandé)

## Génération automatique

Pour générer automatiquement toutes les tailles d'icônes et splash screens :

```bash
# Installer cordova-res (outil de génération Ionic)
npm install -g cordova-res

# Générer toutes les ressources
cordova-res
```

## Tailles générées automatiquement

### Android
- Icônes : 36x36 à 192x192 px
- Splash screens : 320x426 à 1600x2560 px

### iOS
- Icônes : 20x20 à 1024x1024 px  
- Splash screens : 320x568 à 2048x2732 px

## Configuration Capacitor

Les ressources sont automatiquement configurées dans `capacitor.config.ts` :

```typescript
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.studentscity.app',
  appName: 'Students City',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 3000,
      launchAutoHide: true,
      backgroundColor: "#3880ff",
      androidSplashResourceName: "splash",
      androidScaleType: "CENTER_CROP",
      showSpinner: false,
      androidSpinnerStyle: "large",
      iosSpinnerStyle: "small",
      spinnerColor: "#ffffff",
      splashFullScreen: true,
      splashImmersive: true
    }
  }
};

export default config;
```
