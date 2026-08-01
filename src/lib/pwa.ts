const INSTALL_DISMISS_KEY = 'bm_install_dismissed_at';
const INSTALL_DISMISS_MS = 7 * 24 * 60 * 60 * 1000;

export interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

export const UPDATE_READY_EVENT = 'bm-update-ready';

export function registerServiceWorker(): void {
  if (!('serviceWorker' in navigator)) return;
  if (import.meta.env.PROD !== true) return;

  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').then(
      (registration) => {
        let newWorker: ServiceWorker | null = null;

        registration.addEventListener('updatefound', () => {
          newWorker = registration.installing;
          if (!newWorker) return;

          newWorker.addEventListener('statechange', () => {
            if (
              newWorker?.state === 'installed' &&
              navigator.serviceWorker.controller
            ) {
              const skipWaiting = () => {
                newWorker?.postMessage({ type: 'SKIP_WAITING' });
              };
              window.dispatchEvent(
                new CustomEvent(UPDATE_READY_EVENT, { detail: { skipWaiting } })
              );
            }
          });
        });

        registration.update().catch(() => {});
      },
      () => {}
    );

    navigator.serviceWorker.addEventListener('controllerchange', () => {
      window.location.reload();
    });
  });
}

export function isStandalone(): boolean {
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    (navigator as unknown as { standalone?: boolean }).standalone === true
  );
}

export function isIOS(): boolean {
  return /iphone|ipad|ipod/i.test(navigator.userAgent);
}

export function shouldShowInstallPrompt(): boolean {
  if (isStandalone()) return false;
  const dismissedAt = parseInt(localStorage.getItem(INSTALL_DISMISS_KEY) || '0', 10);
  if (Date.now() - dismissedAt < INSTALL_DISMISS_MS) return false;
  return true;
}

export function dismissInstallPrompt(): void {
  localStorage.setItem(INSTALL_DISMISS_KEY, String(Date.now()));
}

export function markAppInstalled(): void {
  localStorage.setItem(INSTALL_DISMISS_KEY, String(Date.now()));
}
