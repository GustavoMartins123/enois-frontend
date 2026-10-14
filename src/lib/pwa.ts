/**
 * Registro do service worker (PWA).
 *
 * Fica desligado em desenvolvimento: o SW serve do cache e atrapalharia o HMR.
 */
export function registerServiceWorker(): void {
  if (typeof window === "undefined" || !("serviceWorker" in navigator)) return;
  if (import.meta.env.DEV) return;

  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/sw.js", { scope: "/" }).catch((error) => {
      console.error("Falha ao registrar o service worker", error);
    });
  });
}
