import { env } from "./env";

export class CloudinaryNotConfiguredError extends Error {
  constructor() {
    super("Cloudinary is not configured");
    this.name = "CloudinaryNotConfiguredError";
  }
}

/** Unsigned upload to Cloudinary. Throws CloudinaryNotConfiguredError when the
 * env vars are empty (true today) so callers can fall back to a paste-URL
 * field instead of surfacing a confusing network error. */
export async function uploadLogo(file: File): Promise<string> {
  if (!env.cloudinaryCloudName || !env.cloudinaryUploadPreset) {
    throw new CloudinaryNotConfiguredError();
  }

  const body = new FormData();
  body.append("file", file);
  body.append("upload_preset", env.cloudinaryUploadPreset);

  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${env.cloudinaryCloudName}/image/upload`,
    { method: "POST", body },
  );

  if (!res.ok) {
    throw new Error(`Cloudinary upload failed (${res.status})`);
  }

  const data = await res.json();
  return data.secure_url as string;
}
