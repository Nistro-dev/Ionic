import { IonApp, setupIonicReact } from "@ionic/react";
import { AuthProvider } from "./contexts/AuthContext";
import { NetworkProvider } from "./contexts/NetworkContext";
import AppContent from "./components/AppContent";
import SplashScreen from "./components/SplashScreen";
import { useSplashScreen } from "./hooks/useSplashScreen";

import "@ionic/react/css/core.css";

import "@ionic/react/css/normalize.css";
import "@ionic/react/css/structure.css";
import "@ionic/react/css/typography.css";

import "@ionic/react/css/padding.css";
import "@ionic/react/css/float-elements.css";
import "@ionic/react/css/text-alignment.css";
import "@ionic/react/css/text-transformation.css";
import "@ionic/react/css/flex-utils.css";
import "@ionic/react/css/display.css";

import "@ionic/react/css/palettes/dark.system.css";

import "./theme/variables.css";
import "./theme/luxury.css";

setupIonicReact();

const App: React.FC = () => {
  const { isVisible, hideSplash } = useSplashScreen();

  return (
    <IonApp>
      <NetworkProvider>
        <AuthProvider>
          <AppContent />
        </AuthProvider>
      </NetworkProvider>

      <SplashScreen isVisible={isVisible} onHide={hideSplash} />
    </IonApp>
  );
};

export default App;