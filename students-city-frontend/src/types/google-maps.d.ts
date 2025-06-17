declare global {
  interface Window {
    google: typeof google;
  }
}

declare namespace google {
  namespace maps {
    class Map {
      constructor(mapDiv: HTMLElement, opts?: MapOptions);
    }
    
    class Marker {
      constructor(opts?: MarkerOptions);
      addListener(eventName: string, handler: () => void): void;
      setMap(map: Map | null): void;
    }
    
    class InfoWindow {
      constructor(opts?: InfoWindowOptions);
      open(map: Map, anchor?: Marker): void;
    }
    
    class Size {
      constructor(width: number, height: number);
    }

    interface MapOptions {
      center?: { lat: number; lng: number };
      zoom?: number;
      styles?: any[];
    }

    interface MarkerOptions {
      position?: { lat: number; lng: number };
      map?: Map;
      title?: string;
      icon?: {
        url: string;
        scaledSize: Size;
      };
    }

    interface InfoWindowOptions {
      content?: string;
    }
  }
}

export {};
