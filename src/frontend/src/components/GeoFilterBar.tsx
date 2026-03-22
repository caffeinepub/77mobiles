import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2, MapPin, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useCallback, useEffect, useState } from "react";
import { useGeoLocation } from "../hooks/useGeoLocation";
import { reverseGeocode } from "../utils/geo";

interface GeoFilterBarProps {
  onFilterChange: (
    filter: { lat: number; lon: number; radiusKm: number } | null,
  ) => void;
}

const RADIUS_OPTIONS = [5, 10, 25, 50, 100] as const;
type RadiusKm = (typeof RADIUS_OPTIONS)[number];

export default function GeoFilterBar({ onFilterChange }: GeoFilterBarProps) {
  const { lat, lon, loading, error, detect } = useGeoLocation();
  const [active, setActive] = useState(false);
  const [radiusKm, setRadiusKm] = useState<RadiusKm>(25);
  const [cityLabel, setCityLabel] = useState<string | null>(null);
  const [geocoding, setGeocoding] = useState(false);

  // Reverse geocode once we have coords
  useEffect(() => {
    if (lat === null || lon === null) return;
    setGeocoding(true);
    reverseGeocode(lat, lon)
      .then(({ city, countryName }) => {
        setCityLabel(countryName ? `${city}, ${countryName}` : city);
      })
      .catch(() => setCityLabel(null))
      .finally(() => setGeocoding(false));
  }, [lat, lon]);

  // Propagate filter when active state or radius changes
  useEffect(() => {
    if (active && lat !== null && lon !== null) {
      onFilterChange({ lat, lon, radiusKm });
    } else if (!active) {
      onFilterChange(null);
    }
  }, [active, lat, lon, radiusKm, onFilterChange]);

  // Activate after coords arrive
  useEffect(() => {
    if (lat !== null && lon !== null && !error) {
      setActive(true);
    }
  }, [lat, lon, error]);

  const handleNearMe = useCallback(() => {
    if (active) {
      setActive(false);
    } else if (lat !== null && lon !== null) {
      setActive(true);
    } else {
      detect();
    }
  }, [active, lat, lon, detect]);

  const handleClear = useCallback(() => {
    setActive(false);
    onFilterChange(null);
  }, [onFilterChange]);

  const isLoading = loading || geocoding;

  return (
    <div className="mb-5 space-y-2">
      <div className="flex items-center gap-2 flex-wrap">
        {/* Near Me toggle */}
        <Button
          variant={active ? "default" : "outline"}
          size="sm"
          onClick={handleNearMe}
          disabled={isLoading}
          className="gap-1.5 text-sm h-8 rounded-full transition-all"
          data-ocid="geo.toggle"
        >
          {isLoading ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <MapPin className="h-3.5 w-3.5" />
          )}
          Near Me
        </Button>

        {/* Radius selector — only shown when active */}
        <AnimatePresence>
          {active && (
            <motion.div
              key="radius"
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -8 }}
              transition={{ duration: 0.18 }}
              className="flex items-center gap-1"
              data-ocid="geo.panel"
            >
              {RADIUS_OPTIONS.map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setRadiusKm(r)}
                  className={[
                    "h-7 px-2.5 text-xs font-medium rounded-full border transition-all",
                    radiusKm === r
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-background text-muted-foreground border-border hover:border-primary/50 hover:text-foreground",
                  ].join(" ")}
                  data-ocid="geo.radio"
                >
                  {r} km
                </button>
              ))}

              {/* City badge + clear */}
              {cityLabel && (
                <Badge
                  variant="secondary"
                  className="ml-1 gap-1 text-xs rounded-full"
                  data-ocid="geo.card"
                >
                  <MapPin className="h-3 w-3" />
                  {cityLabel}
                </Badge>
              )}

              <button
                type="button"
                onClick={handleClear}
                className="ml-0.5 h-6 w-6 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                aria-label="Clear location filter"
                data-ocid="geo.close_button"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Error message */}
      <AnimatePresence>
        {error && (
          <motion.p
            key="geo-error"
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.15 }}
            className="text-xs text-destructive flex items-center gap-1"
            data-ocid="geo.error_state"
          >
            <MapPin className="h-3 w-3 shrink-0" />
            {error}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}
