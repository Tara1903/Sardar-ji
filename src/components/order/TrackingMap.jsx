import { useEffect, useMemo } from 'react';
import L from 'leaflet';
import { MapContainer, Marker, Popup, TileLayer, useMap } from 'react-leaflet';
import { MapPin } from 'lucide-react';

const deliveryIcon = L.divIcon({
  className: 'delivery-marker',
  html: '<span></span>',
  iconSize: [20, 20],
  iconAnchor: [10, 10],
});

const MapViewport = ({ center }) => {
  const map = useMap();

  useEffect(() => {
    map.flyTo(center, 15, {
      animate: true,
      duration: 1.2,
    });
  }, [center, map]);

  return null;
};

export const TrackingMap = ({ location }) => {
  const center = useMemo(() => {
    if (!location) {
      return null;
    }

    return [location.latitude, location.longitude];
  }, [location]);

  if (!center) {
    return (
      <div className="map-placeholder">
        <MapPin size={28} />
        <p>Delivery partner location will appear here once the order is out for delivery.</p>
      </div>
    );
  }

  return (
    <div className="tracking-map leaflet-shell">
      <MapContainer center={center} scrollWheelZoom={false} zoom={15}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MapViewport center={center} />
        <Marker icon={deliveryIcon} position={center}>
          <Popup>Delivery partner is here.</Popup>
        </Marker>
      </MapContainer>
    </div>
  );
};
