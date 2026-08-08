export const env = {
  apiOrigin: import.meta.env.VITE_API_ORIGIN || "http://127.0.0.1:8000",
  googleClientId: import.meta.env.VITE_GOOGLE_CLIENT_ID || "",
  googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || "",
  cloudinaryCloudName: import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || "",
  cloudinaryUploadPreset: import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || "",
};
