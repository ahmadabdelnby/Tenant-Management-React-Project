// ============================================
// LocationPicker Component - Google Maps
// Admin: search + click to select location
// Uses AdvancedMarkerElement (replaces deprecated Marker)
// ============================================

import { useState, useCallback, useRef, useEffect } from 'react';
import { GoogleMap, useJsApiLoader, Autocomplete } from '@react-google-maps/api';
import { Form, Spinner } from 'react-bootstrap';

const libraries = ['places', 'marker'];

const containerStyle = {
  width: '100%',
  height: '350px',
};

const defaultCenter = {
  lat: 29.3759,  // Kuwait default
  lng: 47.9774,
};

const LocationPicker = ({ latitude, longitude, onLocationSelect }) => {
  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '',
    libraries,
  });

  const [marker, setMarker] = useState(
    latitude && longitude ? { lat: parseFloat(latitude), lng: parseFloat(longitude) } : null
  );
  const [mapCenter, setMapCenter] = useState(
    latitude && longitude
      ? { lat: parseFloat(latitude), lng: parseFloat(longitude) }
      : defaultCenter
  );

  const autocompleteRef = useRef(null);
  const mapRef = useRef(null);
  const markerRef = useRef(null);

  // Helper to create or update the AdvancedMarkerElement
  const updateMarker = useCallback((position) => {
    if (!mapRef.current || !position) return;

    if (markerRef.current) {
      markerRef.current.position = position;
    } else if (window.google?.maps?.marker?.AdvancedMarkerElement) {
      markerRef.current = new google.maps.marker.AdvancedMarkerElement({
        map: mapRef.current,
        position,
      });
    }
  }, []);

  const handleMapLoad = useCallback((map) => {
    mapRef.current = map;
    if (marker) {
      updateMarker(marker);
    }
  }, [marker, updateMarker]);

  // Cleanup marker on unmount
  useEffect(() => {
    return () => {
      if (markerRef.current) {
        markerRef.current.map = null;
        markerRef.current = null;
      }
    };
  }, []);

  const handleMapClick = useCallback(
    (e) => {
      const lat = e.latLng.lat();
      const lng = e.latLng.lng();
      const pos = { lat, lng };
      setMarker(pos);
      updateMarker(pos);
      onLocationSelect(pos);
    },
    [onLocationSelect, updateMarker]
  );

  const handlePlaceChanged = useCallback(() => {
    if (autocompleteRef.current) {
      const place = autocompleteRef.current.getPlace();
      if (place.geometry && place.geometry.location) {
        const lat = place.geometry.location.lat();
        const lng = place.geometry.location.lng();
        const pos = { lat, lng };
        setMarker(pos);
        setMapCenter(pos);
        updateMarker(pos);
        onLocationSelect(pos);
      }
    }
  }, [onLocationSelect, updateMarker]);

  const handleAutocompleteLoad = useCallback((autocomplete) => {
    autocompleteRef.current = autocomplete;
  }, []);

  if (loadError) {
    return (
      <div className="alert alert-warning small">
        <i className="bi bi-exclamation-triangle me-2"></i>
        Failed to load Google Maps. Please check your API key.
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div className="text-center py-4">
        <Spinner animation="border" size="sm" style={{ color: 'var(--navy-dark)' }} />
        <span className="ms-2 small text-muted">Loading map...</span>
      </div>
    );
  }

  return (
    <div>
      <Autocomplete onLoad={handleAutocompleteLoad} onPlaceChanged={handlePlaceChanged}>
        <Form.Control
          type="text"
          placeholder="Search for an address..."
          className="mb-2"
        />
      </Autocomplete>
      <div className="border rounded overflow-hidden">
        <GoogleMap
          mapContainerStyle={containerStyle}
          center={mapCenter}
          zoom={marker ? 15 : 10}
          onClick={handleMapClick}
          onLoad={handleMapLoad}
          options={{
            mapId: 'DEMO_MAP_ID',
            streetViewControl: false,
            mapTypeControl: false,
          }}
        />
      </div>
      {marker && (
        <Form.Text className="text-muted">
          <i className="bi bi-geo-alt me-1"></i>
          Lat: {marker.lat.toFixed(6)}, Lng: {marker.lng.toFixed(6)}
        </Form.Text>
      )}
    </div>
  );
};

export default LocationPicker;
