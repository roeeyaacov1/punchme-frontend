import { env } from "./env";

export class GoogleMapsNotConfiguredError extends Error {
  constructor() {
    super("Google Maps API key is not configured");
    this.name = "GoogleMapsNotConfiguredError";
  }
}

let loadPromise: Promise<void> | null = null;

/** Injects the Maps JS API script (places library) once and memoizes the
 * load, so multiple mounts of PlacesAutocomplete don't re-inject it. */
export function loadGooglePlaces(): Promise<void> {
  if (!env.googleMapsApiKey) {
    return Promise.reject(new GoogleMapsNotConfiguredError());
  }
  if (window.google?.maps?.places) {
    return Promise.resolve();
  }
  if (loadPromise) {
    return loadPromise;
  }

  loadPromise = new Promise((resolve, reject) => {
    const callbackName = "__punchmeGoogleMapsLoaded";
    (window as unknown as Record<string, () => void>)[callbackName] = () => resolve();

    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(
      env.googleMapsApiKey,
    )}&libraries=places&v=weekly&loading=async&callback=${callbackName}`;
    script.async = true;
    script.onerror = () => {
      loadPromise = null;
      reject(new Error("Failed to load Google Maps script"));
    };
    document.head.appendChild(script);
  });

  return loadPromise;
}

export interface PlaceResult {
  displayName: string;
  formattedAddress?: string;
  internationalPhoneNumber?: string;
  addressComponents?: google.maps.places.AddressComponent[];
  location?: { lat: number; lng: number };
}

/** Fetches only the fields Phase A needs today; Phase C's LocationStep should
 * request a wider field mask (addressComponents, regularOpeningHours) on the
 * same selected place rather than re-fetching from scratch. */
export async function fetchPlace(
  placePrediction: google.maps.places.PlacePrediction,
): Promise<PlaceResult> {
  const { place } = await placePrediction.toPlace().fetchFields({
    fields: ["displayName", "formattedAddress", "internationalPhoneNumber"],
  });

  return {
    displayName: place.displayName ?? "",
    formattedAddress: place.formattedAddress ?? undefined,
    internationalPhoneNumber: place.internationalPhoneNumber ?? undefined,
  };
}

/** Reuses `existing` if given, otherwise waits for the Maps script to load
 * before touching the `google` global — never reference `google.*` directly
 * without awaiting loadGooglePlaces() first, since it doesn't exist at all
 * when no API key is configured. */
export async function getOrCreateSessionToken(
  existing: google.maps.places.AutocompleteSessionToken | null,
): Promise<google.maps.places.AutocompleteSessionToken> {
  if (existing) return existing;
  await loadGooglePlaces();
  return new google.maps.places.AutocompleteSessionToken();
}

export async function fetchAutocompleteSuggestions(
  input: string,
  sessionToken: google.maps.places.AutocompleteSessionToken,
): Promise<google.maps.places.AutocompleteSuggestion[]> {
  await loadGooglePlaces();
  const { AutocompleteSuggestion } = google.maps.places;
  const { suggestions } = await AutocompleteSuggestion.fetchAutocompleteSuggestions({
    input,
    sessionToken,
  });
  return suggestions;
}
