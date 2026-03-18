// types/global.d.ts
// Global type declarations for browser APIs TypeScript doesn't include by default

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>
}

interface Window {
  deferredPrompt: BeforeInstallPromptEvent | null
}

interface ServiceWorkerRegistration {
  sync?: {
    register(tag: string): Promise<void>
  }
  periodicSync?: {
    register(tag: string, options?: { minInterval: number }): Promise<void>
  }
}
