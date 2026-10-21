import { networkInterfaces } from 'node:os'
import { defineConfig } from 'vite'
import { configDefaults } from 'vitest/config'
import react from '@vitejs/plugin-react'

// `npm run dev:phone` serves the app to a phone on the same network. The
// phone can't reach the backend at 127.0.0.1 (that is the phone itself), so
// the API goes through this server: the app is told its API lives at this
// server's own LAN address, and /api is passed on to the local backend.
const PHONE_PORT = 5180

/** This PC's address on the local network: the first real adapter's IPv4,
 * skipping Hyper-V's and WSL's virtual ones. PHONE_HOST overrides it. */
function lanAddress(): string {
  if (process.env.PHONE_HOST) return process.env.PHONE_HOST
  for (const [name, addresses] of Object.entries(networkInterfaces())) {
    if (/^vEthernet|virtual|loopback/i.test(name)) continue
    const ipv4 = addresses?.find((a) => a.family === 'IPv4' && !a.internal)
    if (ipv4) return ipv4.address
  }
  throw new Error('No network address found for the phone. Set PHONE_HOST.')
}

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const phone = mode === 'phone'
  if (phone) {
    // Read by Vite's env loading, which ranks the process's own variables
    // above .env, so .env's 127.0.0.1 stays for every other mode.
    process.env.VITE_API_ORIGIN = `http://${lanAddress()}:${PHONE_PORT}`
  }
  return {
    plugins: [react()],
    server: phone
      ? {
          host: true,
          // Beside the usual server rather than instead of it.
          port: PHONE_PORT,
          strictPort: true,
          proxy: {
            '/api': { target: 'http://127.0.0.1:8000', changeOrigin: true },
          },
        }
      : {
          // Pinned, and strict so we fail loudly instead of drifting to 5174
          // when 5173 is busy: http://localhost:5173 is the origin registered
          // as an Authorized JavaScript origin on the Google OAuth client, and
          // Google blocks the sign-in button on any origin that isn't
          // registered.
          port: 5173,
          strictPort: true,
        },
    test: {
      // Claude Code keeps session worktrees under .claude/worktrees, each a
      // full copy of the repo. Without this, every copy's tests run too.
      exclude: [...configDefaults.exclude, '.claude/**'],
    },
  }
})
