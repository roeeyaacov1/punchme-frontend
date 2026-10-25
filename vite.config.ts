import { execFileSync } from 'node:child_process'
import { existsSync, mkdirSync, readFileSync } from 'node:fs'
import { networkInterfaces } from 'node:os'
import { defineConfig } from 'vite'
import { configDefaults } from 'vitest/config'
import react from '@vitejs/plugin-react'

// `npm run dev:phone` serves the app to a phone on the same network. The
// phone can't reach the backend at 127.0.0.1 (that is the phone itself), so
// the API goes through this server: the app is told its API lives at this
// server's own LAN address, and /api is passed on to the local backend.
// It is HTTPS because a LAN address over plain HTTP is not a secure context,
// and there the phone has no Share and no clipboard.
const PHONE_PORT = 5180

/** An HTTPS certificate for `host`, from mkcert's local CA, which each phone
 * trusts once (README.md, "Testing on a phone"). Made the first time a host
 * is served and kept under node_modules/.vite, so a new address needs nothing
 * from the phones. */
function phoneCertificate(host: string): { key: string; cert: string } {
  const dir = 'node_modules/.vite/phone-cert'
  const cert = `${dir}/${host}.pem`
  const key = `${dir}/${host}-key.pem`
  if (!existsSync(cert) || !existsSync(key)) {
    mkdirSync(dir, { recursive: true })
    try {
      execFileSync('mkcert', ['-cert-file', cert, '-key-file', key, host], { stdio: 'pipe' })
    } catch (error) {
      const { code, stderr } = error as { code?: string; stderr?: unknown }
      throw new Error(
        code === 'ENOENT'
          ? 'dev:phone makes its HTTPS certificate with mkcert, which is not on PATH. ' +
            'Install it with `winget install FiloSottile.mkcert` and open a new terminal; ' +
            'README.md, "Testing on a phone", has the rest.'
          : `mkcert could not make the phone's certificate: ${String(stderr ?? error)}`,
      )
    }
  }
  return { key: readFileSync(key, 'utf8'), cert: readFileSync(cert, 'utf8') }
}

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
  const host = phone ? lanAddress() : ''
  if (phone) {
    // Read by Vite's env loading, which ranks the process's own variables
    // above .env, so .env's 127.0.0.1 stays for every other mode. HTTPS like
    // the page, or the browser blocks the calls as mixed content.
    process.env.VITE_API_ORIGIN = `https://${host}:${PHONE_PORT}`
  }
  return {
    plugins: [react()],
    server: phone
      ? {
          host: true,
          // Beside the usual server rather than instead of it.
          port: PHONE_PORT,
          strictPort: true,
          https: phoneCertificate(host),
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
