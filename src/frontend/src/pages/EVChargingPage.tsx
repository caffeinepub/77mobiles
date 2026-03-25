import { Button } from "@/components/ui/button";
import { useNavigate } from "@tanstack/react-router";
import { ArrowLeft, Crosshair, MapPin, Navigation, X } from "lucide-react";
import { useState } from "react";

const EV_STATIONS = [
  {
    id: "1",
    name: "Tata Power EV Station — Banjara Hills",
    address: "Road No. 12, Banjara Hills, Hyderabad",
    connectors: ["Type 2", "CCS"],
    lat: 17.415,
    lng: 78.448,
  },
  {
    id: "2",
    name: "EESL Charging Hub — Hitech City",
    address: "HUDA Techno Enclave, Hitech City, Hyderabad",
    connectors: ["Type 2", "CCS", "CHAdeMO"],
    lat: 17.446,
    lng: 78.38,
  },
  {
    id: "3",
    name: "TSREDCO Fast Charger — Jubilee Hills",
    address: "Film Nagar, Jubilee Hills, Hyderabad",
    connectors: ["Type 2", "CCS"],
    lat: 17.431,
    lng: 78.41,
  },
  {
    id: "4",
    name: "Charge Zone — Gachibowli",
    address: "DLF Cyber City, Gachibowli, Hyderabad",
    connectors: ["CCS", "CHAdeMO"],
    lat: 17.445,
    lng: 78.35,
  },
  {
    id: "5",
    name: "Ather Grid — Madhapur",
    address: "Madhapur Main Road, Hyderabad",
    connectors: ["Type 2"],
    lat: 17.452,
    lng: 78.39,
  },
  {
    id: "6",
    name: "BESCOM EV Point — Secunderabad",
    address: "MG Road, Secunderabad, Hyderabad",
    connectors: ["Type 2", "CCS"],
    lat: 17.438,
    lng: 78.498,
  },
];

interface Station {
  id: string;
  name: string;
  address: string;
  connectors: string[];
  lat: number;
  lng: number;
}

export default function EVChargingPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [selectedStation, setSelectedStation] = useState<Station | null>(null);

  const [mapCenter, setMapCenter] = useState({ lat: 17.4, lng: 78.43 });

  const locateMe = () => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setMapCenter({ lat: pos.coords.latitude, lng: pos.coords.longitude });
      },
      () => {},
    );
  };

  const filteredStations = EV_STATIONS.filter(
    (s) =>
      !search ||
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.address.toLowerCase().includes(search.toLowerCase()),
  );

  // Build OSM URL with all station markers
  const bbox = `${mapCenter.lng - 0.12},${mapCenter.lat - 0.08},${mapCenter.lng + 0.12},${mapCenter.lat + 0.08}`;
  const mapUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${mapCenter.lat},${mapCenter.lng}`;

  return (
    <div
      className="fixed inset-0 z-[55] bg-white flex flex-col"
      data-ocid="ev.panel"
    >
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center gap-3 shadow-sm shrink-0">
        <button
          type="button"
          onClick={() => {
            if (window.history.length > 1) navigate({ to: -1 as any });
            else navigate({ to: "/" });
          }}
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
          {filteredStations.length} stations
        </span>
      </div>

      {/* Search bar */}
      <div className="px-4 py-2 bg-white border-b border-gray-100">
        <div className="flex items-center gap-2 bg-gray-100 rounded-xl px-3 h-10">
          <MapPin className="h-4 w-4 text-gray-400 shrink-0" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search for stations in other areas..."
            className="flex-1 bg-transparent text-sm text-gray-800 placeholder-gray-400 outline-none"
            data-ocid="ev.search_input"
          />
          {search && (
            <button type="button" onClick={() => setSearch("")}>
              <X className="h-3.5 w-3.5 text-gray-400" />
            </button>
          )}
        </div>
      </div>

      {/* Map */}
      <div className="flex-1 relative overflow-hidden">
        <iframe
          title="EV Charging Map"
          width="100%"
          height="100%"
          src={mapUrl}
          className="border-0 w-full h-full"
          loading="lazy"
        />

        {/* Floating Locate Me button */}
        <button
          type="button"
          onClick={locateMe}
          className="absolute bottom-28 right-4 h-12 w-12 rounded-full bg-white shadow-lg border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors z-10"
          title="Locate me"
          data-ocid="ev.button"
        >
          <Crosshair className="h-5 w-5 text-blue-600" />
        </button>

        {/* Station list overlay at bottom */}
        <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-2xl shadow-2xl border-t border-gray-200 max-h-[45%] overflow-y-auto">
          <div className="flex items-center justify-center pt-2 pb-1">
            <div className="w-10 h-1 rounded-full bg-gray-300" />
          </div>
          <p className="text-xs font-bold uppercase tracking-wider text-gray-400 px-4 py-2">
            Nearby Stations
          </p>
          <div className="divide-y divide-gray-100">
            {filteredStations.map((station, i) => (
              <button
                key={station.id}
                type="button"
                onClick={() => setSelectedStation(station)}
                className="w-full text-left px-4 py-3 hover:bg-gray-50 flex gap-3 items-start transition-colors"
                data-ocid={`ev.item.${i + 1}`}
              >
                <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center shrink-0">
                  <span className="text-green-700 text-xs font-bold">EV</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm text-gray-900 leading-tight truncate">
                    {station.name}
                  </p>
                  <p className="text-xs text-gray-400 truncate mt-0.5">
                    {station.address}
                  </p>
                  <div className="flex gap-1 mt-1 flex-wrap">
                    {station.connectors.map((c) => (
                      <span
                        key={c}
                        className="text-[10px] font-medium bg-green-50 text-green-700 border border-green-200 rounded px-1.5 py-0.5"
                      >
                        {c}
                      </span>
                    ))}
                  </div>
                </div>
              </button>
            ))}
          </div>
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
          <div className="w-full bg-white rounded-t-2xl shadow-2xl p-5 border-t border-gray-200">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="h-9 w-9 rounded-full bg-green-100 flex items-center justify-center">
                  <span className="text-green-700 font-bold text-xs">EV</span>
                </div>
                <div>
                  <p className="font-bold text-gray-900 text-sm">
                    {selectedStation.name}
                  </p>
                  <p className="text-xs text-gray-400">
                    {selectedStation.address}
                  </p>
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
            <div className="flex gap-1 flex-wrap mb-4">
              {selectedStation.connectors.map((c) => (
                <span
                  key={c}
                  className="text-xs font-semibold bg-green-50 text-green-700 border border-green-200 rounded-full px-3 py-1"
                >
                  {c}
                </span>
              ))}
            </div>
            <Button
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl gap-2"
              onClick={() => {
                const url = `https://maps.google.com/?q=${selectedStation.lat},${selectedStation.lng}`;
                window.open(url, "_blank", "noopener,noreferrer");
              }}
              data-ocid="ev.primary_button"
            >
              <Navigation className="h-4 w-4" />
              Navigate
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
