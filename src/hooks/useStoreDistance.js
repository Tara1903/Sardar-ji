import { useEffect, useState } from 'react';
import {
  calculateDistanceFromStore,
  formatDistanceLabel,
  getCachedUserLocation,
  getUserLocation,
} from '../utils/location';

export const useStoreDistance = () => {
  const [distanceKm, setDistanceKm] = useState(() => {
    const cachedLocation = getCachedUserLocation();

    if (!cachedLocation) {
      return null;
    }

    return calculateDistanceFromStore(cachedLocation);
  });
  const [status, setStatus] = useState(() =>
    distanceKm === null ? 'Location not enabled' : formatDistanceLabel(distanceKm),
  );
  const [isLocating, setIsLocating] = useState(distanceKm === null);

  useEffect(() => {
    let isMounted = true;

    if (distanceKm !== null) {
      setIsLocating(false);
      return () => {
        isMounted = false;
      };
    }

    getUserLocation()
      .then((location) => {
        if (!isMounted) {
          return;
        }

        const nextDistance = calculateDistanceFromStore(location);
        setDistanceKm(nextDistance);
        setStatus(formatDistanceLabel(nextDistance));
      })
      .catch((error) => {
        if (!isMounted) {
          return;
        }

        setDistanceKm(null);
        setStatus(error.message || 'Location not enabled');
      })
      .finally(() => {
        if (isMounted) {
          setIsLocating(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [distanceKm]);

  return {
    distanceKm,
    distanceLabel: distanceKm === null ? 'Location not enabled' : formatDistanceLabel(distanceKm),
    locationStatus: status,
    isLocating,
  };
};
