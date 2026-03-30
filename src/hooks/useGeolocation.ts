import { useState, useCallback } from 'react';
import { isNative } from '../utils/platform';

interface GeoPosition {
  latitude: number;
  longitude: number;
}

interface UseGeolocationReturn {
  position: GeoPosition | null;
  error: string | null;
  loading: boolean;
  requestLocation: () => Promise<void>;
}

export function useGeolocation(): UseGeolocationReturn {
  const [position, setPosition] = useState<GeoPosition | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const requestLocation = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      if (isNative()) {
        // Use Capacitor Geolocation plugin on native
        const { Geolocation } = await import('@capacitor/geolocation');
        const permission = await Geolocation.requestPermissions();

        if (permission.location === 'denied') {
          setError('Location permission denied');
          setLoading(false);
          return;
        }

        const pos = await Geolocation.getCurrentPosition({
          enableHighAccuracy: false,
          timeout: 10000,
        });

        setPosition({
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
        });
      } else {
        // Use browser Geolocation API on web
        if (!navigator.geolocation) {
          setError('Geolocation not supported');
          setLoading(false);
          return;
        }

        const pos = await new Promise<GeolocationPosition>((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            enableHighAccuracy: false,
            timeout: 10000,
          });
        });

        setPosition({
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
        });
      }
    } catch (err: any) {
      setError(err.message || 'Failed to get location');
    } finally {
      setLoading(false);
    }
  }, []);

  return { position, error, loading, requestLocation };
}
