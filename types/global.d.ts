// types/global.d.ts
// Global type declarations for browser APIs TypeScript doesn't include by default

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>
}

interface Window {
  deferredPrompt: BeforeInstallPromptEvent | null
  dataLayer: unknown[]
  gtag: (
    command: 'config' | 'event' | 'js' | 'set',
    targetId: string,
    config?: Record<string, unknown>
  ) => void;
  fbq: {
    (...args: unknown[]): void;
    q?: unknown[];
    loaded?: boolean;
  };
  Razorpay: new (options: Record<string, unknown>) => {
    open(): void;
    on(event: string, callback: (response: Record<string, unknown>) => void): void;
  };
}

interface ServiceWorkerRegistration {
  readonly sync?: {
    register(tag: string): Promise<void>
  }
  readonly periodicSync?: {
    register(tag: string, options?: { minInterval: number }): Promise<void>
  }
}
