import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Info, Loader2, MapPin, X } from "lucide-react";
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
  const [showHelp, setShowHelp] = useState(false);

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

  useEffect(() => {
    if (active && lat !== null && lon !== null) {
      onFilterChange({ lat, lon, radiusKm });
    } else if (!active) {
      onFilterChange(null);
    }
  }, [active, lat, lon, radiusKm, onFilterChange]);

  useEffect(() => {
    if (lat !== null && lon !== null && !error) {
      setActive(true);
      setShowHelp(false);
    }
  }, [lat, lon, error]);

  // Show help if error contains "denied"
  useEffect(() => {
    if (error?.toLowerCase().includes("denied")) {
      setShowHelp(true);
    }
  }, [error]);

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
          className={`gap-1.5 text-sm h-8 rounded-full transition-all ${
            active
              ? "shadow-glow-sm"
              : "border-border/60 hover:border-primary/40"
          }`}
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
                      ? "bg-primary text-primary-foreground border-primary shadow-glow-sm"
                      : "bg-background text-muted-foreground border-border/60 hover:border-primary/50 hover:text-foreground",
                  ].join(" ")}
                  data-ocid="geo.radio"
                >
                  {r} km
                </button>
              ))}

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

      {/* Error message with help panel */}
      <AnimatePresence>
        {error && (
          <motion.div
            key="geo-error"
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.15 }}
            data-ocid="geo.error_state"
          >
            <p className="text-xs text-destructive flex items-center gap-1 mb-1">
              <Info className="h-3.5 w-3.5 shrink-0" />
              {error}
              {showHelp && (
                <button
                  type="button"
                  className="ml-auto text-xs text-muted-foreground hover:text-foreground underline underline-offset-2"
                  onClick={() => setShowHelp((s) => !s)}
                >
                  {showHelp ? "Hide help" : "How to fix"}
                </button>
              )}
            </p>

            {showHelp && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="rounded-xl border border-primary/30 bg-primary/5 p-3 mt-1"
                style={{ boxShadow: "0 0 10px oklch(0.72 0.2 220 / 0.08)" }}
              >
                <p className="text-xs font-medium text-foreground mb-1.5">
                  Enable location in your browser:
                </p>
                <ul className="text-xs text-muted-foreground space-y-1 mb-3">
                  <li>
                    <span className="text-foreground font-medium">
                      Chrome/Edge:
                    </span>{" "}
                    Click the lock icon → Site settings → Location → Allow
                  </li>
                  <li>
                    <span className="text-foreground font-medium">Safari:</span>{" "}
                    Settings → Safari → Location → Allow
                  </li>
                  <li>
                    <span className="text-foreground font-medium">
                      Firefox:
                    </span>{" "}
                    Click the lock icon → Clear permissions → Reload
                  </li>
                </ul>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => detect()}
                  disabled={isLoading}
                  className="text-xs h-7 border-primary/40 hover:bg-primary/10 hover:border-primary"
                  data-ocid="geo.secondary_button"
                >
                  {isLoading ? (
                    <Loader2 className="h-3 w-3 animate-spin mr-1" />
                  ) : null}
                  Try Again
                </Button>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
