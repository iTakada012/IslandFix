/**
 * Reverse geocoding with the public OpenStreetMap Nominatim API.
 * Turns GPS coordinates into a readable address, e.g. "Majeedhee Magu, Malé".
 *
 * Free, no API key. Usage policy: identify the app and keep to max 1 request
 * per second (we only call it once per report).
 * https://operations.osmfoundation.org/policies/nominatim/
 *
 * Errors are thrown with a friendly message so the UI can show them; the
 * report can still be saved without an address (offline friendly).
 */
import type {GeoPoint} from './types';

const BASE_URL = 'https://nominatim.openstreetmap.org/reverse';
const TIMEOUT_MS = 8000;

type NominatimResponse = {
  display_name?: string;
  error?: string;
};

/** Keep the first few parts of a long Nominatim address. */
export function shortenAddress(displayName: string, parts = 3): string {
  return displayName
    .split(',')
    .map(p => p.trim())
    .filter(Boolean)
    .slice(0, parts)
    .join(', ');
}

export async function reverseGeocode(point: GeoPoint): Promise<string> {
  const url = `${BASE_URL}?format=json&zoom=18&lat=${point.latitude}&lon=${point.longitude}`;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        Accept: 'application/json',
        'Accept-Language': 'en',
        'User-Agent': 'IslandFix-StudentProject/1.0',
      },
    });

    if (!res.ok) {
      throw new Error(`Address service returned ${res.status}`);
    }

    const data = (await res.json()) as NominatimResponse;
    if (data.error || !data.display_name) {
      throw new Error('No address found for this location');
    }
    return shortenAddress(data.display_name);
  } catch (e: any) {
    if (e?.name === 'AbortError') {
      throw new Error('Address lookup timed out. Check your connection.');
    }
    if (e instanceof TypeError) {
      // fetch throws TypeError when there is no network
      throw new Error('No internet connection. Address not added.');
    }
    throw e;
  } finally {
    clearTimeout(timer);
  }
}
