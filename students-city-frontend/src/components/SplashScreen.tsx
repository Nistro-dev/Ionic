import React, { useEffect, useState } from "react";
import "./SplashScreen.css";

interface SplashScreenProps {
  isVisible: boolean;
  onHide: () => void;
}

const SplashScreen: React.FC<SplashScreenProps> = ({ isVisible, onHide }) => {
  const [isAnimating, setIsAnimating] = useState(false);
  const [shouldRender, setShouldRender] = useState(true);

  useEffect(() => {
    if (!isVisible && !isAnimating) {
      // Démarrer l'animation de fade-out
      setIsAnimating(true);
      
      // Retirer complètement le composant après l'animation
      const timer = setTimeout(() => {
        setShouldRender(false);
        onHide();
      }, 500);

      return () => clearTimeout(timer);
    }
  }, [isVisible, isAnimating, onHide]);

  // Ne pas rendre le composant s'il ne doit plus être affiché
  if (!shouldRender) return null;

  return (
    <div className={`splash-screen ${!isVisible ? "fade-out" : ""}`}>
      <div className="splash-content">
        <div className="logo-container">
          <img
            src="/logo.svg"
            alt="Students City Logo"
            className="splash-logo"
          />
        </div>

        <div className="app-title">
          <h1>Students City</h1>
          <p>Découvrez votre ville étudiante</p>
        </div>

        <div className="loading-indicator">
          <div className="loading-dots">
            <span></span>
            <span></span>
            <span></span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SplashScreen;