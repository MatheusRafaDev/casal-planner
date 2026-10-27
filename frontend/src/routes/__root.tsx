import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { AuthProvider } from "@/lib/auth-context";
import { ThemeProvider } from "@/lib/theme-context";
import { Toaster } from "@/components/ui/sonner";
import { clearAppData } from "@/lib/clear-app-data";
import { api } from "@/lib/api";
import { BrandLogoText, BrandLogoIcon } from "@/components/ui/BrandLogo";
import { BRAND_CONFIG } from "@/design-system";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 font-sans">
      <div className="card-sticker-lg max-w-md w-full text-center p-8 bg-card shadow-[5px_5px_0_var(--border)]">
        <div className="mb-6 flex items-center justify-center gap-3">
          <BrandLogoIcon size="lg" className="h-10 w-10" />
          <BrandLogoText size="lg" />
        </div>
        <h1 className="text-7xl font-display font-bold text-primary">404</h1>
        <h2 className="mt-4 text-2xl font-display font-bold text-foreground">
          Página não encontrada
        </h2>
        <p className="mt-2 text-base text-muted-foreground font-medium">
          O endereço acessado não existe ou foi movido.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="btn-sticker inline-flex items-center justify-center bg-primary text-primary-foreground px-6 py-2.5 text-base font-bold"
          >
            Voltar ao início
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: unknown; reset: () => void }) {
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 font-sans">
      <div className="card-sticker-lg max-w-md w-full text-center p-8 bg-card shadow-[5px_5px_0_var(--border)]">
        <h1 className="text-2xl font-display font-bold text-foreground">
          Esta página não carregou
        </h1>
        <p className="mt-2 text-base text-muted-foreground font-medium">
          Algo deu errado. Tente novamente ou volte para o início.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <button
            onClick={reset}
            className="btn-sticker inline-flex items-center justify-center bg-primary text-primary-foreground px-5 py-2.5 text-sm font-bold cursor-pointer"
          >
            Tentar novamente
          </button>
          <a
            href="/"
            className="btn-sticker inline-flex items-center justify-center bg-card text-foreground px-5 py-2.5 text-sm font-bold"
          >
            Início
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1, viewport-fit=cover" },
      { title: `${BRAND_CONFIG.name} | ${BRAND_CONFIG.slogan}` },
      {
        name: "description",
        content: BRAND_CONFIG.description,
      },
      { name: "author", content: BRAND_CONFIG.author },
      { property: "og:title", content: `${BRAND_CONFIG.name} | ${BRAND_CONFIG.slogan}` },
      {
        property: "og:description",
        content: BRAND_CONFIG.description,
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      // PWA
      { name: "theme-color", content: BRAND_CONFIG.themeColor },
      { name: "mobile-web-app-capable", content: "yes" },
      { name: "apple-mobile-web-app-capable", content: "yes" },
      { name: "apple-mobile-web-app-status-bar-style", content: "default" },
      { name: "apple-mobile-web-app-title", content: BRAND_CONFIG.name },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "icon", href: `${BRAND_CONFIG.assets.faviconSvg}?v=7`, type: "image/svg+xml" },
      { rel: "icon", href: `${BRAND_CONFIG.assets.faviconPng}?v=7`, type: "image/png" },
      { rel: "shortcut icon", href: "/favicon.ico?v=7" },
      { rel: "apple-touch-icon", href: `${BRAND_CONFIG.assets.appleTouchIcon}?v=7` },
      { rel: "manifest", href: "/manifest.json?v=7" },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&family=Outfit:wght@500;600;700;800&family=Caveat:wght@600&display=swap",
      },
    ],
    scripts: [
      {
        src: "https://accounts.google.com/gsi/client",
        async: true,
        defer: true,
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <head suppressHydrationWarning>
        <HeadContent />
        <script
          suppressHydrationWarning
          dangerouslySetInnerHTML={{
            __html: `
              try {
                document.documentElement.classList.remove('dark');
                document.documentElement.classList.add('light');
                localStorage.removeItem('cp_theme');
              } catch (e) {}
            `,
          }}
        />
      </head>
      <body suppressHydrationWarning>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  useEffect(() => {
    // Keep-alive: ping no backend a cada 14 minutos para evitar cold starts (ex: Render) enquanto a aba estiver aberta
    const keepAliveInterval = setInterval(
      () => {
        api("/api/health").catch(() => {});
      },
      14 * 60 * 1000,
    );

    return () => clearInterval(keepAliveInterval);
  }, []);

  useEffect(() => {
    if (import.meta.env.DEV) {
      if (!sessionStorage.getItem("app_initialized")) {
        clearAppData();
        sessionStorage.setItem("app_initialized", "true");
      }
    }

    // Capturar erro de lazy loading do Vite (ex: Vercel deployou novos chunks e o PWA tentou buscar os antigos)
    const handlePreloadError = (e: Event) => {
      e.preventDefault();
      window.location.reload();
    };
    window.addEventListener("vite:preloadError", handlePreloadError);

    return () => {
      window.removeEventListener("vite:preloadError", handlePreloadError);
    };
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ThemeProvider>
          <Outlet />
          <Toaster richColors position="top-right" closeButton />
        </ThemeProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}
