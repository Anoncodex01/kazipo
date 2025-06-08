import React, { useCallback, useState } from 'react';
import { GoogleMap, useJsApiLoader, Marker, Circle } from '@react-google-maps/api';

interface MapComponentProps {
  center: {
    lat: number;
    lng: number;
  };
  userLocation?: {
    lat: number;
    lng: number;
  };
  radius?: number; // in meters
  zoom?: number;
  height?: string;
  width?: string;
}

const containerStyle = {
  width: '100%',
  height: '400px'
};

const MapComponent: React.FC<MapComponentProps> = ({
  center,
  userLocation,
  radius = 1000, // default 1km radius
  zoom = 15,
  height = '400px',
  width = '100%'
}) => {
  const [map, setMap] = useState<google.maps.Map | null>(null);

  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: process.env.VITE_GOOGLE_MAPS_API_KEY || ''
  });

  const onLoad = useCallback((map: google.maps.Map) => {
    setMap(map);
  }, []);

  const onUnmount = useCallback(() => {
    setMap(null);
  }, []);

  if (!isLoaded) {
    return (
      <div 
        className="bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center"
        style={{ height, width }}
      >
        <div className="text-gray-500 dark:text-gray-400">Loading map...</div>
      </div>
    );
  }

  return (
    <GoogleMap
      mapContainerStyle={{ ...containerStyle, height, width }}
      center={center}
      zoom={zoom}
      onLoad={onLoad}
      onUnmount={onUnmount}
      options={{
        styles: [
          {
            featureType: 'poi',
            elementType: 'labels',
            stylers: [{ visibility: 'off' }]
          }
        ]
      }}
    >
      {/* Office location marker */}
      <Marker
        position={center}
        icon={{
          url: 'https://maps.google.com/mapfiles/ms/icons/blue-dot.png'
        }}
      />

      {/* User location marker */}
      {userLocation && (
        <Marker
          position={userLocation}
          icon={{
            url: 'https://maps.google.com/mapfiles/ms/icons/red-dot.png'
          }}
        />
      )}

      {/* Geofence circle */}
      <Circle
        center={center}
        radius={radius}
        options={{
          strokeColor: '#3B82F6',
          strokeOpacity: 0.8,
          strokeWeight: 2,
          fillColor: '#3B82F6',
          fillOpacity: 0.1
        }}
      />
    </GoogleMap>
  );
};

export default MapComponent; 