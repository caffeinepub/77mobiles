import { ChevronRight, MapPin, Navigation, Search, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";

const STATES_UTS = [
  "All in India",
  "Andaman & Nicobar Islands",
  "Andhra Pradesh",
  "Arunachal Pradesh",
  "Assam",
  "Bihar",
  "Chandigarh",
  "Chhattisgarh",
  "Dadra & Nagar Haveli",
  "Daman & Diu",
  "Delhi",
  "Goa",
  "Gujarat",
  "Haryana",
  "Himachal Pradesh",
  "Jammu & Kashmir",
  "Jharkhand",
  "Karnataka",
  "Kerala",
  "Ladakh",
  "Lakshadweep",
  "Madhya Pradesh",
  "Maharashtra",
  "Manipur",
  "Meghalaya",
  "Mizoram",
  "Nagaland",
  "Odisha",
  "Puducherry",
  "Punjab",
  "Rajasthan",
  "Sikkim",
  "Tamil Nadu",
  "Telangana",
  "Tripura",
  "Uttar Pradesh",
  "Uttarakhand",
  "West Bengal",
];

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

interface LocationPickerModalProps {
  open: boolean;
  onClose: () => void;
  onSelect: (location: string) => void;
}

function getRecentLocations(): string[] {
  try {
    return JSON.parse(localStorage.getItem("recentLocations") || "[]");
  } catch {
    return [];
  }
}

function addRecentLocation(loc: string) {
  const recent = getRecentLocations().filter((l) => l !== loc);
  recent.unshift(loc);
  localStorage.setItem("recentLocations", JSON.stringify(recent.slice(0, 5)));
}

export default function LocationPickerModal({
  open,
  onClose,
  onSelect,
}: LocationPickerModalProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [detecting, setDetecting] = useState(false);
  const [detectError, setDetectError] = useState("");
  const [recentLocations, setRecentLocations] = useState<string[]>([]);
  const [detectedOptions, setDetectedOptions] = useState<string[]>([]);
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setRecentLocations(getRecentLocations());
      setSearchQuery("");
      setDetectError("");
      setDetectedOptions([]);
      setTimeout(() => searchRef.current?.focus(), 100);
    }
  }, [open]);

  const handleSelect = (loc: string) => {
    addRecentLocation(loc);
    localStorage.setItem("userLocation", loc);
    window.dispatchEvent(new CustomEvent("locationChanged", { detail: loc }));
    onSelect(loc);
    onClose();
  };

  const handleDetect = () => {
    if (!navigator.geolocation) {
      setDetectError("Geolocation is not supported by your browser.");
      return;
    }
    setDetecting(true);
    setDetectError("");
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${pos.coords.latitude}&lon=${pos.coords.longitude}&format=json`,
          );
          const data = await res.json();
          const area =
            data.address?.suburb ||
            data.address?.neighbourhood ||
            data.address?.quarter ||
            data.address?.village;
          const city =
            data.address?.city ||
            data.address?.town ||
            data.address?.county ||
            data.address?.state;
          const options: string[] = [];
          if (area && city && area !== city) {
            options.push(`${area}, ${city}`);
          }
          if (city) options.push(city);
          if (area && !options.includes(area)) options.push(area);
          if (options.length === 0) options.push("India");
          if (options.length === 1) {
            handleSelect(options[0]);
          } else {
            setDetectedOptions(options);
          }
        } catch {
          setDetectError("Could not detect location. Please search manually.");
        } finally {
          setDetecting(false);
        }
      },
      (err) => {
        setDetecting(false);
        if (err.code === 1) {
          setDetectError("Location access denied. Please search manually.");
        } else if (err.code === 3) {
          setDetectError("Location timed out. Please search manually.");
        } else {
          setDetectError("Could not get location. Please search manually.");
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
      handleSelect(filtered[0]);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[150] bg-black/50 flex items-end sm:items-center justify-center">
      <div className="bg-white w-full sm:max-w-md rounded-t-3xl sm:rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 shrink-0">
          <h2 className="font-bold text-gray-900 text-lg">Location</h2>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-gray-100 text-gray-500 transition-colors"
            data-ocid="location_picker.close_button"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Search bar */}
        <div className="px-5 py-3 border-b border-gray-100 shrink-0">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              ref={searchRef}
              type="text"
              placeholder="Search city, area or locality"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleSearchKeyDown}
              className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
              data-ocid="location_picker.search_input"
              autoComplete="off"
            />
          </div>
        </div>

        <div className="overflow-y-auto flex-1">
          {/* Filtered results */}
          {filtered.length > 0 && (
            <div>
              {filtered.slice(0, 12).map((city) => (
                <button
                  key={city}
                  type="button"
                  onMouseDown={(e) => {
                    e.preventDefault();
                    handleSelect(city);
                  }}
                  className="w-full flex items-center gap-3 px-5 py-3.5 hover:bg-blue-50 border-b border-gray-50 last:border-0 text-left transition-colors cursor-pointer"
                  data-ocid="location_picker.button"
                >
                  <MapPin className="h-4 w-4 text-gray-400 shrink-0" />
                  <span className="text-sm text-gray-800">{city}</span>
                </button>
              ))}
              {filtered.length < 5 && searchQuery.trim().length > 0 && (
                <button
                  type="button"
                  onMouseDown={(e) => {
                    e.preventDefault();
                    handleSelect(searchQuery.trim());
                  }}
                  className="w-full flex items-center gap-3 px-5 py-3.5 hover:bg-blue-50 border-b border-gray-50 text-left transition-colors cursor-pointer"
                  data-ocid="location_picker.button"
                >
                  <MapPin className="h-4 w-4 text-blue-400 shrink-0" />
                  <span className="text-sm text-blue-600 italic">
                    Use "{searchQuery.trim()}" as location
                  </span>
                </button>
              )}
            </div>
          )}

          {searchQuery.trim() === "" && (
            <>
              {/* Use current location */}
              <button
                type="button"
                onClick={handleDetect}
                disabled={detecting}
                className="w-full flex items-center gap-3 px-5 py-4 hover:bg-blue-50 transition-colors border-b border-gray-100 disabled:opacity-60"
                data-ocid="location_picker.primary_button"
              >
                {detecting ? (
                  <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin shrink-0" />
                ) : (
                  <Navigation className="h-5 w-5 text-blue-600 shrink-0" />
                )}
                <div className="text-left">
                  <p className="text-sm font-semibold text-blue-600">
                    {detecting ? "Detecting location…" : "Use current location"}
                  </p>
                  <p className="text-xs text-gray-400">Enable Location</p>
                </div>
              </button>

              {detectError && (
                <div className="mx-5 my-2 p-3 bg-red-50 border border-red-200 rounded-xl">
                  <p className="text-sm text-red-600">{detectError}</p>
                </div>
              )}

              {detectedOptions.length > 0 && (
                <div className="mx-5 my-3 p-3 bg-blue-50 border border-blue-200 rounded-xl">
                  <p className="text-xs font-semibold text-blue-700 mb-2">
                    📍 Select your exact location:
                  </p>
                  <div className="flex flex-col gap-2">
                    {detectedOptions.map((opt) => (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => handleSelect(opt)}
                        className="w-full text-left px-3 py-2 bg-white border border-blue-200 rounded-lg text-sm text-blue-800 font-medium hover:bg-blue-100 transition-colors"
                        data-ocid="location_picker.button"
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Recent locations */}
              {recentLocations.length > 0 && (
                <>
                  <div className="px-5 py-2 bg-gray-50">
                    <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Recent
                    </span>
                  </div>
                  {recentLocations.slice(0, 3).map((loc) => (
                    <button
                      key={loc}
                      type="button"
                      onMouseDown={(e) => {
                        e.preventDefault();
                        handleSelect(loc);
                      }}
                      className="w-full flex items-center gap-3 px-5 py-3.5 hover:bg-gray-50 border-b border-gray-50 last:border-0 text-left transition-colors cursor-pointer"
                      data-ocid="location_picker.button"
                    >
                      <MapPin className="h-4 w-4 text-gray-400 shrink-0" />
                      <span className="text-sm text-gray-700">{loc}</span>
                    </button>
                  ))}
                </>
              )}

              {/* Choose region */}
              <div className="px-5 py-2 bg-gray-50">
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Choose region
                </span>
              </div>
              {STATES_UTS.map((state) => (
                <button
                  key={state}
                  type="button"
                  onMouseDown={(e) => {
                    e.preventDefault();
                    handleSelect(state);
                  }}
                  className={`w-full flex items-center justify-between px-5 py-3.5 hover:bg-blue-50 border-b border-gray-50 last:border-0 text-left transition-colors cursor-pointer ${
                    state === "All in India" ? "text-blue-600" : "text-gray-800"
                  }`}
                  data-ocid="location_picker.button"
                >
                  <span className="text-sm font-medium">{state}</span>
                  <ChevronRight className="h-4 w-4 text-gray-300 shrink-0" />
                </button>
              ))}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
