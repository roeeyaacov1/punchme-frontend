import { useLayoutEffect, type RefObject } from "react";
import { cancelRender, continueRender, delayRender } from "remotion";

/**
 * The passes draw their pictures with plain `<img>`s, which Remotion doesn't
 * wait for. After every render this holds the frame until every picture
 * inside `ref` is loaded and decoded, so no frame is taken with a strip
 * missing. A picture that fails fails the render.
 */
export function useImagesReady(ref: RefObject<HTMLElement | null>): void {
  useLayoutEffect(() => {
    const pending = [...(ref.current?.querySelectorAll("img") ?? [])].filter((img) => !(img.complete && img.naturalWidth > 0));
    if (pending.length === 0) return;
    const handle = delayRender(`Waiting for ${pending.length} pass picture(s)`);
    let open = true;
    Promise.all(
      pending.map(
        (img) =>
          new Promise<void>((resolve, reject) => {
            img.addEventListener("load", () => resolve(), { once: true });
            img.addEventListener("error", () => reject(new Error(`A picture failed to load: ${img.src}`)), { once: true });
          }).then(() => img.decode().catch(() => undefined)),
      ),
    )
      .then(() => {
        if (open) continueRender(handle);
      })
      .catch((error: unknown) => cancelRender(error));
    return () => {
      // A newer render waits on its own; this one lets go.
      if (open) continueRender(handle);
      open = false;
    };
  });
}
