import React, { useEffect, useRef, useCallback } from 'react';

interface MapMarker {
  id: string;
  type: string;
  position: { lat: number; lng: number };
  title: string;
  [key: string]: any;
}

interface GoogleMapProps {
  markers: MapMarker[];
  center: { lat: number; lng: number };
  zoom: number;
  onMarkerClick?: (marker: MapMarker) => void;
}

// Mock Google Maps types for development
interface GoogleMapsAPI {
  Map: any;
  Marker: any;
  MapTypeId: any;
  Size: any;
  Point: any;
}

declare global {
  interface Window {
    google?: {
      maps: GoogleMapsAPI;
    };
  }
}

export function GoogleMap({ markers, center, zoom, onMarkerClick }: GoogleMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);

  const initializeMap = useCallback(() => {
    if (!mapRef.current || !window.google?.maps) return;

    mapInstanceRef.current = new window.google.maps.Map(mapRef.current, {
      center,
      zoom,
      mapTypeId: window.google.maps.MapTypeId.ROADMAP,
      styles: [
        {
          featureType: "all",
          elementType: "geometry.fill",
          stylers: [{ color: "#f5f5f5" }]
        },
        {
          featureType: "water",
          elementType: "geometry",
          stylers: [{ color: "#e9e9e9" }, { lightness: 17 }]
        }
      ]
    });
  }, [center, zoom]);

  const updateMarkers = useCallback(() => {
    if (!mapInstanceRef.current || !window.google?.maps) return;

    // Clear existing markers
    markersRef.current.forEach(marker => marker.setMap(null));
    markersRef.current = [];

    // Add new markers
    markers.forEach(markerData => {
      const marker = new window.google.maps.Marker({
        position: markerData.position,
        map: mapInstanceRef.current,
        title: markerData.title,
        icon: getMarkerIcon(markerData)
      });

      marker.addListener('click', () => {
        onMarkerClick?.(markerData);
      });

      markersRef.current.push(marker);
    });
  }, [markers, onMarkerClick]);

  const getMarkerIcon = (markerData: MapMarker): any => {
    if (!window.google?.maps) return null;
    
    const baseUrl = 'data:image/svg+xml;base64,';
    let color = '#3b82f6'; // Default blue

    switch (markerData.type) {
      case 'incident':
        color = markerData.priority === 'Critical' ? '#dc2626' : '#f59e0b';
        break;
      case 'unit':
        color = markerData.status === 'Available' ? '#10b981' : 
               markerData.status === 'Busy' ? '#f59e0b' : '#6b7280';
        break;
      case 'camera':
        color = '#8b5cf6';
        break;
      case 'gate':
        color = '#ec4899';
        break;
      default:
        color = '#3b82f6';
    }

    const svg = `
      <svg width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <circle cx="12" cy="12" r="8" fill="${color}" stroke="white" stroke-width="2"/>
      </svg>
    `;

    return {
      url: baseUrl + btoa(svg),
      scaledSize: new window.google.maps.Size(24, 24),
      anchor: new window.google.maps.Point(12, 12)
    };
  };

  useEffect(() => {
    const loadGoogleMaps = () => {
      if (window.google?.maps) {
        initializeMap();
        return;
      }

      const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
      if (!apiKey) {
        console.warn('Google Maps API key not found. Add VITE_GOOGLE_MAPS_API_KEY to your environment.');
        return;
      }

      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=geometry`;
      script.async = true;
      script.onload = initializeMap;
      document.head.appendChild(script);
    };

    loadGoogleMaps();
  }, [initializeMap]);

  useEffect(() => {
    updateMarkers();
  }, [updateMarkers]);

  if (!import.meta.env.VITE_GOOGLE_MAPS_API_KEY) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-muted rounded-lg">
        <div className="text-center p-8">
          <div className="text-lg font-semibold mb-2">Google Maps Integration</div>
          <div className="text-sm text-muted-foreground mb-4">
            Add VITE_GOOGLE_MAPS_API_KEY to environment to enable live maps
          </div>
          <div className="p-4 bg-primary/10 rounded border-2 border-dashed border-primary/20">
            <div className="text-xs font-mono mb-2">
              Mock Map View - {markers.length} markers
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              {markers.slice(0, 4).map((marker, idx) => (
                <div key={idx} className="p-2 bg-background rounded border">
                  <div className="font-medium">{marker.type}</div>
                  <div className="text-muted-foreground">{marker.title}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return <div ref={mapRef} className="w-full h-full rounded-lg" />;
}