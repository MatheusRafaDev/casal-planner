import { useEffect, useState } from "react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

interface UsePwaReturn {
  /** true quando o app está rodando como PWA instalado */
  isInstalled: boolean;
  /** evento capturado — null até o browser disparar beforeinstallprompt */
  installPrompt: BeforeInstallPromptEvent | null;
  /** dispara o prompt nativo de instalação */
  triggerInstall: () => Promise<"accepted" | "dismissed" | null>;
}

export function usePwa(): UsePwaReturn {
  const [isInstalled, setIsInstalled] = useState(false);
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);

  useEffect(() => {
    // Detectar se já está rodando como PWA instalado
    const mql = window.matchMedia("(display-mode: standalone)");
    setIsInstalled(mql.matches || (navigator as { standalone?: boolean }).standalone === true);
    const handleChange = (e: MediaQueryListEvent) => setIsInstalled(e.matches);
    mql.addEventListener("change", handleChange);

    // Capturar o evento de instalação
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setInstallPrompt(e as BeforeInstallPromptEvent);
    };
    window.addEventListener("beforeinstallprompt", handleBeforeInstall);

    // Detectar quando o usuário conclui a instalação
    const handleAppInstalled = () => {
      setInstallPrompt(null);
      setIsInstalled(true);
    };
    window.addEventListener("appinstalled", handleAppInstalled);

    // Registrar o service worker (client-only — nunca durante SSR)
    if ("serviceWorker" in navigator) {
      if (import.meta.env.DEV) {
        // Remove o service worker no ambiente de desenvolvimento para não cachear o localhost
        navigator.serviceWorker.getRegistrations().then((registrations) => {
          for (const registration of registrations) {
            registration.unregister();
            console.log("[PWA] Service Worker desativado em desenvolvimento.");
          }
        });
      } else {
        navigator.serviceWorker
          .register("/sw.js", { scope: "/" })
          .then((reg) => {
            console.log("[PWA] Service Worker registrado:", reg.scope);
          })
          .catch((err) => {
            console.warn("[PWA] Falha ao registrar Service Worker:", err);
          });
      }
    }

    return () => {
      mql.removeEventListener("change", handleChange);
      window.removeEventListener("beforeinstallprompt", handleBeforeInstall);
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  const triggerInstall = async (): Promise<"accepted" | "dismissed" | null> => {
    if (!installPrompt) return null;
    await installPrompt.prompt();
    const { outcome } = await installPrompt.userChoice;
    if (outcome === "accepted") setInstallPrompt(null);
    return outcome;
  };

  return { isInstalled, installPrompt, triggerInstall };
}
