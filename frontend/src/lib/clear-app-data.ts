export function clearAppData() {
  if (typeof window === "undefined") return;

  try {
    // 1. Limpar localStorage e sessionStorage
    window.localStorage.clear();
    window.sessionStorage.clear();

    // 2. Limpar caches do Cache API
    if ("caches" in window) {
      caches.keys().then((names) => {
        names.forEach((name) => {
          caches.delete(name);
        });
      }).catch((err) => console.error("Erro ao limpar caches:", err));
    }

    // 3. Remover Service Workers
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.getRegistrations().then((registrations) => {
        registrations.forEach((registration) => {
          registration.unregister();
        });
      }).catch((err) => console.error("Erro ao remover service workers:", err));
    }
    
    console.log("[App] Dados locais limpos com sucesso.");
  } catch (err) {
    console.error("Erro ao limpar dados do aplicativo:", err);
  }
}
