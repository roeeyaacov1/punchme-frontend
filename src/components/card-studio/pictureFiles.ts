/**
 * Reading a picked file in the browser, before anything is sent: as a data
 * URL to hold until Save and show on the card at once, and its size, so a
 * strip under the renderer's floor is refused at the tile rather than at
 * Save. Browser-only (FileReader, Image).
 */

/** Anything bigger is refused before it is read: the server normalises art
 * to 512px, so there is nothing to gain from it, and the tab would carry it. */
export const PICTURE_MAX_BYTES = 8 * 1024 * 1024;

/** The strip renderer's floor (apps/wallet/images.py, STRIP_MIN_*). */
export const STRIP_MIN = { width: 1125, height: 432 } as const;

export function readPicture(file: File): Promise<string> {
  if (file.size > PICTURE_MAX_BYTES) return Promise.reject(new Error("too large"));
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => (typeof reader.result === "string" ? resolve(reader.result) : reject(new Error("undecodable image")));
    reader.onerror = () => reject(new Error("undecodable image"));
    reader.readAsDataURL(file);
  });
}

export function pictureSize(dataUrl: string): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve({ width: image.naturalWidth, height: image.naturalHeight });
    image.onerror = () => reject(new Error("undecodable image"));
    image.src = dataUrl;
  });
}
