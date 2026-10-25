// The little of Node that vite.config.ts uses, declared here because the
// project has no @types/node. Only tsconfig.node.json includes this file.

declare const process: { env: Record<string, string | undefined> }

declare module 'node:child_process' {
  export function execFileSync(file: string, args: string[], options: { stdio: 'pipe' }): unknown
}

declare module 'node:fs' {
  export function existsSync(path: string): boolean
  export function mkdirSync(path: string, options: { recursive: true }): void
  export function readFileSync(path: string, encoding: 'utf8'): string
}

declare module 'node:os' {
  interface NetworkAddress {
    address: string
    family: string
    internal: boolean
  }
  export function networkInterfaces(): Record<string, NetworkAddress[] | undefined>
}
