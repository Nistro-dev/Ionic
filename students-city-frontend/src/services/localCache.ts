// Service de cache local pour la gestion hors ligne
export interface CacheData<T> {
  data: T;
  timestamp: number;
  expiresIn?: number; // en millisecondes
}

class LocalCacheService {
  private readonly PREFIX = 'studentsCity_cache_';
  private readonly DEFAULT_EXPIRY = 24 * 60 * 60 * 1000; // 24 heures

  // Sauvegarder des données dans le cache
  set<T>(key: string, data: T, expiresIn: number = this.DEFAULT_EXPIRY): void {
    try {
      const cacheData: CacheData<T> = {
        data,
        timestamp: Date.now(),
        expiresIn
      };
      localStorage.setItem(this.PREFIX + key, JSON.stringify(cacheData));
    } catch (error) {
      console.error('Erreur lors de la sauvegarde dans le cache:', error);
    }
  }

  // Récupérer des données du cache
  get<T>(key: string): T | null {
    try {
      const cached = localStorage.getItem(this.PREFIX + key);
      if (!cached) return null;

      const cacheData: CacheData<T> = JSON.parse(cached);
      
      // Vérifier si les données ont expiré
      if (cacheData.expiresIn && 
          Date.now() - cacheData.timestamp > cacheData.expiresIn) {
        this.remove(key);
        return null;
      }

      return cacheData.data;
    } catch (error) {
      console.error('Erreur lors de la récupération du cache:', error);
      return null;
    }
  }

  // Supprimer un élément du cache
  remove(key: string): void {
    try {
      localStorage.removeItem(this.PREFIX + key);
    } catch (error) {
      console.error('Erreur lors de la suppression du cache:', error);
    }
  }

  // Vérifier si des données existent et sont valides
  has(key: string): boolean {
    return this.get(key) !== null;
  }

  // Nettoyer tout le cache expiré
  cleanExpired(): void {
    try {
      const keys = Object.keys(localStorage).filter(key => key.startsWith(this.PREFIX));
      
      keys.forEach(fullKey => {
        const cached = localStorage.getItem(fullKey);
        
        if (cached) {
          try {
            const cacheData: CacheData<any> = JSON.parse(cached);
            if (cacheData.expiresIn && 
                Date.now() - cacheData.timestamp > cacheData.expiresIn) {
              localStorage.removeItem(fullKey);
            }
          } catch (parseError) {
            // Si on ne peut pas parser, on supprime le cache corrompu
            console.warn('Cache corrompu supprimé:', fullKey, parseError);
            localStorage.removeItem(fullKey);
          }
        }
      });
    } catch (error) {
      console.error('Erreur lors du nettoyage du cache:', error);
    }
  }

  // Vider tout le cache
  clear(): void {
    try {
      const keys = Object.keys(localStorage).filter(key => key.startsWith(this.PREFIX));
      keys.forEach(key => localStorage.removeItem(key));
    } catch (error) {
      console.error('Erreur lors du vidage du cache:', error);
    }
  }

  // Obtenir la taille du cache (approximative)
  getSize(): number {
    try {
      const keys = Object.keys(localStorage).filter(key => key.startsWith(this.PREFIX));
      return keys.reduce((size, key) => {
        const item = localStorage.getItem(key);
        return size + (item ? item.length : 0);
      }, 0);
    } catch (error) {
      console.error('Erreur lors du calcul de la taille du cache:', error);
      return 0;
    }
  }
}

export const localCache = new LocalCacheService();
