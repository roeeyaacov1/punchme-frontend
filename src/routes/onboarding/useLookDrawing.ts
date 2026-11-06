import { useEffect, useState } from "react";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { drawLook, type LookDraw } from "../../api/presets";
import { useDebounce } from "../../hooks/useDebounce";
import { drawFailure, drawKey, type DrawFailure } from "./drawing";

/** A drawing is asked this long after the last change that alters it, as
 * the studio asks its own; the first, as the card first stands, at once. */
const DRAW_DELAY_MS = 400;

/** From this long into a drawing, the stage says one is coming. */
const SLOW_MS = 500;

export interface DrawnPicture {
  /** The picture, as a data URL: dropped with the query that holds it. */
  url: string;
  role: LookDraw["role"];
}

export interface LookDrawing {
  /** The last picture drawn and decoded, kept while the next is drawn. */
  picture: DrawnPicture | null;
  /** A drawing has been on its way for 500ms or more. */
  slow: boolean;
  /** The drawing of the card as it is now didn't come, and why. */
  failure: DrawFailure | null;
}

function asDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(blob);
  });
}

/**
 * The map's card drawn by the wallet, through the backend (brief §7.4): asked
 * 400ms after a change that alters it, for the wallet the stage shows, each
 * drawing once (a card drawn before comes from the cache). The last picture
 * stays while the next is drawn, and a picture counts once it is decoded, so
 * the stage never shows one half drawn. Nothing is asked for `null`.
 */
export function useLookDrawing(body: LookDraw | null): LookDrawing {
  const key = body ? drawKey(body) : null;
  const asked = useDebounce(key, DRAW_DELAY_MS);
  const read = useQuery({
    queryKey: ["look-drawing", asked],
    queryFn: async ({ signal }): Promise<DrawnPicture> => {
      const wanted = JSON.parse(asked!) as LookDraw;
      return { url: await asDataUrl(await drawLook(wanted, signal)), role: wanted.role };
    },
    enabled: asked !== null,
    staleTime: Infinity,
    gcTime: 5 * 60_000,
    // A 429 is said, never tried again behind the owner's back.
    retry: false,
    placeholderData: keepPreviousData,
  });

  const data = read.data;
  const [shown, setShown] = useState<DrawnPicture | null>(null);
  useEffect(() => {
    if (!data) return;
    let live = true;
    const image = new Image();
    image.src = data.url;
    image
      .decode()
      .catch(() => undefined)
      .then(() => {
        if (live) setShown(data);
      });
    return () => {
      live = false;
    };
  }, [data]);

  const failure = key !== null && key === asked && read.isError ? drawFailure(read.error) : null;
  const waiting = key !== null && !failure && (key !== asked || read.isFetching || (!!data && shown?.url !== data.url));
  const [slow, setSlow] = useState(false);
  useEffect(() => {
    if (!waiting) {
      setSlow(false);
      return;
    }
    const timer = window.setTimeout(() => setSlow(true), SLOW_MS);
    return () => window.clearTimeout(timer);
  }, [waiting]);

  return { picture: key === null ? null : shown, slow: waiting && slow, failure };
}
