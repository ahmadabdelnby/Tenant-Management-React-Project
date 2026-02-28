// ============================================
// LocationViewer Component - Google Maps
// Read-only map with marker for building details
// Uses AdvancedMarkerElement (replaces deprecated Marker)
// ============================================

import { useCallback, useEffect, useRef } from 'react';
import { GoogleMap, useJsApiLoader } from '@react-google-maps/api';
import { Spinner } from 'react-bootstrap';

const libraries = ['places', 'marker'];

const containerStyle = {
  width: '100%',
  height: '100%',
  minHeight: '380px',
};

const LocationViewer = ({ lat, lng }) => {
  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '',
    libraries,
  });

  const markerRef = useRef(null);

  const center = {
    lat: parseFloat(lat),
    lng: parseFloat(lng),
  };

  const handleMapLoad = useCallback((map) => {
    if (window.google?.maps?.marker?.AdvancedMarkerElement) {
      markerRef.current = new google.maps.marker.AdvancedMarkerElement({
        map,
        position: center,
      });
    }
  }, [lat, lng]);

  // Cleanup marker on unmount
  useEffect(() => {
    return () => {
      if (markerRef.current) {
        markerRef.current.map = null;
        markerRef.current = null;
      }
    };
  }, []);

  if (loadError) {
    return (
      <div className="d-flex align-items-center justify-content-center h-100 text-muted" style={{ minHeight: '380px' }}>
        <div className="text-center">
          <i className="bi bi-exclamation-triangle" style={{ fontSize: '2rem' }}></i>
          <p className="mt-2 small">Failed to load map</p>
        </div>
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div className="d-flex align-items-center justify-content-center h-100" style={{ minHeight: '380px' }}>
        <Spinner animation="border" size="sm" style={{ color: 'var(--navy-dark)' }} />
        <span className="ms-2 small text-muted">Loading map...</span>
      </div>
    );
  }

  return (
    <GoogleMap
      mapContainerStyle={containerStyle}
      center={center}
      zoom={15}
      onLoad={handleMapLoad}
      options={{
        mapId: 'DEMO_MAP_ID',
        disableDefaultUI: true,
        zoomControl: true,
        streetViewControl: false,
        mapTypeControl: false,
        fullscreenControl: true,
      }}
    />
  );
};

export default LocationViewer;
