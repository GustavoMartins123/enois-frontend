/**
 * Registro do service worker (PWA).
 *
 * Fica desligado em desenvolvimento: o SW serve do cache e atrapalharia o HMR.
 *
 * Em produção, quando um novo SW assume (novo deploy), a página recarrega uma vez para o usuário
 * sair do bundle antigo sem precisar de hard refresh.
 */
export function registerServiceWorker(): void {
  if (typeof window === "undefined" || !("serviceWorker" in navigator)) return;
  if (import.meta.env.DEV) return;

  // Só recarrega se já havia um SW controlando a página (evita reload no primeiro acesso).
  let hadController = !!navigator.serviceWorker.controller;
  let reloading = false;

  navigator.serviceWorker.addEventListener("controllerchange", () => {
    if (!hadController || reloading) return;
    reloading = true;
    window.location.reload();
  });

  const register = () => {
    navigator.serviceWorker
      .register("/sw.js", { scope: "/" })
      .then((registration) => {
        hadController = !!navigator.serviceWorker.controller;
        // Verifica atualização a cada carregamento, não só no ciclo padrão do navegador.
        return registration.update();
      })
      .catch((error) => {
        console.error("Falha ao registrar o service worker", error);
      });
  };

  // Este código roda num useEffect, ou seja, depois do SSR hidratar. Em vários casos a hidratação
  // acontece depois do evento `load`, então esperar por `load` nunca registraria o service worker —
  // e sem SW ativo o Chrome não considera o app instalável (PWA).
  if (document.readyState === "complete") {
    register();
  } else {
    window.addEventListener("load", register, { once: true });
  }
}
