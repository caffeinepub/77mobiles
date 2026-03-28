declare const google: any;

import { Button } from "@/components/ui/button";
import { useNavigate } from "@tanstack/react-router";
import {
  ArrowLeft,
  BatteryCharging,
  Bell,
  Crosshair,
  ImageOff,
  MapPin,
  Navigation,
  Search,
  Star,
  X,
  Zap,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

const GOOGLE_MAPS_API_KEY = "AIzaSyDQ1yDyEY7E4L3qGsy-rCIV0222DZDAA4M";
const CACHE_KEY = "77ev_stations";
const CACHE_TS_KEY = "77ev_cache_ts";
const CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

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
  availableChargers: number;
  totalChargers: number;
  rating: number;
}

const EV_STATIONS: Station[] = [
  {
    id: "1",
    name: "Tata Power EZ Charge — Somajiguda",
    address: "Somajiguda, Hyderabad",
    connectors: ["Type 2", "CCS"],
    lat: 17.428,
    lng: 78.455,
    chargerType: "fast",
    availableChargers: 3,
    totalChargers: 5,
    rating: 4.2,
  },
  {
    id: "2",
    name: "EESL Charging Hub — Hitech City",
    address: "HUDA Techno Enclave, Hitech City, Hyderabad",
    connectors: ["Type 2", "CCS", "CHAdeMO"],
    lat: 17.446,
    lng: 78.38,
    chargerType: "fast",
    availableChargers: 4,
    totalChargers: 6,
    rating: 4.5,
  },
  {
    id: "3",
    name: "TSREDCO Fast Charger — Jubilee Hills",
    address: "Film Nagar, Jubilee Hills, Hyderabad",
    connectors: ["Type 2", "CCS"],
    lat: 17.431,
    lng: 78.41,
    chargerType: "fast",
    availableChargers: 0,
    totalChargers: 4,
    rating: 3.9,
  },
  {
    id: "4",
    name: "Charge Zone — Gachibowli",
    address: "DLF Cyber City, Gachibowli, Hyderabad",
    connectors: ["CCS", "CHAdeMO"],
    lat: 17.445,
    lng: 78.35,
    chargerType: "fast",
    availableChargers: 2,
    totalChargers: 4,
    rating: 4.1,
  },
  {
    id: "5",
    name: "Ather Grid — Madhapur",
    address: "Madhapur Main Road, Hyderabad",
    connectors: ["Type 2"],
    lat: 17.452,
    lng: 78.39,
    chargerType: "slow",
    availableChargers: 0,
    totalChargers: 3,
    rating: 4.0,
  },
  {
    id: "6",
    name: "BESCOM EV Point — Secunderabad",
    address: "MG Road, Secunderabad, Hyderabad",
    connectors: ["Type 2", "CCS"],
    lat: 17.438,
    lng: 78.498,
    chargerType: "fast",
    availableChargers: 1,
    totalChargers: 4,
    rating: 3.8,
  },
  {
    id: "7",
    name: "Ather Grid — Kondapur",
    address: "Kondapur Main Road, Hyderabad",
    connectors: ["Type 2"],
    lat: 17.46,
    lng: 78.365,
    chargerType: "slow",
    availableChargers: 0,
    totalChargers: 2,
    rating: 4.2,
  },
  {
    id: "8",
    name: "TSREDCO — Kukatpally",
    address: "KPHB Colony, Kukatpally, Hyderabad",
    connectors: ["Type 2", "CCS"],
    lat: 17.485,
    lng: 78.405,
    chargerType: "fast",
    availableChargers: 3,
    totalChargers: 5,
    rating: 4.3,
  },
  {
    id: "9",
    name: "MG Charge Point — Uppal",
    address: "Uppal Ring Road, Hyderabad",
    connectors: ["CCS", "CHAdeMO"],
    lat: 17.399,
    lng: 78.559,
    chargerType: "fast",
    availableChargers: 0,
    totalChargers: 3,
    rating: 3.7,
  },
  {
    id: "10",
    name: "BPCL EV — Mehdipatnam",
    address: "Mehdipatnam Cross Roads, Hyderabad",
    connectors: ["Type 2"],
    lat: 17.396,
    lng: 78.438,
    chargerType: "slow",
    availableChargers: 2,
    totalChargers: 3,
    rating: 4.0,
  },
  {
    id: "11",
    name: "Tata Power — Ameerpet",
    address: "Ameerpet Metro Station, Hyderabad",
    connectors: ["CCS"],
    lat: 17.437,
    lng: 78.449,
    chargerType: "fast",
    availableChargers: 0,
    totalChargers: 4,
    rating: 4.1,
  },
  {
    id: "12",
    name: "EESL Hub — LB Nagar",
    address: "LB Nagar X Roads, Hyderabad",
    connectors: ["Type 2", "CCS"],
    lat: 17.349,
    lng: 78.552,
    chargerType: "fast",
    availableChargers: 0,
    totalChargers: 4,
    rating: 3.9,
  },
  {
    id: "13",
    name: "Charge Zone — KPHB",
    address: "KPHB Phase 1, Hyderabad",
    connectors: ["Type 2"],
    lat: 17.49,
    lng: 78.39,
    chargerType: "slow",
    availableChargers: 0,
    totalChargers: 2,
    rating: 3.8,
  },
  {
    id: "14",
    name: "Ather — Miyapur",
    address: "Miyapur Metro Station, Hyderabad",
    connectors: ["Type 2"],
    lat: 17.495,
    lng: 78.356,
    chargerType: "slow",
    availableChargers: 0,
    totalChargers: 2,
    rating: 4.0,
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

const launchNavigation = (lat: number, lng: number, name: string) => {
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
  const url = isIOS
    ? `http://maps.apple.com/?daddr=${lat},${lng}&dirflg=d`
    : `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&destination_place_id=${encodeURIComponent(name)}`;
  window.open(url, "_blank", "noopener,noreferrer");
};

const DEFAULT_CENTER = { lat: 17.385, lng: 78.4867 };
type ChargerFilter = "all" | "fast" | "slow";

function loadGoogleMapsScript(): Promise<void> {
  return new Promise((resolve) => {
    if (typeof google !== "undefined" && google.maps) {
      resolve();
      return;
    }
    if (document.querySelector("script[data-gm-script]")) {
      // already loading — poll
      const poll = setInterval(() => {
        if (typeof google !== "undefined" && google.maps) {
          clearInterval(poll);
          resolve();
        }
      }, 100);
      return;
    }
    const script = document.createElement("script");
    script.dataset.gmScript = "1";
    script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=places`;
    script.async = true;
    script.onload = () => resolve();
    document.head.appendChild(script);
  });
}

function getAmenityIcons(connectors: string[]): string[] {
  const icons: string[] = ["🅿️"]; // always parking
  if (connectors.some((c) => c === "CCS")) icons.push("☕");
  if (connectors.some((c) => c === "CHAdeMO")) icons.push("📶");
  return icons;
}

function getAvailabilityText(station: Station): string {
  const isOpen = OPEN_NOW_IDS.has(station.id);
  if (!isOpen) return "Closed";
  return `${station.availableChargers} of ${station.totalChargers} chargers free`;
}

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
  const [mapReady, setMapReady] = useState(false);

  const idleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const mapRef = useRef<any>(null);
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const markersRef = useRef<any[]>([]);

  // Load Google Maps script
  useEffect(() => {
    loadGoogleMapsScript().then(() => setMapReady(true));
  }, []);

  // Initialize map once ready
  useEffect(() => {
    if (!mapReady || !mapContainerRef.current) return;
    const map = new google.maps.Map(mapContainerRef.current, {
      center: DEFAULT_CENTER,
      zoom: 12,
      disableDefaultUI: false,
      styles: [
        { featureType: "poi", stylers: [{ visibility: "off" }] },
        { featureType: "transit", stylers: [{ visibility: "off" }] },
      ],
    });
    mapRef.current = map;

    // On idle update center
    map.addListener("idle", () => {
      const c = map.getCenter();
      if (c) setMapCenter({ lat: c.lat(), lng: c.lng() });
    });
  }, [mapReady]);

  // Place markers when map ready or stations change
  // biome-ignore lint/correctness/useExhaustiveDependencies: visibleStations computed from state
  useEffect(() => {
    if (!mapRef.current) return;
    // Clear old markers
    for (const m of markersRef.current) m.setMap(null);
    markersRef.current = [];

    for (const station of visibleStations) {
      const color = station.chargerType === "fast" ? "#16a34a" : "#2563eb";
      const svgIcon = {
        path: google.maps.SymbolPath.CIRCLE,
        scale: 10,
        fillColor: color,
        fillOpacity: 1,
        strokeColor: "white",
        strokeWeight: 2,
      };
      const marker = new google.maps.Marker({
        position: { lat: station.lat, lng: station.lng },
        map: mapRef.current,
        title: station.name,
        icon: svgIcon,
      });
      marker.addListener("click", () => setSelectedStation(station));
      markersRef.current.push(marker);
    }
  }, [mapReady, radiusFilteredIds, chargerFilter]); // eslint-disable-line react-hooks/exhaustive-deps

  // GPS on mount
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const coords = {
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
          };
          setMapCenter(coords);
          if (mapRef.current) mapRef.current.setCenter(coords);
          runRadiusSearch(coords, 5000);
        },
        () => {},
        { timeout: 8000 },
      );
    }
    // Load from cache
    try {
      const ts = Number(sessionStorage.getItem(CACHE_TS_KEY) ?? 0);
      if (Date.now() - ts < CACHE_TTL_MS) {
        const cached = sessionStorage.getItem(CACHE_KEY);
        if (cached) {
          const ids: string[] = JSON.parse(cached);
          setRadiusFilteredIds(new Set(ids));
        }
      }
    } catch {
      /* ignore */
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // biome-ignore lint/correctness/useExhaustiveDependencies: mapCenter triggers timer reset
  useEffect(() => {
    if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    idleTimerRef.current = setTimeout(() => setShowSearchArea(true), 3000);
    return () => {
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    };
  }, [mapCenter]);

  const suggestions =
    searchText.length > 0
      ? HYDERABAD_LOCALITIES.filter((loc) =>
          loc.toLowerCase().includes(searchText.toLowerCase()),
        ).slice(0, 8)
      : [];

  const handleBack = () => {
    setLeaving(true);
    setTimeout(() => navigate({ to: "/" }), 280);
  };

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
          const ids = found15.length === 0 ? [] : found15.map((s) => s.id);
          setRadiusFilteredIds(new Set(ids));
          // Cache static data
          try {
            sessionStorage.setItem(CACHE_KEY, JSON.stringify(ids));
            sessionStorage.setItem(CACHE_TS_KEY, String(Date.now()));
          } catch {
            /* ignore */
          }
          // fitBounds for 15km
          if (mapRef.current && found15.length > 0) {
            const bounds = new google.maps.LatLngBounds();
            for (const s of found15) bounds.extend({ lat: s.lat, lng: s.lng });
            mapRef.current.fitBounds(bounds, 50);
          }
        }, 1000);
      } else {
        setRadiusFilteredIds(new Set(found.map((s) => s.id)));
        // fitBounds
        if (mapRef.current && found.length > 0) {
          const bounds = new google.maps.LatLngBounds();
          for (const s of found) bounds.extend({ lat: s.lat, lng: s.lng });
          mapRef.current.fitBounds(bounds, 50);
        }
        // Cache
        try {
          sessionStorage.setItem(
            CACHE_KEY,
            JSON.stringify(found.map((s) => s.id)),
          );
          sessionStorage.setItem(CACHE_TS_KEY, String(Date.now()));
        } catch {
          /* ignore */
        }
      }
    }, 1000);
  };

  const handleSelectSuggestion = (locality: string) => {
    setSearchText(locality);
    setShowSuggestions(false);
    const coords = LOCALITY_COORDS[locality];
    if (coords) {
      setMapCenter(coords);
      setSearchRadius(5000);
      if (mapRef.current) {
        mapRef.current.panTo(coords);
        mapRef.current.setZoom(15);
      }
      runRadiusSearch(coords, 5000);
    }
  };

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && suggestions.length > 0)
      handleSelectSuggestion(suggestions[0]);
    else if (e.key === "Enter" && searchText.trim()) {
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
    if (mapRef.current) {
      mapRef.current.setCenter(DEFAULT_CENTER);
      mapRef.current.setZoom(12);
    }
  };

  const handleSearchArea = () => {
    setSearchRadius(5000);
    runRadiusSearch(mapCenter, 5000);
  };

  const handleLocateMe = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const coords = {
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
          };
          setMapCenter(coords);
          if (mapRef.current) {
            mapRef.current.panTo(coords);
            mapRef.current.setZoom(14);
          }
          setSearchRadius(5000);
          runRadiusSearch(coords, 5000);
        },
        () => toast.error("Could not get your location"),
      );
    }
  };

  const handleStationClick = (station: Station) => {
    setSelectedStation(station);
    if (mapRef.current) {
      mapRef.current.panTo({ lat: station.lat, lng: station.lng });
      mapRef.current.setZoom(15);
    }
  };

  // Compute visible stations
  let visibleStations = EV_STATIONS;
  if (radiusFilteredIds !== null)
    visibleStations = visibleStations.filter((s) =>
      radiusFilteredIds.has(s.id),
    );
  if (chargerFilter !== "all")
    visibleStations = visibleStations.filter(
      (s) => s.chargerType === chargerFilter,
    );

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

      {/* Search bar */}
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
            placeholder="Search areas in Hyderabad..."
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

      {/* Map container */}
      <div className="flex-1 relative overflow-hidden">
        <div ref={mapContainerRef} className="w-full h-full" />

        {/* Map not loaded yet */}
        {!mapReady && (
          <div className="absolute inset-0 bg-gray-100 flex flex-col items-center justify-center gap-3">
            <div className="h-10 w-10 rounded-full border-4 border-green-500 border-t-transparent animate-spin" />
            <p className="text-sm font-semibold text-gray-600">Loading map…</p>
          </div>
        )}

        {/* Searching overlay */}
        {isSearching && (
          <div className="absolute inset-0 bg-white/60 flex flex-col items-center justify-center gap-3 z-10">
            <div className="h-10 w-10 rounded-full border-4 border-green-500 border-t-transparent animate-spin" />
            <p className="text-sm font-semibold text-green-700">
              Fetching stations…
            </p>
          </div>
        )}

        {/* Search this area */}
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

        {/* Locate Me FAB */}
        <button
          type="button"
          onClick={handleLocateMe}
          className="absolute bottom-[48%] right-4 h-12 w-12 rounded-full bg-white shadow-lg border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors z-10"
          title="Locate me"
          data-ocid="ev.button"
        >
          <Crosshair className="h-5 w-5 text-blue-600" />
        </button>

        {/* Station list bottom sheet */}
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
                const amenities = getAmenityIcons(station.connectors);
                const availText = getAvailabilityText(station);
                const isFirst = i === 0;

                return (
                  <button
                    key={station.id}
                    type="button"
                    onClick={() => handleStationClick(station)}
                    className="w-full text-left px-4 py-3 hover:bg-gray-50 flex gap-3 items-start transition-colors"
                    data-ocid={`ev.item.${i + 1}`}
                  >
                    <div
                      className={`h-8 w-8 rounded-full flex items-center justify-center shrink-0 ${station.chargerType === "fast" ? "bg-green-100" : "bg-blue-100"}`}
                    >
                      {station.chargerType === "fast" ? (
                        <Zap className="h-4 w-4 text-green-700" />
                      ) : (
                        <BatteryCharging className="h-4 w-4 text-blue-700" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <p className="font-semibold text-sm text-gray-900 leading-tight truncate">
                          {station.name}
                        </p>
                        {isFirst && (
                          <span className="shrink-0 text-[10px] font-bold bg-amber-100 text-amber-700 border border-amber-200 px-1.5 py-0.5 rounded-full">
                            Sponsored
                          </span>
                        )}
                        <span
                          className={`text-[10px] font-bold rounded-full px-1.5 py-0.5 shrink-0 flex items-center gap-0.5 ${isOpen ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}
                        >
                          {isOpen && (
                            <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                          )}
                          {availText}
                        </span>
                      </div>
                      <p className="text-xs text-gray-400 truncate mt-0.5">
                        {station.address}
                      </p>
                      <div className="flex items-center gap-2 mt-1 flex-wrap">
                        <span className="text-[10px] text-gray-500">
                          {distKm} km away
                        </span>
                        <div className="flex gap-1">
                          {station.connectors.map((c) => (
                            <span
                              key={c}
                              className={`text-[10px] font-medium rounded px-1.5 py-0.5 ${c === "CCS" || c === "CHAdeMO" ? "bg-green-50 text-green-700 border border-green-200" : "bg-blue-50 text-blue-700 border border-blue-200"}`}
                            >
                              {c === "CCS" || c === "CHAdeMO" ? `⚡ ${c}` : c}
                            </span>
                          ))}
                        </div>
                        <div className="flex gap-1">
                          {amenities.map((icon) => (
                            <span key={icon} className="text-xs" title={icon}>
                              {icon}
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
                  className={`h-9 w-9 rounded-full flex items-center justify-center ${selectedStation.chargerType === "fast" ? "bg-green-100" : "bg-blue-100"}`}
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
                      className={`text-[10px] font-bold rounded-full px-1.5 py-0.5 ${OPEN_NOW_IDS.has(selectedStation.id) ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}
                    >
                      {OPEN_NOW_IDS.has(selectedStation.id)
                        ? `• ${getAvailabilityText(selectedStation)}`
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
                    className={`text-xs font-semibold rounded-full px-3 py-1 ${c === "CCS" || c === "CHAdeMO" ? "bg-green-50 text-green-700 border border-green-200" : "bg-blue-50 text-blue-700 border border-blue-200"}`}
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

            <div className="flex items-center gap-2 mb-3">
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star
                    key={s}
                    className={`h-4 w-4 ${s <= Math.round(selectedStation.rating) ? "text-yellow-400 fill-yellow-400" : "text-gray-300"}`}
                  />
                ))}
              </div>
              <span className="text-sm font-bold text-gray-700">
                {selectedStation.rating}
              </span>
            </div>

            <div className="flex flex-wrap gap-1.5 mb-4">
              {["24/7 Open", "Parking", "Restrooms", "Cafe Nearby"].map((a) => (
                <span
                  key={a}
                  className="text-xs bg-gray-100 text-gray-600 rounded-full px-3 py-1 font-medium"
                >
                  {a}
                </span>
              ))}
            </div>

            {/* Photo Gallery */}
            <div className="mb-4">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                Photos
              </p>
              <div className="flex gap-2 overflow-x-auto pb-1">
                {[
                  {
                    bg: "bg-gradient-to-br from-green-100 to-green-200",
                    id: "pg",
                  },
                  {
                    bg: "bg-gradient-to-br from-blue-100 to-blue-200",
                    id: "pb",
                  },
                  {
                    bg: "bg-gradient-to-br from-teal-100 to-teal-200",
                    id: "pt",
                  },
                ].map(({ bg, id }) => (
                  <div
                    key={id}
                    className={`shrink-0 w-[120px] h-[90px] rounded-xl ${bg} flex items-center justify-center`}
                  >
                    <ImageOff className="h-6 w-6 text-gray-400" />
                  </div>
                ))}
              </div>
            </div>

            <Button
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl gap-2"
              onClick={() =>
                launchNavigation(
                  selectedStation.lat,
                  selectedStation.lng,
                  selectedStation.name,
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
