import { useEffect, useId, useRef, useState } from "react";
import { cn } from "../../lib/cn";
import { useDebounce } from "../../hooks/useDebounce";
import {
  fetchAutocompleteSuggestions,
  fetchPlace,
  getOrCreateSessionToken,
  GoogleMapsNotConfiguredError,
  type PlaceResult,
} from "../../lib/googlePlaces";

interface Suggestion {
  placeId: string;
  mainText: string;
  secondaryText: string;
  prediction: google.maps.places.PlacePrediction;
}

interface PlacesAutocompleteProps {
  label?: string;
  /** Keep the label for screen readers but let a heading carry it visually. */
  labelHidden?: boolean;
  value: string;
  onQueryChange: (value: string) => void;
  onSelect: (place: PlaceResult) => void;
  placeholder?: string;
  required?: boolean;
}

/** Text `Input`-styled combobox backed by the Google Places Autocomplete
 * (New) API. Silently degrades to a plain text field (no dropdown) when
 * VITE_GOOGLE_MAPS_API_KEY isn't configured, so the wizard stays fully
 * usable without it. */
export function PlacesAutocomplete({
  label,
  labelHidden = false,
  value,
  onQueryChange,
  onSelect,
  placeholder,
  required,
}: PlacesAutocompleteProps) {
  const inputId = useId();
  const debouncedValue = useDebounce(value, 300);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const sessionTokenRef = useRef<google.maps.places.AutocompleteSessionToken | null>(null);
  const skipNextFetchRef = useRef(false);

  useEffect(() => {
    if (skipNextFetchRef.current) {
      skipNextFetchRef.current = false;
      return;
    }
    if (!debouncedValue.trim()) {
      setSuggestions([]);
      setIsOpen(false);
      return;
    }

    let cancelled = false;

    (async () => {
      try {
        // Never touch the `google` global directly here — it doesn't exist
        // until loadGooglePlaces() resolves, and doesn't exist at all when
        // no API key is configured. Both helpers below await the load first.
        const token = await getOrCreateSessionToken(sessionTokenRef.current);
        sessionTokenRef.current = token;
        const results = await fetchAutocompleteSuggestions(debouncedValue, token);
        if (cancelled) return;
        setSuggestions(
          results
            .filter((s) => s.placePrediction)
            .map((s) => {
              const prediction = s.placePrediction!;
              return {
                placeId: prediction.placeId,
                mainText: prediction.mainText?.text ?? prediction.text.text,
                secondaryText: prediction.secondaryText?.text ?? "",
                prediction,
              };
            }),
        );
        setIsOpen(true);
        setActiveIndex(-1);
      } catch (err) {
        // No API key configured, or a transient Places error — degrade to a
        // plain text field rather than blocking the user from typing.
        if (!(err instanceof GoogleMapsNotConfiguredError)) {
          console.error("Places autocomplete failed", err);
        }
        if (!cancelled) {
          setSuggestions([]);
          setIsOpen(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [debouncedValue]);

  async function handleSelect(suggestion: Suggestion) {
    skipNextFetchRef.current = true;
    setIsOpen(false);
    setSuggestions([]);
    onQueryChange(suggestion.mainText);
    try {
      const place = await fetchPlace(suggestion.prediction);
      sessionTokenRef.current = null;
      onSelect(place);
    } catch (err) {
      console.error("Failed to fetch place details", err);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (!isOpen || suggestions.length === 0) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => (i + 1) % suggestions.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => (i <= 0 ? suggestions.length - 1 : i - 1));
    } else if (e.key === "Enter" && activeIndex >= 0) {
      e.preventDefault();
      void handleSelect(suggestions[activeIndex]);
    } else if (e.key === "Escape") {
      setIsOpen(false);
    }
  }

  return (
    <div className="relative flex flex-col gap-1.5 text-start">
      {label && (
        <label
          htmlFor={inputId}
          className={cn(
            "text-sm font-medium text-navy font-body",
            labelHidden && "sr-only",
          )}
        >
          {label}
        </label>
      )}
      <input
        id={inputId}
        role="combobox"
        aria-expanded={isOpen}
        aria-autocomplete="list"
        autoComplete="off"
        value={value}
        placeholder={placeholder}
        required={required}
        onChange={(e) => onQueryChange(e.target.value)}
        onKeyDown={handleKeyDown}
        onFocus={() => suggestions.length > 0 && setIsOpen(true)}
        onBlur={() => setTimeout(() => setIsOpen(false), 150)}
        className={cn(
          "w-full rounded-xl border border-navy/15 bg-white px-4 py-2.5 text-navy font-body placeholder:text-slate/60",
          "focus:outline-none focus:ring-2 focus:ring-navy/30 focus:border-navy/40",
        )}
      />
      {isOpen && suggestions.length > 0 && (
        <ul
          role="listbox"
          className="absolute top-full z-30 mt-1 w-full rounded-xl border border-navy/10 bg-white shadow-lg overflow-hidden"
        >
          {suggestions.map((s, i) => (
            <li key={s.placeId} role="option" aria-selected={i === activeIndex}>
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => void handleSelect(s)}
                className={cn(
                  "w-full text-start px-4 py-2.5 flex flex-col gap-0.5 transition-colors",
                  i === activeIndex ? "bg-navy/5" : "hover:bg-navy/5",
                )}
              >
                <span className="text-sm font-body text-navy">{s.mainText}</span>
                {s.secondaryText && (
                  <span className="text-xs font-body text-slate">{s.secondaryText}</span>
                )}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
