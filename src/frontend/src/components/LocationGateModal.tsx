import { MapPin, Navigation, Search } from "lucide-react";
import { useEffect, useRef, useState } from "react";

const INDIAN_CITIES = [
  "Mumbai",
  "Delhi",
  "Bengaluru",
  "Hyderabad",
  "Chennai",
  "Kolkata",
  "Pune",
  "Ahmedabad",
  "Jaipur",
  "Surat",
  "Lucknow",
  "Kanpur",
  "Nagpur",
  "Indore",
  "Thane",
  "Bhopal",
  "Visakhapatnam",
  "Patna",
  "Vadodara",
  "Ghaziabad",
  "Ludhiana",
  "Agra",
  "Nashik",
  "Faridabad",
  "Meerut",
  "Rajkot",
  "Varanasi",
  "Srinagar",
  "Aurangabad",
  "Coimbatore",
  "Kochi",
  "Chandigarh",
  "Guwahati",
  "Mysuru",
  "Jodhpur",
  "Madurai",
  "Raipur",
  "Kota",
  "Gurgaon",
  "Noida",
  "Navi Mumbai",
  "Secunderabad",
  "Thiruvananthapuram",
];

const POPULAR_CITIES = [
  "Mumbai",
  "Delhi",
  "Bengaluru",
  "Hyderabad",
  "Chennai",
  "Pune",
  "Kolkata",
  "Ahmedabad",
];

interface LocationGateModalProps {
  forceOpen?: boolean;
  onClose?: () => void;
}

export default function LocationGateModal({
  forceOpen,
  onClose,
}: LocationGateModalProps) {
  const [visible, setVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [detecting, setDetecting] = useState(false);
  const [error, setError] = useState("");
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (forceOpen) {
      setVisible(true);
      setSearchQuery("");
      setError("");
      return;
    }
    const saved = localStorage.getItem("userLocation");
    if (!saved) setVisible(true);
  }, [forceOpen]);

  const saveLocation = (loc: string) => {
    localStorage.setItem("userLocation", loc);
    window.dispatchEvent(new CustomEvent("locationChanged", { detail: loc }));
    setVisible(false);
    onClose?.();
  };

  const handleDetect = () => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser.");
      return;
    }
    setDetecting(true);
    setError("");
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${pos.coords.latitude}&lon=${pos.coords.longitude}&format=json`,
          );
          const data = await res.json();
          const city =
            data.address?.city ||
            data.address?.town ||
            data.address?.village ||
            data.address?.county ||
            data.address?.state ||
            "India";
          saveLocation(city);
        } catch {
          setError("Could not detect location. Please type your city below.");
        } finally {
          setDetecting(false);
        }
      },
      (err) => {
        setDetecting(false);
        if (err.code === 1) {
          setError("Location access denied. Please type your city below.");
        } else if (err.code === 3) {
          setError("Location request timed out. Please type your city below.");
        } else {
          setError("Could not get location. Please type your city below.");
        }
      },
      { timeout: 10000, enableHighAccuracy: false },
    );
  };

  const filtered =
    searchQuery.trim().length > 0
      ? INDIAN_CITIES.filter((c) =>
          c.toLowerCase().includes(searchQuery.toLowerCase()),
        )
      : [];

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && filtered.length > 0) {
      e.preventDefault();
      saveLocation(filtered[0]);
    }
  };

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-[200] bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="bg-white w-full sm:max-w-md rounded-t-3xl sm:rounded-2xl shadow-2xl overflow-hidden">
        {/* Drag handle for mobile */}
        <div className="w-10 h-1 bg-gray-200 rounded-full mx-auto mt-3 mb-0 sm:hidden" />

        {/* Header */}
        <div className="px-5 pt-5 pb-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
              <MapPin className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <h2 className="font-bold text-gray-900 text-lg leading-tight">
                Set your location
              </h2>
              <p className="text-gray-500 text-sm">Find listings near you</p>
            </div>
          </div>
        </div>

        <div className="px-5 py-4 space-y-3 max-h-[70vh] overflow-y-auto">
          {/* Detect button */}
          <button
            type="button"
            onClick={handleDetect}
            disabled={detecting}
            className="w-full flex items-center gap-3 p-4 rounded-xl bg-blue-50 hover:bg-blue-100 border border-blue-200 transition-colors disabled:opacity-60"
            data-ocid="location_gate.primary_button"
          >
            {detecting ? (
              <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin shrink-0" />
            ) : (
              <Navigation className="h-5 w-5 text-blue-600 shrink-0" />
            )}
            <div className="text-left">
              <p className="text-sm font-semibold text-blue-700">
                {detecting ? "Detecting location…" : "Use current location"}
              </p>
              <p className="text-xs text-blue-500">Auto-detect via GPS</p>
            </div>
          </button>

          {error && (
            <div
              className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-xl"
              data-ocid="location_gate.error_state"
            >
              <span className="text-red-500 text-sm leading-snug">{error}</span>
            </div>
          )}

          {/* Divider */}
          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-gray-100" />
            <span className="text-xs text-gray-400 font-medium">
              or type your city
            </span>
            <div className="flex-1 h-px bg-gray-100" />
          </div>

          {/* Search input */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              ref={searchRef}
              type="text"
              placeholder="Search city, area or locality…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleSearchKeyDown}
              className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
              data-ocid="location_gate.search_input"
              autoComplete="off"
            />
          </div>

          {/* Filtered suggestions */}
          {filtered.length > 0 && (
            <div className="border border-gray-100 rounded-xl overflow-hidden max-h-48 overflow-y-auto">
              {filtered.slice(0, 10).map((city) => (
                <button
                  key={city}
                  type="button"
                  onMouseDown={(e) => {
                    e.preventDefault();
                    saveLocation(city);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-blue-50 border-b border-gray-50 last:border-0 text-left transition-colors cursor-pointer"
                  data-ocid="location_gate.button"
                >
                  <MapPin className="h-4 w-4 text-gray-400 shrink-0" />
                  <span className="text-sm text-gray-700">{city}</span>
                </button>
              ))}
            </div>
          )}

          {/* Popular cities when no search */}
          {searchQuery.trim() === "" && (
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">
                Popular Cities
              </p>
              <div className="flex flex-wrap gap-2">
                {POPULAR_CITIES.map((city) => (
                  <button
                    key={city}
                    type="button"
                    onMouseDown={(e) => {
                      e.preventDefault();
                      saveLocation(city);
                    }}
                    className="px-3 py-1.5 rounded-full border border-gray-200 text-sm text-gray-600 hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50 transition-colors cursor-pointer"
                    data-ocid="location_gate.button"
                  >
                    {city}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="px-5 pb-6 pt-2">
          <p className="text-xs text-gray-400 text-center">
            Your location helps show relevant listings near you
          </p>
        </div>
      </div>
    </div>
  );
}
