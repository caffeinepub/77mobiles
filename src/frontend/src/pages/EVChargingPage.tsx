import { Button } from "@/components/ui/button";
import { useNavigate } from "@tanstack/react-router";
import {
  ArrowLeft,
  BatteryCharging,
  Bell,
  Crosshair,
  MapPin,
  Navigation,
  Search,
  X,
  Zap,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

const HYDERABAD_LOCALITIES = [
  "Banjara Hills",
  "Jubilee Hills",
  "Hitech City",
  "Gachibowli",
  "Madhapur",
  "Kondapur",
  "Kukatpally",
  "Secunderabad",
  "Begumpet",
  "Ameerpet",
  "Dilsukhnagar",
  "Lakdikapul",
  "Somajiguda",
  "Panjagutta",
  "Mehdipatnam",
  "Uppal",
  "LB Nagar",
  "Miyapur",
  "KPHB",
  "Moosapet",
];

const LOCALITY_COORDS: Record<string, { lat: number; lng: number }> = {
  "Banjara Hills": { lat: 17.415, lng: 78.448 },
  "Jubilee Hills": { lat: 17.431, lng: 78.41 },
  "Hitech City": { lat: 17.446, lng: 78.38 },
  Gachibowli: { lat: 17.445, lng: 78.35 },
  Madhapur: { lat: 17.452, lng: 78.39 },
  Kondapur: { lat: 17.46, lng: 78.365 },
  Kukatpally: { lat: 17.485, lng: 78.405 },
  Secunderabad: { lat: 17.438, lng: 78.498 },
  Begumpet: { lat: 17.444, lng: 78.47 },
  Ameerpet: { lat: 17.437, lng: 78.449 },
  Dilsukhnagar: { lat: 17.369, lng: 78.528 },
  Lakdikapul: { lat: 17.394, lng: 78.458 },
  Somajiguda: { lat: 17.428, lng: 78.455 },
  Panjagutta: { lat: 17.425, lng: 78.455 },
  Mehdipatnam: { lat: 17.396, lng: 78.438 },
  Uppal: { lat: 17.399, lng: 78.559 },
  "LB Nagar": { lat: 17.349, lng: 78.552 },
  Miyapur: { lat: 17.495, lng: 78.356 },
  KPHB: { lat: 17.49, lng: 78.39 },
  Moosapet: { lat: 17.46, lng: 78.43 },
};

const OPEN_NOW_IDS = new Set(["1", "2", "4", "6", "8", "10"]);

interface Station {
  id: string;
  name: string;
  address: string;
  connectors: string[];
  lat: number;
  lng: number;
  chargerType: "fast" | "slow";
}

const EV_STATIONS: Station[] = [
  {
    id: "1",
    name: "Tata Power EV Station — Banjara Hills",
    address: "Road No. 12, Banjara Hills, Hyderabad",
    connectors: ["Type 2", "CCS"],
    lat: 17.415,
    lng: 78.448,
    chargerType: "fast",
  },
  {
    id: "2",
    name: "EESL Charging Hub — Hitech City",
    address: "HUDA Techno Enclave, Hitech City, Hyderabad",
    connectors: ["Type 2", "CCS", "CHAdeMO"],
    lat: 17.446,
    lng: 78.38,
    chargerType: "fast",
  },
  {
    id: "3",
    name: "TSREDCO Fast Charger — Jubilee Hills",
    address: "Film Nagar, Jubilee Hills, Hyderabad",
    connectors: ["Type 2", "CCS"],
    lat: 17.431,
    lng: 78.41,
    chargerType: "fast",
  },
  {
    id: "4",
    name: "Charge Zone — Gachibowli",
    address: "DLF Cyber City, Gachibowli, Hyderabad",
    connectors: ["CCS", "CHAdeMO"],
    lat: 17.445,
    lng: 78.35,
    chargerType: "fast",
  },
  {
    id: "5",
    name: "Ather Grid — Madhapur",
    address: "Madhapur Main Road, Hyderabad",
    connectors: ["Type 2"],
    lat: 17.452,
    lng: 78.39,
    chargerType: "slow",
  },
  {
    id: "6",
    name: "BESCOM EV Point — Secunderabad",
    address: "MG Road, Secunderabad, Hyderabad",
    connectors: ["Type 2", "CCS"],
    lat: 17.438,
    lng: 78.498,
    chargerType: "fast",
  },
  {
    id: "7",
    name: "Ather Grid — Kondapur",
    address: "Kondapur Main Road, Hyderabad",
    connectors: ["Type 2"],
    lat: 17.46,
    lng: 78.365,
    chargerType: "slow",
  },
  {
    id: "8",
    name: "TSREDCO — Kukatpally",
    address: "KPHB Colony, Kukatpally, Hyderabad",
    connectors: ["Type 2", "CCS"],
    lat: 17.485,
    lng: 78.405,
    chargerType: "fast",
  },
  {
    id: "9",
    name: "MG Charge Point — Uppal",
    address: "Uppal Ring Road, Hyderabad",
    connectors: ["CCS", "CHAdeMO"],
    lat: 17.399,
    lng: 78.559,
    chargerType: "fast",
  },
  {
    id: "10",
    name: "BPCL EV — Mehdipatnam",
    address: "Mehdipatnam Cross Roads, Hyderabad",
    connectors: ["Type 2"],
    lat: 17.396,
    lng: 78.438,
    chargerType: "slow",
  },
  {
    id: "11",
    name: "Tata Power — Ameerpet",
    address: "Ameerpet Metro Station, Hyderabad",
    connectors: ["CCS"],
    lat: 17.437,
    lng: 78.449,
    chargerType: "fast",
  },
  {
    id: "12",
    name: "EESL Hub — LB Nagar",
    address: "LB Nagar X Roads, Hyderabad",
    connectors: ["Type 2", "CCS"],
    lat: 17.349,
    lng: 78.552,
    chargerType: "fast",
  },
  {
    id: "13",
    name: "Charge Zone — KPHB",
    address: "KPHB Phase 1, Hyderabad",
    connectors: ["Type 2"],
    lat: 17.49,
    lng: 78.39,
    chargerType: "slow",
  },
  {
    id: "14",
    name: "Ather — Miyapur",
    address: "Miyapur Metro Station, Hyderabad",
    connectors: ["Type 2"],
    lat: 17.495,
    lng: 78.356,
    chargerType: "slow",
  },
];

function haversineDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number,
): number {
  const R = 6371000;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

const DEFAULT_CENTER = { lat: 17.4, lng: 78.43 };

type ChargerFilter = "all" | "fast" | "slow";

export default function EVChargingPage() {
  const navigate = useNavigate();
  const [searchText, setSearchText] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedStation, setSelectedStation] = useState<Station | null>(null);
  const [mapCenter, setMapCenter] = useState(DEFAULT_CENTER);
  const [leaving, setLeaving] = useState(false);
  const [chargerFilter, setChargerFilter] = useState<ChargerFilter>("all");
  const [searchRadius, setSearchRadius] = useState(5000);
  const [isSearching, setIsSearching] = useState(false);
  const [radiusFilteredIds, setRadiusFilteredIds] =
    useState<Set<string> | null>(null);
  const [showSearchArea, setShowSearchArea] = useState(false);
  const [notifyRequested, setNotifyRequested] = useState(false);
  const idleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const mapKey = useRef(0);

  const suggestions =
    searchText.length > 0
      ? HYDERABAD_LOCALITIES.filter((loc) =>
          loc.toLowerCase().includes(searchText.toLowerCase()),
        ).slice(0, 8)
      : [];

  const handleBack = () => {
    setLeaving(true);
    setTimeout(() => {
      navigate({ to: "/" });
    }, 280);
  };

  // Trigger idle timer whenever mapCenter changes
  // biome-ignore lint/correctness/useExhaustiveDependencies: mapCenter triggers timer reset
  useEffect(() => {
    if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    idleTimerRef.current = setTimeout(() => {
      setShowSearchArea(true);
    }, 3000);
    return () => {
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    };
  }, [mapCenter]);

  const runRadiusSearch = (
    center: { lat: number; lng: number },
    radius: number,
  ) => {
    setIsSearching(true);
    setShowSearchArea(false);
    setTimeout(() => {
      const found = EV_STATIONS.filter(
        (s) =>
          haversineDistance(center.lat, center.lng, s.lat, s.lng) <= radius,
      );
      setIsSearching(false);
      if (found.length === 0 && radius === 5000) {
        toast.info("Expanding search to 15km…");
        setTimeout(() => {
          const found15 = EV_STATIONS.filter(
            (s) =>
              haversineDistance(center.lat, center.lng, s.lat, s.lng) <= 15000,
          );
          setSearchRadius(15000);
          if (found15.length === 0) {
            setRadiusFilteredIds(new Set());
          } else {
            setRadiusFilteredIds(new Set(found15.map((s) => s.id)));
          }
        }, 1000);
      } else {
        setRadiusFilteredIds(new Set(found.map((s) => s.id)));
      }
    }, 1500);
  };

  const handleSelectSuggestion = (locality: string) => {
    setSearchText(locality);
    setShowSuggestions(false);
    const coords = LOCALITY_COORDS[locality];
    if (coords) {
      setMapCenter(coords);
      setSearchRadius(5000);
      runRadiusSearch(coords, 5000);
    }
  };

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && suggestions.length > 0) {
      handleSelectSuggestion(suggestions[0]);
    } else if (e.key === "Enter" && searchText.trim()) {
      // Try LOCALITY_COORDS direct match
      const match = HYDERABAD_LOCALITIES.find(
        (l) => l.toLowerCase() === searchText.trim().toLowerCase(),
      );
      if (match) handleSelectSuggestion(match);
    }
  };

  const handleClearSearch = () => {
    setSearchText("");
    setShowSuggestions(false);
    setMapCenter(DEFAULT_CENTER);
    setRadiusFilteredIds(null);
    setSearchRadius(5000);
  };

  const handleSearchArea = () => {
    setSearchRadius(5000);
    runRadiusSearch(mapCenter, 5000);
  };

  // Compute visible stations
  let visibleStations = EV_STATIONS;
  if (radiusFilteredIds !== null) {
    visibleStations = visibleStations.filter((s) =>
      radiusFilteredIds.has(s.id),
    );
  }
  if (chargerFilter !== "all") {
    visibleStations = visibleStations.filter(
      (s) => s.chargerType === chargerFilter,
    );
  }

  // Compute fitBounds
  let bbox: string;
  if (visibleStations.length > 0 && radiusFilteredIds !== null) {
    const lats = visibleStations.map((s) => s.lat);
    const lngs = visibleStations.map((s) => s.lng);
    const minLat = Math.min(...lats) - 0.02;
    const maxLat = Math.max(...lats) + 0.02;
    const minLng = Math.min(...lngs) - 0.02;
    const maxLng = Math.max(...lngs) + 0.02;
    bbox = `${minLng},${minLat},${maxLng},${maxLat}`;
  } else {
    bbox = `${mapCenter.lng - 0.12},${mapCenter.lat - 0.08},${mapCenter.lng + 0.12},${mapCenter.lat + 0.08}`;
  }
  const mapUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${mapCenter.lat},${mapCenter.lng}`;

  const noStations = radiusFilteredIds !== null && radiusFilteredIds.size === 0;
  const radiusLabel = searchRadius === 15000 ? "15km" : "5km";

  return (
    <div
      className={`fixed inset-0 z-[55] bg-white flex flex-col transition-transform duration-300 ${
        leaving ? "translate-x-full" : "translate-x-0"
      }`}
      data-ocid="ev.panel"
    >
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center gap-3 shadow-sm shrink-0">
        <button
          type="button"
          onClick={handleBack}
          className="p-1.5 -ml-1 rounded-full hover:bg-gray-100 transition-colors"
          data-ocid="ev.close_button"
        >
          <ArrowLeft className="h-5 w-5 text-gray-700" />
        </button>
        <div className="flex items-center gap-2 flex-1">
          <span className="text-2xl">⚡</span>
          <div>
            <p className="font-bold text-gray-900 text-sm leading-tight">
              EV Finder
            </p>
            <p className="text-[11px] text-gray-400">77mobiles</p>
          </div>
        </div>
        <span className="text-xs font-semibold text-green-600 bg-green-50 border border-green-200 rounded-full px-2 py-0.5">
          {visibleStations.length} stations
        </span>
      </div>

      {/* Search bar with autocomplete */}
      <div
        className="px-4 py-2 bg-white border-b border-gray-100 relative"
        style={{ zIndex: 20 }}
      >
        <div className="flex items-center gap-2 bg-gray-100 rounded-xl px-3 h-10">
          <Search className="h-4 w-4 text-gray-400 shrink-0" />
          <input
            type="text"
            value={searchText}
            onChange={(e) => {
              setSearchText(e.target.value);
              setShowSuggestions(true);
            }}
            onFocus={() => setShowSuggestions(true)}
            onKeyDown={handleSearchKeyDown}
            placeholder="Search areas in Hyderabad (e.g. Ameerpet)..."
            className="flex-1 bg-transparent text-sm text-gray-800 placeholder-gray-400 outline-none"
            data-ocid="ev.search_input"
          />
          {searchText && (
            <button
              type="button"
              onClick={handleClearSearch}
              data-ocid="ev.close_button"
            >
              <X className="h-3.5 w-3.5 text-gray-400 hover:text-gray-600" />
            </button>
          )}
        </div>

        {/* Suggestions dropdown */}
        {showSuggestions && suggestions.length > 0 && (
          <div
            className="absolute left-4 right-4 top-full mt-1 bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden"
            style={{ zIndex: 30 }}
          >
            {suggestions.map((loc) => (
              <button
                key={loc}
                type="button"
                onClick={() => handleSelectSuggestion(loc)}
                className="w-full text-left px-4 py-2.5 flex items-center gap-2 hover:bg-gray-50 transition-colors text-sm text-gray-800 border-b border-gray-100 last:border-0"
              >
                <MapPin className="h-3.5 w-3.5 text-green-500 shrink-0" />
                {loc}, Hyderabad
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Filter pills */}
      <div className="flex gap-2 px-4 py-2 bg-white border-b border-gray-100 shrink-0 overflow-x-auto">
        {(["all", "fast", "slow"] as ChargerFilter[]).map((f) => {
          const labels = { all: "All", fast: "Fast DC ⚡", slow: "Slow AC 🔋" };
          const active = chargerFilter === f;
          return (
            <button
              key={f}
              type="button"
              onClick={() => setChargerFilter(f)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors border ${
                active
                  ? f === "fast"
                    ? "bg-green-600 text-white border-green-600"
                    : f === "slow"
                      ? "bg-blue-600 text-white border-blue-600"
                      : "bg-gray-800 text-white border-gray-800"
                  : "bg-white text-gray-600 border-gray-200 hover:border-gray-400"
              }`}
              data-ocid="ev.tab"
            >
              {labels[f]}
            </button>
          );
        })}
        {radiusFilteredIds !== null && (
          <span className="ml-auto text-[11px] text-gray-400 whitespace-nowrap self-center shrink-0">
            Within {radiusLabel}
          </span>
        )}
      </div>

      {/* Map */}
      <div className="flex-1 relative overflow-hidden">
        <iframe
          key={mapKey.current}
          title="EV Charging Map"
          width="100%"
          height="100%"
          src={mapUrl}
          className="border-0 w-full h-full"
          loading="lazy"
        />

        {/* Searching overlay */}
        {isSearching && (
          <div className="absolute inset-0 bg-white/70 flex flex-col items-center justify-center gap-3 z-10">
            <div className="h-10 w-10 rounded-full border-4 border-green-500 border-t-transparent animate-spin" />
            <p className="text-sm font-semibold text-green-700">
              Fetching stations…
            </p>
          </div>
        )}

        {/* Search this area button */}
        {showSearchArea && !isSearching && (
          <div className="absolute top-3 left-1/2 -translate-x-1/2 z-10">
            <button
              type="button"
              onClick={handleSearchArea}
              className="bg-green-600 text-white text-xs font-bold px-4 py-2 rounded-full shadow-lg flex items-center gap-1.5 hover:bg-green-700 transition-colors"
              data-ocid="ev.button"
            >
              <Search className="h-3 w-3" /> Search this area
            </button>
          </div>
        )}

        {/* Floating Locate Me */}
        <button
          type="button"
          onClick={() => {
            if (navigator.geolocation) {
              navigator.geolocation.getCurrentPosition(
                (pos) => {
                  const coords = {
                    lat: pos.coords.latitude,
                    lng: pos.coords.longitude,
                  };
                  setMapCenter(coords);
                  setSearchRadius(5000);
                  runRadiusSearch(coords, 5000);
                },
                () => {},
              );
            }
          }}
          className="absolute bottom-[48%] right-4 h-12 w-12 rounded-full bg-white shadow-lg border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors z-10"
          title="Locate me"
          data-ocid="ev.button"
        >
          <Crosshair className="h-5 w-5 text-blue-600" />
        </button>

        {/* Station list overlay */}
        <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-2xl shadow-2xl border-t border-gray-200 max-h-[45%] overflow-y-auto">
          <div className="flex items-center justify-center pt-2 pb-1">
            <div className="w-10 h-1 rounded-full bg-gray-300" />
          </div>
          <p className="text-xs font-bold uppercase tracking-wider text-gray-400 px-4 py-2">
            Nearby Stations
          </p>

          {noStations ? (
            <div
              className="flex flex-col items-center gap-3 px-4 py-6 text-center"
              data-ocid="ev.empty_state"
            >
              <BatteryCharging className="h-10 w-10 text-gray-300" />
              <p className="font-semibold text-gray-700">No Stations Found</p>
              <p className="text-xs text-gray-400">
                No EV charging stations within 15km of your location.
              </p>
              <Button
                size="sm"
                className="bg-blue-600 hover:bg-blue-700 text-white rounded-full px-5 gap-2"
                onClick={() => {
                  setNotifyRequested(true);
                  toast.success(
                    "We'll notify you when a station opens nearby!",
                  );
                }}
                disabled={notifyRequested}
                data-ocid="ev.primary_button"
              >
                <Bell className="h-3.5 w-3.5" />
                {notifyRequested ? "Subscribed!" : "Notify Me"}
              </Button>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {visibleStations.map((station, i) => {
                const dist = haversineDistance(
                  mapCenter.lat,
                  mapCenter.lng,
                  station.lat,
                  station.lng,
                );
                const distKm = (dist / 1000).toFixed(1);
                const isOpen = OPEN_NOW_IDS.has(station.id);
                return (
                  <button
                    key={station.id}
                    type="button"
                    onClick={() => setSelectedStation(station)}
                    className="w-full text-left px-4 py-3 hover:bg-gray-50 flex gap-3 items-start transition-colors"
                    data-ocid={`ev.item.${i + 1}`}
                  >
                    <div
                      className={`h-8 w-8 rounded-full flex items-center justify-center shrink-0 ${
                        station.chargerType === "fast"
                          ? "bg-green-100"
                          : "bg-blue-100"
                      }`}
                    >
                      {station.chargerType === "fast" ? (
                        <Zap className="h-4 w-4 text-green-700" />
                      ) : (
                        <BatteryCharging className="h-4 w-4 text-blue-700" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-sm text-gray-900 leading-tight truncate">
                          {station.name}
                        </p>
                        <span
                          className={`text-[10px] font-bold rounded-full px-1.5 py-0.5 shrink-0 ${
                            isOpen
                              ? "bg-green-100 text-green-700"
                              : "bg-gray-100 text-gray-500"
                          }`}
                        >
                          {isOpen ? "Open" : "Closed"}
                        </span>
                      </div>
                      <p className="text-xs text-gray-400 truncate mt-0.5">
                        {station.address}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[10px] text-gray-500">
                          {distKm} km away
                        </span>
                        <div className="flex gap-1 flex-wrap">
                          {station.connectors.map((c) => (
                            <span
                              key={c}
                              className={`text-[10px] font-medium rounded px-1.5 py-0.5 ${
                                c === "CCS" || c === "CHAdeMO"
                                  ? "bg-green-50 text-green-700 border border-green-200"
                                  : "bg-blue-50 text-blue-700 border border-blue-200"
                              }`}
                            >
                              {c === "CCS" || c === "CHAdeMO" ? `⚡ ${c}` : c}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Station Detail Bottom Sheet */}
      {selectedStation && (
        <div
          className="fixed inset-0 z-20 flex items-end"
          onClick={() => setSelectedStation(null)}
          onKeyDown={(e) => e.key === "Escape" && setSelectedStation(null)}
          role="presentation"
        >
          <div
            className="w-full bg-white rounded-t-2xl shadow-2xl p-5 border-t border-gray-200"
            onClick={(e) => e.stopPropagation()}
            onKeyDown={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div
                  className={`h-9 w-9 rounded-full flex items-center justify-center ${
                    selectedStation.chargerType === "fast"
                      ? "bg-green-100"
                      : "bg-blue-100"
                  }`}
                >
                  {selectedStation.chargerType === "fast" ? (
                    <Zap className="h-5 w-5 text-green-700" />
                  ) : (
                    <BatteryCharging className="h-5 w-5 text-blue-700" />
                  )}
                </div>
                <div>
                  <p className="font-bold text-gray-900 text-sm">
                    {selectedStation.name}
                  </p>
                  <div className="flex items-center gap-2">
                    <p className="text-xs text-gray-400">
                      {selectedStation.address}
                    </p>
                    <span
                      className={`text-[10px] font-bold rounded-full px-1.5 py-0.5 ${
                        OPEN_NOW_IDS.has(selectedStation.id)
                          ? "bg-green-100 text-green-700"
                          : "bg-gray-100 text-gray-500"
                      }`}
                    >
                      {OPEN_NOW_IDS.has(selectedStation.id)
                        ? "Open Now"
                        : "Closed"}
                    </span>
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedStation(null)}
                className="text-gray-400"
                data-ocid="ev.close_button"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex items-center justify-between mb-4">
              <div className="flex gap-1 flex-wrap">
                {selectedStation.connectors.map((c) => (
                  <span
                    key={c}
                    className={`text-xs font-semibold rounded-full px-3 py-1 ${
                      c === "CCS" || c === "CHAdeMO"
                        ? "bg-green-50 text-green-700 border border-green-200"
                        : "bg-blue-50 text-blue-700 border border-blue-200"
                    }`}
                  >
                    {c === "CCS" || c === "CHAdeMO"
                      ? `⚡ Fast DC — ${c}`
                      : `🔋 AC — ${c}`}
                  </span>
                ))}
              </div>
              <span className="text-xs text-gray-500">
                {(
                  haversineDistance(
                    mapCenter.lat,
                    mapCenter.lng,
                    selectedStation.lat,
                    selectedStation.lng,
                  ) / 1000
                ).toFixed(1)}{" "}
                km
              </span>
            </div>

            <Button
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl gap-2"
              onClick={() =>
                window.open(
                  `https://maps.google.com/?q=${selectedStation.lat},${selectedStation.lng}`,
                  "_blank",
                  "noopener,noreferrer",
                )
              }
              data-ocid="ev.primary_button"
            >
              <Navigation className="h-4 w-4" /> GET DIRECTIONS
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
