import { forwardRef, useEffect, useId, useRef, useState, type KeyboardEvent, type ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { charactersLeft } from "../../../components/card-studio/controls/controlRules";
import { Field } from "../../../components/kit";
import { fieldBox } from "../../../components/kit/classes";
import { useDebounce } from "../../../hooks/useDebounce";
import { cn } from "../../../lib/cn";
import {
  fetchAutocompleteSuggestions,
  fetchPlace,
  getOrCreateSessionToken,
  GoogleMapsNotConfiguredError,
  type PlaceResult,
} from "../../../lib/googlePlaces";

/** The API keeps a business name to 120 characters (BusinessIn.name). */
const NAME_MAX = 120;
/** The count says nothing until the name is this long. */
const COUNT_FROM = 100;

interface Suggestion {
  placeId: string;
  mainText: string;
  secondaryText: string;
  prediction: google.maps.places.PlacePrediction;
}

/**
 * The business's name: the kit's field, 48px, with Google Places suggestions
 * when a Maps key is set (and a plain field when it isn't), the arrow keys,
 * Enter and Escape on the list. At most the API's 120 characters, counted
 * from 100, so a name the server would refuse can't be typed. `dir="auto"`
 * once there is a name, so an English name runs left to right in a Hebrew
 * page. Its label is shown: in the map's business tray, nothing else asks
 * the question. The suggestions sit in the flow under the field, not over
 * what follows it: laid over the trades, the tray's own scroll box cut them
 * off, and in the flow the tray grows to hold them.
 */
export const BusinessNameField = forwardRef<
  HTMLInputElement,
  {
    value: string;
    onChange: (value: string) => void;
    onPlace: (place: PlaceResult) => void;
    error?: ReactNode;
  }
>(function BusinessNameField({ value, onChange, onPlace, error }, ref) {
  const { t } = useTranslation();
  const listId = useId();
  const typed = useDebounce(value, 300);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const session = useRef<google.maps.places.AutocompleteSessionToken | null>(null);
  const skipNext = useRef(false);
  /** A pointer is down somewhere on the page right now. */
  const pressing = useRef(false);

  useEffect(() => {
    const down = () => {
      pressing.current = true;
    };
    const up = () => {
      pressing.current = false;
    };
    window.addEventListener("pointerdown", down, true);
    window.addEventListener("pointerup", up, true);
    window.addEventListener("pointercancel", up, true);
    return () => {
      window.removeEventListener("pointerdown", down, true);
      window.removeEventListener("pointerup", up, true);
      window.removeEventListener("pointercancel", up, true);
    };
  }, []);

  /** The list sits in the flow, so closing it moves what's under it. A
   * mouse press that took focus from the field (on a trade, say) closes it
   * only once the press has landed, or a slow press would come up on
   * whatever moved under it; anything else closes it after a moment, time
   * for a finger's tap on a suggestion to land first. */
  function closeSoon() {
    if (!pressing.current) {
      window.setTimeout(() => setOpen(false), 150);
      return;
    }
    const landed = () => {
      window.removeEventListener("pointerup", landed);
      window.removeEventListener("pointercancel", landed);
      window.setTimeout(() => setOpen(false), 0);
    };
    window.addEventListener("pointerup", landed);
    window.addEventListener("pointercancel", landed);
  }

  useEffect(() => {
    if (skipNext.current) {
      skipNext.current = false;
      return;
    }
    if (!typed.trim()) {
      setSuggestions([]);
      setOpen(false);
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        // Both helpers wait for the Maps script; `google` doesn't exist
        // before it loads, or at all without a key.
        const token = await getOrCreateSessionToken(session.current);
        session.current = token;
        const results = await fetchAutocompleteSuggestions(typed, token);
        if (cancelled) return;
        setSuggestions(
          results
            .filter((result) => result.placePrediction)
            .map((result) => {
              const prediction = result.placePrediction!;
              return {
                placeId: prediction.placeId,
                mainText: prediction.mainText?.text ?? prediction.text.text,
                secondaryText: prediction.secondaryText?.text ?? "",
                prediction,
              };
            }),
        );
        setOpen(true);
        setActive(-1);
      } catch (err) {
        // No key, or Places had a bad moment: the field stays a plain field.
        if (!(err instanceof GoogleMapsNotConfiguredError)) console.error("Places autocomplete failed", err);
        if (!cancelled) {
          setSuggestions([]);
          setOpen(false);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [typed]);

  async function choose(suggestion: Suggestion) {
    skipNext.current = true;
    setOpen(false);
    setSuggestions([]);
    onChange(suggestion.mainText);
    try {
      const place = await fetchPlace(suggestion.prediction);
      session.current = null;
      onPlace(place);
    } catch (err) {
      console.error("Failed to fetch place details", err);
    }
  }

  const listed = open && suggestions.length > 0;

  function onKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (!listed) return;
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActive((index) => (index + 1) % suggestions.length);
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActive((index) => (index <= 0 ? suggestions.length - 1 : index - 1));
    } else if (event.key === "Enter" && active >= 0) {
      // Takes the suggestion rather than the screen's action.
      event.preventDefault();
      void choose(suggestions[active]);
    } else if (event.key === "Escape") {
      event.preventDefault();
      setOpen(false);
    }
  }

  const left = charactersLeft(value, NAME_MAX, COUNT_FROM);

  return (
    <Field
      label={t("onboarding.business.nameLabel")}
      hint={left === null ? undefined : t("cardControls.charactersLeft", { count: left })}
      error={error}
    >
      {({ id, describedBy, invalid }) => (
        <div className="relative">
          <input
            ref={ref}
            id={id}
            type="text"
            role="combobox"
            aria-expanded={listed}
            aria-controls={listed ? listId : undefined}
            aria-autocomplete="list"
            aria-activedescendant={listed && active >= 0 ? `${listId}-${active}` : undefined}
            aria-describedby={describedBy}
            aria-invalid={invalid || undefined}
            autoComplete="off"
            enterKeyHint="next"
            maxLength={NAME_MAX}
            dir={value ? "auto" : undefined}
            value={value}
            placeholder={t("onboarding.business.namePlaceholder")}
            onChange={(event) => onChange(event.target.value)}
            onKeyDown={onKeyDown}
            onFocus={() => suggestions.length > 0 && setOpen(true)}
            onBlur={closeSoon}
            className={cn(fieldBox, "min-h-12")}
          />
          {listed && (
            <ul
              id={listId}
              role="listbox"
              aria-label={t("onboarding.business.nameLabel")}
              className="mt-2 overflow-hidden rounded-field border border-border bg-surface py-1 text-ink shadow-panel"
            >
              {suggestions.map((suggestion, index) => (
                <li
                  key={suggestion.placeId}
                  id={`${listId}-${index}`}
                  role="option"
                  aria-selected={index === active}
                  // Taken on the press, before the field's blur closes the list.
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={() => void choose(suggestion)}
                  className={cn(
                    "flex min-h-11 cursor-pointer flex-col justify-center px-4 py-2 hover-fine:bg-ink/5",
                    index === active && "bg-ink/[0.06]",
                  )}
                >
                  <span dir="auto" className="type-body">
                    {suggestion.mainText}
                  </span>
                  {suggestion.secondaryText && (
                    <span dir="auto" className="text-sm leading-snug text-ink-muted">
                      {suggestion.secondaryText}
                    </span>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </Field>
  );
});
