import { GoogleMap, MarkerF, useJsApiLoader } from '@react-google-maps/api';
import { MapPin } from 'lucide-react';
import { publicEnv } from '../../lib/env';

export const TrackingMap = ({ location }) => {
  const apiKey = publicEnv.googleMapsApiKey;
  const { isLoaded } = useJsApiLoader({
    id: 'sardar-ji-maps',
    googleMapsApiKey: apiKey || '',
  });

  if (!location) {
    return (
      <div className="map-placeholder">
        <MapPin size={28} />
        <p>Delivery partner location will appear here once the order is out for delivery.</p>
      </div>
    );
  }

  if (!apiKey || !isLoaded) {
    return (
      <div className="map-placeholder">
        <MapPin size={28} />
        <p>
          Live coordinates: {location.latitude.toFixed(4)}, {location.longitude.toFixed(4)}
        </p>
        <a
          className="btn btn-secondary"
          href={`https://www.google.com/maps/search/?api=1&query=${location.latitude},${location.longitude}`}
          rel="noreferrer"
          target="_blank"
        >
          Open in Google Maps
        </a>
      </div>
    );
  }

  return (
    <div className="tracking-map">
      <GoogleMap
        center={{ lat: location.latitude, lng: location.longitude }}
        mapContainerStyle={{ width: '100%', height: '100%' }}
        options={{ disableDefaultUI: true }}
        zoom={14}
      >
        <MarkerF position={{ lat: location.latitude, lng: location.longitude }} />
      </GoogleMap>
    </div>
  );
};
