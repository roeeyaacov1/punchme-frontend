export const env = {
  apiOrigin: import.meta.env.VITE_API_ORIGIN || "http://127.0.0.1:8000",
  googleClientId: import.meta.env.VITE_GOOGLE_CLIENT_ID || "",
  googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || "",
  cloudinaryCloudName: import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || "",
  cloudinaryUploadPreset: import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || "",
  /** Mirrors the backend's OTP_REQUIRED. Temporarily false until the SMS
   * gateway account is live; the two must agree, or the join flow either
   * asks for a code nobody sends or skips one the API still demands.
   * Defaults to true when unset so a forgotten variable fails closed. */
  otpRequired: import.meta.env.VITE_OTP_REQUIRED !== "false",
};
