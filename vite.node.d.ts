// The little of Node that vite.config.ts uses, declared here because the
// project has no @types/node. Only tsconfig.node.json includes this file.

declare const process: { env: Record<string, string | undefined> }

declare module 'node:os' {
  interface NetworkAddress {
    address: string
    family: string
    internal: boolean
  }
  export function networkInterfaces(): Record<string, NetworkAddress[] | undefined>
}
