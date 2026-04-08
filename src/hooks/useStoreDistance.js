import { useCallback, useEffect, useState } from 'react';
import {
  calculateDistanceFromStore,
  formatDistanceLabel,
  getCachedUserLocation,
  getUserLocation,
  USER_LOCATION_UPDATED_EVENT,
} from '../utils/location';

const LOCATION_CACHE_KEY = 'sjfc-user-location-v1';

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

  const applyLocation = useCallback((location) => {
    const nextDistance = calculateDistanceFromStore(location);
    setDistanceKm(nextDistance);
    setStatus(formatDistanceLabel(nextDistance));
  }, []);

  const refreshDistance = useCallback(async ({ forceFresh = false, location = null } = {}) => {
    setIsLocating(true);

    try {
      const nextLocation = location || (await getUserLocation({ forceFresh }));
      applyLocation(nextLocation);
      return nextLocation;
    } catch (error) {
      setDistanceKm(null);
      setStatus(error.message || 'Location not enabled');
      return null;
    } finally {
      setIsLocating(false);
    }
  }, [applyLocation]);

  useEffect(() => {
    if (distanceKm !== null) {
      setIsLocating(false);
      return;
    }

    void refreshDistance();
  }, [distanceKm, refreshDistance]);

  useEffect(() => {
    const syncFromStorage = () => {
      const cachedLocation = getCachedUserLocation();

      if (cachedLocation) {
        applyLocation(cachedLocation);
      }
    };

    const handleLocationUpdate = (event) => {
      if (
        Number.isFinite(Number(event?.detail?.lat)) &&
        Number.isFinite(Number(event?.detail?.lng))
      ) {
        applyLocation(event.detail);
        setIsLocating(false);
        return;
      }

      syncFromStorage();
    };

    const handleStorage = (event) => {
      if (event.key === LOCATION_CACHE_KEY) {
        syncFromStorage();
      }
    };

    window.addEventListener(USER_LOCATION_UPDATED_EVENT, handleLocationUpdate);
    window.addEventListener('storage', handleStorage);

    return () => {
      window.removeEventListener(USER_LOCATION_UPDATED_EVENT, handleLocationUpdate);
      window.removeEventListener('storage', handleStorage);
    };
  }, [applyLocation]);

  return {
    distanceKm,
    distanceLabel: distanceKm === null ? 'Location not enabled' : formatDistanceLabel(distanceKm),
    locationStatus: status,
    isLocating,
    refreshDistance,
  };
};
