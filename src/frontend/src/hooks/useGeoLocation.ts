import { useCallback, useState } from "react";

interface GeoState {
  lat: number | null;
  lon: number | null;
  loading: boolean;
  error: string | null;
}

export function useGeoLocation() {
  const [state, setState] = useState<GeoState>({
    lat: null,
    lon: null,
    loading: false,
    error: null,
  });

  const detect = useCallback(() => {
    if (!navigator.geolocation) {
      setState((prev) => ({
        ...prev,
        error: "Geolocation is not supported by your browser.",
      }));
      return;
    }

    setState((prev) => ({ ...prev, loading: true, error: null }));

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setState({
          lat: position.coords.latitude,
          lon: position.coords.longitude,
          loading: false,
          error: null,
        });
      },
      (err) => {
        let msg = "Could not get your location.";
        if (err.code === err.PERMISSION_DENIED) {
          msg =
            "Location access was denied. Please allow it in your browser settings.";
        } else if (err.code === err.POSITION_UNAVAILABLE) {
          msg = "Location information is unavailable.";
        } else if (err.code === err.TIMEOUT) {
          msg = "Location request timed out.";
        }
        setState({ lat: null, lon: null, loading: false, error: msg });
      },
      { timeout: 10000, maximumAge: 60000 },
    );
  }, []);

  return { ...state, detect };
}
