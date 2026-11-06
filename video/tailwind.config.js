// The app's own Tailwind config, scanning the app's components as well as
// the video's, so every class the staged components use is generated as it
// is in the app. Loaded by Tailwind (through jiti), from remotion.config.ts.
import root from "../tailwind.config.js";

export default {
  ...root,
  content: {
    relative: true,
    files: ["../src/**/*.{ts,tsx}", "./src/**/*.{ts,tsx}"],
  },
};
