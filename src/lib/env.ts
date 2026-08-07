export const env = {
  apiOrigin: import.meta.env.VITE_API_ORIGIN || "http://localhost:8000",
  googleClientId: import.meta.env.VITE_GOOGLE_CLIENT_ID || "",
  cloudinaryCloudName: import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || "",
  cloudinaryUploadPreset: import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || "",
};
