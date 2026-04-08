import { RESTAURANT_LOCATION } from './storefront';
import { getNativeCurrentLocation } from '../lib/nativeFeatures';

const LOCATION_CACHE_KEY = 'sjfc-user-location-v1';
const LOCATION_CACHE_TTL_MS = 15 * 60 * 1000;
const GEOLOCATION_TIMEOUT_MS = 10000;
export const USER_LOCATION_UPDATED_EVENT = 'sjfc:user-location-updated';

const canUseBrowser = () => typeof window !== 'undefined';

const readCachedLocation = () => {
  if (!canUseBrowser()) {
    return null;
  }

  try {
    const raw = window.localStorage.getItem(LOCATION_CACHE_KEY);

    if (!raw) {
      return null;
    }

    const parsed = JSON.parse(raw);

    if (
      !Number.isFinite(Number(parsed?.lat)) ||
      !Number.isFinite(Number(parsed?.lng)) ||
      !Number.isFinite(Number(parsed?.cachedAt))
    ) {
      return null;
    }

    if (Date.now() - parsed.cachedAt > LOCATION_CACHE_TTL_MS) {
      return null;
    }

    return {
      lat: Number(parsed.lat),
      lng: Number(parsed.lng),
      cachedAt: Number(parsed.cachedAt),
    };
  } catch {
    return null;
  }
};

const writeCachedLocation = (location) => {
  if (!canUseBrowser()) {
    return;
  }

  try {
    const nextLocation = {
      ...location,
      cachedAt: Date.now(),
    };

    window.localStorage.setItem(LOCATION_CACHE_KEY, JSON.stringify(nextLocation));
    window.dispatchEvent(
      new CustomEvent(USER_LOCATION_UPDATED_EVENT, {
        detail: nextLocation,
      }),
    );
  } catch {
    // Ignore localStorage failures so geolocation never blocks checkout.
  }
};

const mapGeolocationError = (error) => {
  if (!error) {
    return 'Location not enabled';
  }

  switch (error.code) {
    case error.PERMISSION_DENIED:
      return 'Location not enabled';
    case error.TIMEOUT:
      return 'Location request timed out';
    default:
      return 'Unable to fetch your location';
  }
};

export const getCachedUserLocation = () => readCachedLocation();

const requestBrowserLocation = ({ forceFresh = false, resolve, reject }) => {
  if (typeof navigator === 'undefined' || !navigator.geolocation) {
    reject(new Error('Location not enabled'));
    return;
  }

  navigator.geolocation.getCurrentPosition(
    (position) => {
      const nextLocation = {
        lat: position.coords.latitude,
        lng: position.coords.longitude,
      };

      writeCachedLocation(nextLocation);
      resolve(nextLocation);
    },
    (error) => {
      reject(new Error(mapGeolocationError(error)));
    },
    {
      enableHighAccuracy: true,
      maximumAge: forceFresh ? 0 : 2 * 60 * 1000,
      timeout: GEOLOCATION_TIMEOUT_MS,
    },
  );
};

export const getUserLocation = ({ forceFresh = false } = {}) =>
  new Promise((resolve, reject) => {
    const cachedLocation = forceFresh ? null : readCachedLocation();

    if (cachedLocation) {
      resolve(cachedLocation);
      return;
    }

    getNativeCurrentLocation()
      .then((nativeLocation) => {
        if (
          Number.isFinite(Number(nativeLocation?.lat)) &&
          Number.isFinite(Number(nativeLocation?.lng))
        ) {
          writeCachedLocation(nativeLocation);
          resolve(nativeLocation);
          return;
        }

        requestBrowserLocation({ forceFresh, resolve, reject });
      })
      .catch(() => {
        requestBrowserLocation({ forceFresh, resolve, reject });
      });
  });

export const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const toRadians = (value) => (value * Math.PI) / 180;
  const earthRadiusKm = 6371;
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) *
      Math.cos(toRadians(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return earthRadiusKm * c;
};

export const calculateDistanceFromStore = ({ lat, lng }) =>
  calculateDistance(lat, lng, RESTAURANT_LOCATION.lat, RESTAURANT_LOCATION.lng);

export const formatDistanceLabel = (distanceKm) =>
  Number.isFinite(distanceKm) ? `You are ${distanceKm.toFixed(1)} km away` : 'Location not enabled';
