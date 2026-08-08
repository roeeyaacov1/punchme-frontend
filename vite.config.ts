import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // Pinned, and strict so we fail loudly instead of drifting to 5174 when
    // 5173 is busy: http://localhost:5173 is the origin registered as an
    // Authorized JavaScript origin on the Google OAuth client, and Google
    // blocks the sign-in button on any origin that isn't registered.
    port: 5173,
    strictPort: true,
  },
})
