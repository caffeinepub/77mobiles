// Haversine distance in km between two lat/lon coordinates
export function haversine(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// Calls BigDataCloud free reverse geocoding (no API key)
export async function reverseGeocode(
  lat: number,
  lon: number,
): Promise<{ city: string; countryName: string }> {
  const url = `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=en`;
  const res = await fetch(url);
  if (!res.ok) throw new Error("Geocoding failed");
  const data = await res.json();
  return {
    city: data.city || data.locality || data.principalSubdivision || "Unknown",
    countryName: data.countryName || "",
  };
}

// Parse a location string stored as "lat,lon|CityName" or plain "CityName"
export function parseGeoLocation(
  location: string,
): { lat: number; lon: number; label: string } | null {
  const pipeIdx = location.indexOf("|");
  if (pipeIdx === -1) return null;
  const coords = location.slice(0, pipeIdx);
  const label = location.slice(pipeIdx + 1);
  const [latStr, lonStr] = coords.split(",");
  const lat = Number.parseFloat(latStr);
  const lon = Number.parseFloat(lonStr);
  if (Number.isNaN(lat) || Number.isNaN(lon)) return null;
  return { lat, lon, label };
}

// Encode as "lat,lon|CityName"
export function encodeGeoLocation(
  lat: number,
  lon: number,
  label: string,
): string {
  return `${lat},${lon}|${label}`;
}
