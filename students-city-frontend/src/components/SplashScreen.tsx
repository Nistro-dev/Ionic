import React, { useEffect, useState } from 'react';
import './SplashScreen.css';

interface SplashScreenProps {
  isVisible: boolean;
  onHide: () => void;
}

const SplashScreen: React.FC<SplashScreenProps> = ({ isVisible, onHide }) => {
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (!isVisible && isAnimating) {
      // Animation de sortie
      const timer = setTimeout(() => {
        onHide();
      }, 500); // Durée de l'animation de sortie

      return () => clearTimeout(timer);
    }
  }, [isVisible, isAnimating, onHide]);

  useEffect(() => {
    if (isVisible) {
      setIsAnimating(true);
      
      // Auto-hide après 3 secondes
      const timer = setTimeout(() => {
        setIsAnimating(false);
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [isVisible]);

  if (!isVisible && !isAnimating) return null;

  return (
    <div className={`splash-screen ${!isVisible ? 'fade-out' : ''}`}>
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
