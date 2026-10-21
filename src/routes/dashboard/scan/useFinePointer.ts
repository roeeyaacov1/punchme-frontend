import { useEffect, useState } from "react";

const QUERY = "(hover: hover) and (pointer: fine)";

/**
 * A desk: a mouse or a trackpad, so most likely a keyboard too, and perhaps a
 * USB or Bluetooth scanner that types a code and Enter. The same media query
 * as Tailwind's `hover-fine`, read in script because it decides where focus
 * goes, not only how things look.
 */
export function useFinePointer(): boolean {
  const [fine, setFine] = useState(() => typeof window !== "undefined" && window.matchMedia(QUERY).matches);
  useEffect(() => {
    const media = window.matchMedia(QUERY);
    const update = () => setFine(media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);
  return fine;
}
